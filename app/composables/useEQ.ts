import type { Ref } from 'vue'
import { type EQBand, type EQPreset, createFlatBands } from '~/data/eqPresets'

export function useEQ(audioRef: Ref<HTMLAudioElement | null>) {
  const bands = ref<EQBand[]>(createFlatBands())
  const bypass = ref(false)
  const preAmp = ref(0.0)

  let ctx: AudioContext | null = null
  let source: MediaElementAudioSourceNode | null = null
  let preAmpNode: GainNode | null = null
  let filters: BiquadFilterNode[] = []
  let initialized = false

  function applyBandToFilter(band: EQBand, f: BiquadFilterNode) {
    f.type = band.type
    f.frequency.value = band.frequency
    f.gain.value = band.enabled ? band.gain : 0 // BiquadFilterNode's gain is in db
    f.Q.value = band.Q
  }

  function connectChain() {
    if (!source || !ctx || filters.length === 0) return

    try { source.disconnect() }
    catch { /* already disconnected */ }
    filters.forEach((f) => { try { f.disconnect() } catch { /* ok */ } })

    if (bypass.value) {
      source.connect(ctx.destination)
    }
    else {
      source.connect(preAmpNode!)
      preAmpNode!.connect(filters[0]!)
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i]!.connect(filters[i + 1]!)
      }
      filters[filters.length - 1]!.connect(ctx.destination)
    }
  }

  function syncFilters() {
    bands.value.forEach((band, i) => {
      if (filters[i]) applyBandToFilter(band, filters[i]!)
    })
  }

  // initialise audio graph on first play as a "user interaction" is needed
  function init() {
    const el = audioRef.value
    if (!el || initialized) return
    initialized = true

    ctx = new AudioContext()
    source = ctx.createMediaElementSource(el)
    preAmpNode = ctx.createGain()
    preAmpNode.gain.value = Math.pow(10, preAmp.value / 20) // convert dB to linear gain

    filters = bands.value.map((band) => {
      const f = ctx!.createBiquadFilter()
      applyBandToFilter(band, f)
      return f
    })
    connectChain()
  }

  function onPlay() {
    if (!initialized) init()
    if (ctx?.state === 'suspended') ctx.resume()
  }

  // Watch for the audio element being mounted (happens when first file is loaded)
  watch(audioRef, (el) => {
    if (el) el.addEventListener('play', onPlay)
  }, { immediate: true })

  // Sync filter params reactively whenever bands change
  watch(bands, () => syncFilters(), { deep: true })

  // Rewire the graph when bypass is toggled
  watch(bypass, () => connectChain())

  // Update preamp gain
  watch(preAmp, () => {
    if (preAmpNode) preAmpNode.gain.value = Math.pow(10, preAmp.value / 20)
  })


  function loadPreset(preset: EQPreset) {
    bands.value = preset.bands.map(b => ({ ...b }))
    preAmp.value = preset.gain
  }

  function resetBands() {
    bands.value = createFlatBands()
  }

  onUnmounted(() => {
    try { source?.disconnect() } catch {}
    filters.forEach((f) => { try { f.disconnect() } catch {} })
    ctx?.close()
  })

  return { bands, bypass, preAmp, loadPreset, resetBands }
}
