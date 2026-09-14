<template>
  <UCard @click.stop>
    <!-- Active: creating a new annotation -->
    <div v-if="isCreating" class="flex flex-col gap-2">
      <div class="flex items-start gap-2">
        <span class="text-xs font-mono text-primary-500 font-semibold shrink-0 pt-1">@ {{ fmt((newTimeMs ?? 0) / 1000) }}</span>
         <AnnotationTypeActionRow
        :model-value="newType"
        :known-types="knownTypes"
        :color-map="colorMap"
        @update:model-value="emit('update:newType', $event)"
        @save="emit('save')"
        @cancel="emit('cancel')"
      />
        <textarea
          ref="textareaRef"
          :value="newText"
          class="flex-1 resize-none ml-8 bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
          placeholder="Annotation text…"
          rows="2"
          @input="emit('update:newText', ($event.target as HTMLTextAreaElement).value)"
          @keydown="onKeydown"
        />
      </div>

     
    </div>

    <!-- Idle: click / type to start a new annotation -->
    <div
      v-else
      class="flex items-center gap-2 cursor-text text-neutral-400 dark:text-neutral-500 text-sm select-none"
      @click="emit('start')"
    >
      <UIcon name="i-lucide-plus" class="w-4 h-4 shrink-0" />
      <span>Add annotation at current position…</span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  isCreating: boolean
  newTimeMs: number | null
  newText: string
  newType: string
  knownTypes: string[]
  colorMap: Record<string, string>
}>()

const emit = defineEmits<{
  'update:newText': [string]
  'update:newType': [string]
  start: []
  save: []
  cancel: []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.isCreating, (v) => {
  if (v) {
    nextTick(() => {
      textareaRef.value?.focus()
      const len = textareaRef.value?.value.length ?? 0
      textareaRef.value?.setSelectionRange(len, len)
    })
  }
})

function fmt(s: number): string {
  const ms = Math.floor((s % 1) * 1000)
  const sec = Math.floor(s % 60)
  const min = Math.floor(s / 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); emit('save') }
  if (e.key === 'Escape') { emit('cancel') }
}
</script>
