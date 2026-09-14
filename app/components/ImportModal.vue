<template>
  <UModal v-model:open="localOpen" :prevent-close="true">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-plus" class="text-primary-500" />
            <span class="font-semibold">Import CSV</span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <p class="text-sm text-neutral-600 dark:text-neutral-300">
            Annotations already exist. How do you want to handle the new CSV?
          </p>

          <div class="flex flex-col gap-2">
            <label class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              :class="choice === 'replace' ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'"
              @click="choice = 'replace'"
            >
              <UIcon name="i-lucide-refresh-cw" class="mt-0.5 text-red-500 flex-shrink-0" />
              <div>
                <div class="text-sm font-medium">Replace all data</div>
                <div class="text-xs text-neutral-400 mt-0.5">Remove all existing sessions and load the CSV as a new session.</div>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              :class="choice === 'merge' ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'"
              @click="choice = 'merge'"
            >
              <UIcon name="i-lucide-git-merge" class="mt-0.5 text-green-500 flex-shrink-0" />
              <div>
                <div class="text-sm font-medium">Add as new session</div>
                <div class="text-xs text-neutral-400 mt-0.5">Keep existing sessions and load the CSV as an additional session.</div>
              </div>
            </label>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" label="Cancel" @click="cancel" />
            <UButton label="Confirm" :disabled="!choice" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  confirm: [choice: 'replace' | 'merge']
  cancel: []
}>()

const localOpen = computed({
  get: () => props.open,
  set: (v) => { if (!v) emit('cancel') }
})

const choice = ref<'replace' | 'merge' | null>(null)

function confirm() {
  if (!choice.value) return
  emit('confirm', choice.value)
  choice.value = null
}

function cancel() {
  choice.value = null
  emit('cancel')
}

watch(() => props.open, (v) => {
  if (v) choice.value = null
})
</script>
