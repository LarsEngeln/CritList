<template>
  <UCard @click.stop>
    <div class="flex flex-col gap-3">
      <!-- File name + time -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-xs">{{ fileName }}</span>
        <span class="text-xs font-mono text-neutral-400">{{ fmt(currentTimeS) }} / {{ fmt(duration) }}</span>
      </div>

      <!-- Progress bar -->
      <div
        ref="barRef"
        class="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 cursor-pointer relative select-none"
        @mousedown="onBarMousedown"
      >
        <div
          class="h-full bg-primary-500 rounded-full transition-none pointer-events-none"
          :style="{ width: duration ? `${(currentTimeS / duration) * 100}%` : '0%' }"
        />
        <div
          v-for="(ann, i) in annotations"
          :key="i"
          class="absolute top-0 h-full w-1 -translate-x-0.5 rounded-full opacity-80 cursor-pointer"
          :style="{ left: `${(ann.timeMs / 1000 / duration) * 100}%`, background: colorMap[ann.type] || '#fb923c' }"
          :title="`${fmt(ann.timeMs / 1000)}${ann.type ? ' · ' + ann.type : ''}: ${ann.text}`"
          @click.stop="emit('seek-time', ann.timeMs / 1000)"
        />
      </div>

      <!-- Controls + hints -->
      <div class="flex items-center gap-3">
        <UButton :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" size="lg" @click="emit('toggle-play-pause')" />
        <span class="text-xs text-neutral-400 flex-1 leading-relaxed">
          <template v-if="isCreating">
            ✏️ New annotation —
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Enter</kbd> save &nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Shift+Enter</kbd> line break &nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Esc</kbd> cancel
          </template>
          <template v-else-if="selectedIdx >= 0">
            🎯 Annotation selected —
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">←/→</kbd> ±0.5 s &nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">↑/↓</kbd> navigate &nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Del</kbd> delete &nbsp;
            type to edit &nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Esc</kbd> deselect
          </template>
          <template v-else>
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Space</kbd> play/pause &nbsp;·&nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">←/→</kbd> ±1 s &nbsp;·&nbsp;
            <kbd class="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">↑/↓</kbd> select &nbsp;·&nbsp;
            any key to annotate
          </template>
        </span>
        <UButton
          :icon="eqOpen ? 'i-lucide-sliders-horizontal' : 'i-lucide-sliders-horizontal'"
          size="sm"
          :variant="eqOpen ? 'solid' : 'outline'"
          :color="eqOpen ? 'primary' : 'neutral'"
          label="EQ"
          @click="emit('toggle-eq')"
        />
        <UButton
          v-if="annotations.length"
          icon="i-lucide-download"
          size="sm"
          variant="outline"
          label="Export CSV"
          @click="emit('export-csv')"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Annotation { timeMs: number; text: string; type: string }

const props = defineProps<{
  fileName: string
  isPlaying: boolean
  currentTimeS: number
  duration: number
  annotations: Annotation[]
  colorMap: Record<string, string>
  isCreating: boolean
  selectedIdx: number
  eqOpen: boolean
}>()

const emit = defineEmits<{
  'toggle-play-pause': []
  'seek-ratio': [ratio: number]
  'seek-time': [timeS: number]
  'export-csv': []
  'toggle-eq': []
}>()

function fmt(s: number): string {
  const ms = Math.floor((s % 1) * 1000)
  const sec = Math.floor(s % 60)
  const min = Math.floor(s / 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

const barRef = ref<HTMLElement | null>(null)
let scrubbing = false

function seekFromEvent(e: MouseEvent) {
  if (!barRef.value) return
  const rect = barRef.value.getBoundingClientRect()
  emit('seek-ratio', Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
}

function onBarMousedown(e: MouseEvent) {
  e.preventDefault()
  scrubbing = true
  seekFromEvent(e)
  window.addEventListener('mousemove', onWindowMousemove)
  window.addEventListener('mouseup', onWindowMouseup)
}

function onWindowMousemove(e: MouseEvent) {
  if (scrubbing) seekFromEvent(e)
}

function onWindowMouseup() {
  scrubbing = false
  window.removeEventListener('mousemove', onWindowMousemove)
  window.removeEventListener('mouseup', onWindowMouseup)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onWindowMousemove)
  window.removeEventListener('mouseup', onWindowMouseup)
})
</script>
