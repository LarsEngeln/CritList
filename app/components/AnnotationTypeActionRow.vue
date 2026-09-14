<template>
  <div class="flex items-center gap-1" @click.stop>
    <TypeCombobox
      :model-value="modelValue"
      :known-types="knownTypes"
      :color-map="colorMap"
      compact
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
      @submit="emit('save')"
      @cancel="emit('cancel')"
    />
    <UButton size="xs" icon="i-lucide-check" variant="ghost" @click="emit('save')" />
    <UButton size="xs" icon="i-lucide-x" variant="ghost" @click="emit('cancel')" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  knownTypes: string[]
  colorMap: Record<string, string>
  placeholder?: string
}>(), {
  placeholder: 'type…'
})

const emit = defineEmits<{
  'update:modelValue': [string]
  save: []
  cancel: []
}>()
</script>
