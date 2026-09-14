<template>
  <UModal v-model:open="localOpen" :prevent-close="true">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-download" class="text-primary-500" />
            <span class="font-semibold">Export CSV</span>
          </div>
        </template>

        <div class="flex flex-col gap-5">
          <!-- Session selection -->
          <div class="flex flex-col gap-2">
            <div class="text-sm font-medium text-neutral-700 dark:text-neutral-200">Which sessions to export?</div>
            <div class="flex flex-col gap-1.5">
              <label
                v-for="(session, index) in sessions"
                :key="session.id"
                class="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                :class="selectedSessions.has(session.id)
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700'"
                @click="toggleSession(session.id)"
              >
                <span class="text-sm flex-1"><small>[S{{ index + 1 }}]</small>  {{ session.name }}</span>
                <span class="text-xs text-neutral-400">{{ session.annotations.length }} ann.</span>
                <UIcon
                  :name="selectedSessions.has(session.id) ? 'i-lucide-check-square' : 'i-lucide-square'"
                  class="text-neutral-400"
                />
              </label>
            </div>

            <div class="flex gap-2 mt-1">
              <UButton size="xs" variant="ghost" label="All" @click="selectAll" />
              <UButton size="xs" variant="ghost" label="None" @click="clearSessions" />
            </div>
          </div>

          <!-- Session prefix option -->
          <div class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <UCheckbox v-model="addSessionPrefix" />
            <div class="flex-1">
              <div class="text-sm font-medium">Add session prefix to annotations</div>
              <div class="text-xs text-neutral-400 mt-0.5">
                Prefix each annotation text with the session abbreviation, e.g. <code>[S1] text</code>, <code>[S2] second annotation</code>
              </div>
            </div>
          </div>

          <!-- Column strategy -->
          <div class="flex flex-col gap-2">
            <div class="text-sm font-medium text-neutral-700 dark:text-neutral-200">Column layout</div>
            <div class="flex flex-col gap-2">
              <label
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                :class="colStrategy === 'merged' ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'"
                @click="colStrategy = 'merged'"
              >
                <UIcon name="i-lucide-align-justify" class="mt-0.5 flex-shrink-0 text-primary-500" />
                <div>
                  <div class="text-sm font-medium">Merge into one set of columns</div>
                  <div class="text-xs text-neutral-400 mt-0.5">
                    All sessions share <code>session, time_ms, text, type</code> columns.
                    The <code>session</code> column identifies the origin.
                  </div>
                </div>
              </label>

              <label
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                :class="colStrategy === 'separate' ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'"
                @click="colStrategy = 'separate'"
              >
                <UIcon name="i-lucide-columns-3" class="mt-0.5 flex-shrink-0 text-primary-500" />
                <div>
                  <div class="text-sm font-medium">Separate columns per session</div>
                  <div class="text-xs text-neutral-400 mt-0.5">
                    Each session gets its own <code>time_ms_[name], text_[name], type_[name]</code> columns.
                    Rows are aligned by position.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" label="Cancel" @click="cancel" />
            <UButton
              label="Export"
              :disabled="selectedSessions.size === 0 || !colStrategy"
              @click="confirm"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Session } from './SessionSidebar.vue'

const props = defineProps<{
  open: boolean
  sessions: Session[]
}>()

const emit = defineEmits<{
  confirm: [sessionIds: string[], strategy: 'merged' | 'separate', addSessionPrefix: boolean]
  cancel: []
}>()

const localOpen = computed({
  get: () => props.open,
  set: (v) => { if (!v) emit('cancel') }
})

const selectedSessions = ref<Set<string>>(new Set())
const colStrategy = ref<'merged' | 'separate' | null>(null)
let addSessionPrefix = ref(false);

watch(() => props.open, (v) => {
  if (v) {
    selectedSessions.value = new Set(props.sessions.map(s => s.id))
    colStrategy.value = props.sessions.length > 1 ? null : 'merged'
  }
})

function toggleSession(id: string) {
  const next = new Set(selectedSessions.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedSessions.value = next
}

function selectAll() {
  selectedSessions.value = new Set(props.sessions.map(s => s.id))
}

function clearSessions() {
  selectedSessions.value = new Set()
}

function confirm() {
  if (!selectedSessions.value.size || !colStrategy.value) return
  emit('confirm', [...selectedSessions.value], colStrategy.value, addSessionPrefix.value)
}

function cancel() {
  emit('cancel')
}
</script>
