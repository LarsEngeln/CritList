<template>
  <div class="flex flex-col gap-2 min-h-0">
    <AnnotationForm
      :is-creating="isCreating"
      :new-time-ms="newTimeMs"
      :new-text="newText"
      :new-type="newType"
      :known-types="knownTypes"
      :color-map="colorMap"
      @update:new-text="emit('update:newText', $event)"
      @update:new-type="emit('update:newType', $event)"
      @start="emit('start')"
      @save="emit('save')"
      @cancel="emit('cancel')"
    />

    <template v-if="annotations.length">
    <!-- Header -->
    <div class="flex items-center justify-between px-1 mt-4">
      <span class="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
        Annotations ({{ visibleCount }}<template v-if="hiddenTypes.size">/{{ annotations.length }}</template>)
      </span>
      <div class="flex items-center gap-1">
        <UButton
          :icon="sortDesc ? 'i-lucide-arrow-down-narrow-wide' : 'i-lucide-arrow-up-narrow-wide'"
          size="xs"
          variant="ghost"
          :title="sortDesc ? 'Earliest first' : 'Latest first'"
          @click="emit('update:sortDesc', !sortDesc)"
        />
      </div>
    </div>

    <!-- Type visibility filters -->
    <div v-if="allTypes.length" class="flex flex-wrap gap-1 px-1">
      <UButton
        v-for="t in allTypes"
        :key="t"
        class="text-xs font-medium px-1.5 py-0.5 rounded hover:opacity-70 transition-opacity whitespace-nowrap cursor-pointer"
        :style="typeStyle(t, !hiddenTypes.has(t))"
        :title="hiddenTypes.has(t) ? 'Show' : 'Hide'"
        @click="toggleType(t)"
      >
        <UIcon v-if="hiddenTypes.has(t)" name="i-lucide-eye-off" class="w-3 h-2" />
        <span>{{ t || '(no type)' }}</span>
      </UButton>
    </div>

    <!-- Scrollable items -->
    <div ref="scrollContainerRef" style="border-bottom: 1px solid rgb(242, 242, 242);" class="relative overflow-y-auto flex flex-col gap-2 p-2 pr-1 pl-0 flex-1 min-h-0 max-h-[calc(100vh-600px)]">
      <template v-for="(pair, displayIdx) in displayPairs" :key="pair.idx">
        <div :ref="(el) => { if (el) annRefs[pair.idx] = el as HTMLElement }">
          <!-- Hidden indicator -->
          <div
            v-if="hiddenTypes.has(pair.ann.type)"
            class="w-1.5 h-1.5 rounded-full "
            :style="{ background: colorMap[pair.ann.type] || 'rgb(171, 171, 171)' }"
            :title="pair.ann.text || '(no type)'"
          />
          <!-- Full annotation item -->
          <AnnotationItem
            v-else
            :annotation="pair.ann"
            :index="pair.idx"
            :selected="selectedIdx === pair.idx"
            :is-active="pair.idx === activeIdx"
            :is-text-editing="editIdx === pair.idx"
            :edit-text="editIdx === pair.idx ? editText : ''"
            :edit-type="editIdx === pair.idx ? editType : ''"
            :is-type-editing="typeEditIdx === pair.idx"
            :type-edit-value="typeEditIdx === pair.idx ? typeEditValue : ''"
            :session-label="sessionLabels?.[pair.idx]"
            :known-types="knownTypes"
            :color-map="colorMap"
            @select="emit('select', $event)"
            @jump="emit('jump', $event)"
            @start-edit="emit('start-edit', $event)"
            @save-edit="emit('save-edit')"
            @cancel-edit="emit('cancel-edit')"
            @update:edit-text="emit('update:editText', $event)"
            @update:edit-type="emit('update:editType', $event)"
            @start-type-edit="emit('start-type-edit', $event)"
            @save-type-edit="emit('save-type-edit')"
            @cancel-type-edit="emit('cancel-type-edit')"
            @update:type-edit-value="emit('update:typeEditValue', $event)"
            @delete="emit('delete', $event)"
          />
        </div>
      </template>

      <!-- Single smoothly-moving playhead indicator -->
       <!-- 
      <div
        v-if="playheadTop !== null"
        class="absolute left-0 right-0 flex items-center gap-1 pointer-events-none z-10 transition-[top] duration-500 ease-out"
        :style="{ top: playheadTop + 'px' }"
      >
        <span class="text-xs font-mono text-neutral-400 dark:text-neutral-500 whitespace-nowrap -translate-y-1/2">{{ fmtMs(currentTimeMs) }} ▶</span>
      </div> -->
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Annotation { timeMs: number; text: string; type: string }

const props = defineProps<{
  isCreating: boolean
  newTimeMs: number | null
  newText: string
  newType: string
  currentTimeMs: number
  annotations: Annotation[]
  selectedIdx: number
  editIdx: number
  editText: string
  editType: string
  typeEditIdx: number
  typeEditValue: string
  knownTypes: string[]
  colorMap: Record<string, string>
  sortDesc: boolean
  sessionLabels?: string[]
}>()

const emit = defineEmits<{
  'update:newText': [string]
  'update:newType': [string]
  start: []
  save: []
  cancel: []
  select: [number]
  jump: [number]
  'start-edit': [number]
  'save-edit': []
  'cancel-edit': []
  'update:editText': [string]
  'update:editType': [string]
  'start-type-edit': [number]
  'save-type-edit': []
  'cancel-type-edit': []
  'update:typeEditValue': [string]
  delete: [number]
  'export-csv': []
  'update:sortDesc': [boolean]
}>()

const hiddenTypes = ref<Set<string>>(new Set())

const allTypes = computed(() => {
  const types = new Set(props.annotations.map(a => a.type))
  return [...types]
})

function toggleType(t: string) {
  const next = new Set(hiddenTypes.value)
  next.has(t) ? next.delete(t) : next.add(t)
  hiddenTypes.value = next
}

function typeStyle(t: string, visible: boolean) {
  const color = props.colorMap[t]
  if (color) {
    return visible
      ? { background: color + '22', borderColor: color, color }
      : { background: 'transparent', borderColor: color + '66', color: color + '88' }
  }
  return visible
    ? { background: '#f3f4f6', borderColor: '#d1d5db', color: '#6b7280' }
    : { background: 'transparent', borderColor: '#d1d5db88', color: '#9ca3af' }
}

const displayPairs = computed(() => {
  const pairs = props.annotations.map((ann, idx) => ({ ann, idx }))
  return props.sortDesc ? [...pairs].reverse() : pairs
})

const visibleCount = computed(() =>
  displayPairs.value.filter(({ ann }) => !hiddenTypes.value.has(ann.type)).length
)

const annRefs = ref<(HTMLElement | null)[]>([])
const scrollContainerRef = ref<HTMLElement | null>(null)

// Index in the original annotations array of the last annotation at/before playback position
const activeIdx = computed(() => {
  let result = -1
  for (let i = 0; i < props.annotations.length; i++) {
    if (props.annotations[i]!.timeMs <= props.currentTimeMs) result = i
    else break
  }
  return result
})

// Index in displayPairs before which to render the playhead line
const playheadDisplayIdx = computed(() => {
  const pairs = displayPairs.value
  if (!pairs.length) return -1
  if (props.sortDesc) {
    // Descending: high→low timeMs. Line before first item that has been passed (timeMs ≤ current).
    const idx = pairs.findIndex(({ ann }) => ann.timeMs <= props.currentTimeMs)
    return idx > 0 ? idx : -1
  }
  else {
    // Ascending: low→high timeMs. Line before first item not yet reached (timeMs > current).
    const idx = pairs.findIndex(({ ann }) => ann.timeMs > props.currentTimeMs)
    return idx > 0 ? idx : -1
  }
})

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const playheadTop = ref<number | null>(null)

function updatePlayheadTop() {
  const dIdx = playheadDisplayIdx.value
  if (dIdx < 0) { playheadTop.value = null; return }
  const pair = displayPairs.value[dIdx]
  if (!pair) { playheadTop.value = null; return }
  const el = annRefs.value[pair.idx]
  if (el) playheadTop.value = el.offsetTop
}

watch([playheadDisplayIdx, displayPairs], () => nextTick(updatePlayheadTop), { immediate: true })

watch(activeIdx, (idx) => {
  if (idx >= 0) nextTick(() => annRefs.value[idx]?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
})

watch(() => props.selectedIdx, (idx) => {
  if (idx >= 0) nextTick(() => annRefs.value[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
})

defineExpose({
  getAnnEl: (idx: number): HTMLElement | null => annRefs.value[idx] ?? null,
  getScrollContainerRect: (): DOMRect | null => scrollContainerRef.value?.getBoundingClientRect() ?? null,
})
</script>
