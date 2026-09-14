<template>
  <div class="group relative" @click.stop="emit('select', index)">
    <!-- Type colour bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg z-10"
      :style="{ background: colorMap[annotation.type] ?? 'rgb(171, 171, 171)' }"
    /> 

    <UCard
      :class="[
        'cursor-pointer transition-all overflow-visible',
        annotation.type ? 'pl-3' : '',
        !selected && isActive ? 'ring-1 ring-neutral-400 dark:ring-neutral-600' : '',
        !selected && !isActive ? 'hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-600' : ''
      ]"
      :style="selected ? { outline: `2px solid ${colorMap[annotation.type] ?? 'rgb(171, 171, 171)'}`, outlineOffset: '0px' } : {}"
    >
      <div class="flex items-start gap-3">
        <!-- Timestamp → jump -->
        <a
          class="font-mono text-xs text-neutral-500 shrink-0 mt-1.5 hover:underline whitespace-nowrap"
          @click.stop="emit('jump', index)"
        >
          {{ fmt(annotation.timeMs / 1000) }}
      </a>
      <span v-if="sessionLabel" class="mt-1 text-xs font-mono text-neutral-300 dark:text-neutral-600 shrink-0">{{ sessionLabel }}</span>
        <!-- Type badge / type-only editor -->
        <div v-if="!isTextEditing" class="mt-2ml-8 relative min-w-30 flex items-center gap-1.5" @click.stop>
          <template v-if="isTypeEditing">
            <div class="flex items-center gap-1">
              <TypeCombobox
                ref="typeInputRef"
                :model-value="typeEditValue"
                :known-types="knownTypes"
                :color-map="colorMap"
                compact
                placeholder="type…"
                @update:model-value="emit('update:typeEditValue', $event)"
                @submit="emit('save-type-edit')"
                @cancel="emit('cancel-type-edit')"
              />
              <UButton size="xs" icon="i-lucide-check" variant="ghost" @click="emit('save-type-edit')" />
              <UButton size="xs" icon="i-lucide-x" variant="ghost" @click="emit('cancel-type-edit')" />
            </div>
          </template>
          <template v-else>
            <button
              v-if="annotation.type"
              class="text-xs font-medium px-1.5 py-0.5 rounded hover:opacity-70 transition-opacity whitespace-nowrap"
              :style="{ background: (colorMap[annotation.type] ?? '') + '33', color: colorMap[annotation.type] ?? '' }"
              @click="emit('start-type-edit', index)"
            >
              {{ annotation.type }}
            </button>
            <button
              v-else
              class="text-xs text-neutral-400 hover:text-neutral-500 transition-colors px-1 whitespace-nowrap"
              :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              @click="emit('start-type-edit', index)"
            >
              + type
            </button>
          </template>
        </div>

        <!-- Text display / text editor -->
        <div class="flex-1 min-w-0">
          <template v-if="isTextEditing">
            <textarea
              ref="textareaRef"
              :value="editText"
              class="w-full resize-none bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 min-h-[2rem]"
              rows="2"
              @input="emit('update:editText', ($event.target as HTMLTextAreaElement).value)"
              @keydown="onEditKeydown"
              @click.stop
            />
            <div class="mt-2">
              <AnnotationTypeActionRow
                :model-value="editType"
                :known-types="knownTypes"
                :color-map="colorMap"
                @update:model-value="emit('update:editType', $event)"
                @save="emit('save-edit')"
                @cancel="emit('cancel-edit')"
              />
            </div>
          </template>
          <span v-else class="text-sm whitespace-pre-wrap text-neutral-800 dark:text-neutral-100">{{ annotation.text }}</span>
        </div>

        <!-- Action buttons -->
        <div
          class="flex gap-1 shrink-0 transition-opacity"
          :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
          <UButton icon="i-lucide-pencil" size="xs" variant="ghost" @click.stop="emit('start-edit', index)" />
          <UButton icon="i-lucide-trash-2" size="xs" variant="ghost" color="error" @click.stop="emit('delete', index)" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface Annotation { timeMs: number; text: string; type: string }

const props = defineProps<{
  annotation: Annotation
  index: number
  selected: boolean
  isActive: boolean
  isTextEditing: boolean
  editText: string
  editType: string
  isTypeEditing: boolean
  typeEditValue: string
  knownTypes: string[]
  colorMap: Record<string, string>
  sessionLabel?: string
}>()

const emit = defineEmits<{
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
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const typeInputRef = ref<{ focus: () => void } | null>(null)

watch(() => props.isTextEditing, (v) => {
  if (v) {
    nextTick(() => {
      textareaRef.value?.focus()
      const len = textareaRef.value?.value.length ?? 0
      textareaRef.value?.setSelectionRange(len, len)
    })
  }
})

watch(() => props.isTypeEditing, (v) => {
  if (v) nextTick(() => typeInputRef.value?.focus())
})

function fmt(s: number): string {
  const ms = Math.floor((s % 1) * 1000)
  const sec = Math.floor(s % 60)
  const min = Math.floor(s / 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); emit('save-edit') }
  if (e.key === 'Escape') { emit('cancel-edit') }
}
</script>
