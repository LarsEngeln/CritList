<template>
  <UCard @click.stop>
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        <UIcon name="i-lucide-sliders-horizontal" class="text-neutral-400 shrink-0" />
        <span class="text-sm font-medium mr-1">Equalizer</span>

        <!-- Preset picker -->
        <select
          v-model="selectedPresetId"
          class="text-xs rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
          @change="onPresetChange"
        >
          <option value="">— select preset —</option>
          <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>

        <div class="flex items-center gap-2 ml-auto">
          <span class="text-xs text-neutral-400" :class="bypassModel ? 'text-primary-500 font-medium' : ''">Bypass</span>
          <USwitch v-model="bypassModel" size="sm" />
        </div>
      </div>

      <!-- Band columns -->
      <div
        class="flex gap-1 overflow-hidden pb-1"
        :class="bypassModel ? 'opacity-40 pointer-events-none' : ''"
      >
        <!-- Global pre-Amp -->
      <div
        class="flex flex-col items-center gap-1 mr-7 min-w-[68px] max-w-[68px]"
      >
        <UIcon name="i-lucide-volume-2" class="text-neutral-400 shrink-0" />
        <span class="text-xs font-medium">pre-Amp</span>
        <div class="eq-slider-track">
          <input
            type="range"
            min="-24"
            max="6"
            step="0.1"
            :value="preAmpModel"
            class="eq-slider"
            @input="setPreAmp(parseFloat(($event.target as HTMLInputElement).value))"
          />
        </div>
        <div class="flex items-center w-full">
          <input
            type="number"
            min="-24"
            max="6"
            step="0.1"
            :value="preAmpModel"
            class="eq-num-input"
            @change="setPreAmp(parseFloat(($event.target as HTMLInputElement).value))"
          />
          <span class="text-[9px] text-neutral-400 ml-0.5 shrink-0">dB</span>
        </div>
      </div>

        <div
          v-for="(band, i) in bandsModel"
          :key="i"
          class="flex flex-col items-center gap-1 min-w-[68px] max-w-[68px]"
          :class="!band.enabled ? 'opacity-50' : ''"
        >
          <!-- enable toggle -->
          <div class="flex items-center gap-1 w-full justify-center">
            <input
              type="checkbox"
              :checked="band.enabled"
              class="w-3 h-3 accent-primary-500 cursor-pointer"
              @change="setBandProp(i, 'enabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="text-[12px] font-mono text-neutral-600 dark:text-neutral-500 leading-none">{{ i }}</span>
          </div>

          <!-- Filter type -->
          <select
            :value="band.type"
            class="w-full text-[10px] rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-1 py-0.5 cursor-pointer focus:outline-none"
            @change="setBandProp(i, 'type', ($event.target as HTMLSelectElement).value as BiquadFilterType)"
          >
            <option value="peaking">Peak</option>
            <option value="lowshelf">Lo Shelf</option>
            <option value="highshelf">Hi Shelf</option>
            <option value="notch">Notch</option>
            <option value="lowpass">LP</option>
            <option value="highpass">HP</option>
          </select>

          <!-- Vertical gain slider -->
          <div class="eq-slider-track">
            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              :value="band.gain"
              class="eq-slider"
              :disabled="!band.enabled"
              @input="setBandProp(i, 'gain', parseFloat(($event.target as HTMLInputElement).value))"
            />
          </div>

          <!-- Gain input -->
          <div class="flex items-center w-full">
            <input
              type="number"
              min="-12"
              max="12"
              step="0.1"
              :value="band.gain"
              class="eq-num-input"
              :disabled="!band.enabled"
              @change="setBandProp(i, 'gain', clampGain(parseFloat(($event.target as HTMLInputElement).value)))"
            />
            <span class="text-[9px] text-neutral-400 ml-0.5 shrink-0">dB</span>
          </div>

          <!-- Frequency input -->
          <div class="flex items-center w-full">
            <input
              type="number"
              min="20"
              max="20000"
              step="1"
              :value="band.frequency"
              class="eq-num-input"
              @change="setBandProp(i, 'frequency', clampFreq(parseFloat(($event.target as HTMLInputElement).value)))"
            />
            <span class="text-[9px] text-neutral-400 ml-0.5 shrink-0">Hz</span>
          </div>

          <!-- Q input -->
          <div class="flex items-center w-full">
            <input
              type="number"
              min="0.1"
              max="20"
              step="0.01"
              :value="band.Q"
              class="eq-num-input"
              @change="setBandProp(i, 'Q', clampQ(parseFloat(($event.target as HTMLInputElement).value)))"
            />
            <span class="text-[9px] text-neutral-400 ml-0.5 shrink-0">Q</span>
          </div>

          <!-- BW / S -->
          <span class="text-[9px] text-center font-mono text-neutral-400 leading-none h-3">{{ bwHint(band) }}</span>
        </div>
      </div>

    </div>
  </UCard>
</template>

<script setup lang="ts">
import { type EQBand, EQ_PRESETS, type EQPreset } from '~/data/eqPresets'

const props = defineProps<{
  presets: EQPreset[]
}>()

const emit = defineEmits<{
  'load-preset': [preset: EQPreset]
  'reset': []
  'update:preAmp': [value: number]
}>()

const bandsModel = defineModel<EQBand[]>('bands', { required: true })
const preAmpModel = defineModel<number>('preAmp', { required: true })
const bypassModel = defineModel<boolean>('bypass', { required: true })

const selectedPresetId = ref('')

function onPresetChange() {
  const preset = props.presets.find(p => p.id === selectedPresetId.value)
  if (preset) emit('load-preset', preset)
}

function setBandProp<K extends keyof EQBand>(index: number, key: K, value: EQBand[K]) {
  bandsModel.value = bandsModel.value.map((b, i) =>
    i === index ? { ...b, [key]: value } : b,
  )
}

function setPreAmp(value: number) {
  preAmpModel.value = clampGain(value);
}

function clampGain(v: number) { return isNaN(v) ? 0 : Math.max(-24, Math.min(12, v)) }
function clampFreq(v: number) { return isNaN(v) ? 1000 : Math.max(10, Math.min(24000, v)) }
function clampQ(v: number) { return isNaN(v) ? 1 : Math.max(0.1, Math.min(20, v)) }


function fmtFreq(hz: number): string {
  if (hz >= 1000) return `${hz / 1000 % 1 === 0 ? hz / 1000 : (hz / 1000).toFixed(1)}k`
  return `${hz}`
}

// BW in octaves for peaking/notch; slope S label for shelves; empty for LP/HP
function bwHint(band: EQBand): string {
  const Q = band.Q
  let result = "";
 // if (band.type === 'peaking' || band.type === 'notch' || band.type === 'bandpass') {
    const term = Math.sqrt(4 * Q * Q + 1)
    const bw = Math.log2((term + 1) / (term - 1))
    result = `${bw.toFixed(2)} oct`
  //}
  if (band.type === 'lowshelf' || band.type === 'highshelf') {
    // S (shelf slope) ≈ 1/Q for 2nd-order shelf interpretation
    result += ` S=${(1 / Q).toFixed(2)}`
  }
  return result
}
</script>

<style scoped>
.eq-slider-track {
  position: relative;
  height: 80px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.eq-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  transform: rotate(-90deg);
  accent-color: var(--color-primary-500, #22c55e);
  outline: none;
}

/* Track */
.eq-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, currentColor 15%, transparent);
}
.eq-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, currentColor 15%, transparent);
}

/* Thumb */
.eq-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary-500, #22c55e);
  margin-top: -4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}
.eq-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary-500, #22c55e);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}

.eq-slider:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Shared number input style */
.eq-num-input {
  width: 0;
  flex: 1;
  min-width: 0;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  text-align: right;
  padding: 1px 3px;
  border-radius: 4px;
  border: 1px solid var(--ui-border, #e5e7eb);
  background: transparent;
  color: inherit;
  appearance: textfield;
  -moz-appearance: textfield;
  outline: none;
}
.eq-num-input::-webkit-inner-spin-button,
.eq-num-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.eq-num-input:focus {
  border-color: var(--color-primary-500, #22c55e);
}
.eq-num-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Dark mode border */
@media (prefers-color-scheme: dark) {
  .eq-num-input {
    border-color: var(--ui-border, #374151);
  }
}
</style>
