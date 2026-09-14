<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <span
        v-if="modelValue"
        class="rounded-full shrink-0"
        :class="compact ? 'w-2.5 h-2.5' : 'w-3 h-3'"
        :style="{ background: previewColor(modelValue) }"
      />
      <input
        ref="inputRef"
        :value="modelValue"
        :class="[
          'outline-none bg-transparent placeholder-neutral-400',
          compact
            ? 'text-xs border border-neutral-300 dark:border-neutral-600 rounded px-1.5 py-0.5 w-24 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100'
            : 'flex-1 w-full text-xs border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 bg-transparent'
        ]"
        :placeholder="placeholder"
        autocomplete="off"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="open = true"
        @blur="closeDeferred"
        @keydown="onKeydown"
      />
    </div>
    <div
      v-if="open && filtered.length"
      :class="[
        'absolute left-0 top-full mt-1 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded shadow-lg overflow-hidden',
        compact ? 'min-w-[8rem]' : 'right-0'
      ]"
    >
      <button
        v-for="t in filtered"
        :key="t"
        class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @mousedown.prevent="pick(t)"
      >
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: colorOf(t) }" />
        {{ t }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  knownTypes: string[]
  colorMap: Record<string, string>
  placeholder?: string
  compact?: boolean
}>(), {
  placeholder: 'Type (optional)',
  compact: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  cancel: []
}>()

const open = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase()
  return props.knownTypes.filter(t => t.toLowerCase().includes(q) && t !== props.modelValue.trim())
})

function colorOf(type: string): string { return props.colorMap[type] ?? '' }
function previewColor(type: string): string { return props.colorMap[type] ?? '#94a3b8' }

function pick(t: string) {
  emit('update:modelValue', t)
  open.value = false
  emit('submit')
}

function closeDeferred() {
  setTimeout(() => { open.value = false }, 150)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); open.value = false; emit('submit') }
  if (e.key === 'Escape') { e.preventDefault(); emit('update:modelValue', ''); open.value = false; emit('cancel') }
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>
