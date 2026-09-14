<template>
  <!-- Always-present w-56 column: header always visible, body slides -->
  <div class="w-56 ml-4 flex-shrink-0 h-full flex flex-col border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">

    <!-- Header: ALWAYS visible, click toggles body -->
    <div
      class="flex items-center justify-between px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0 cursor-pointer select-none hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      @click="emit('toggle')"
    >
      <span class="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">Sessions</span>
      <UIcon
        :name="open ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
        class="text-neutral-400 w-4 h-4 flex-shrink-0"
      />
    </div>

    <!-- Body: slides left when hiding, comes from right when showing -->
    <div class="flex-1 overflow-hidden relative">
      <Transition name="slide-left">
        <div v-if="open" class="absolute inset-0 flex flex-col">

          <!-- Session list -->
          <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <div
          v-for="(session, sessionIdx) in sessions"
          :key="session.id"
          :ref="(el) => setSessionCardRef(session.id, el)"
          class="rounded-lg border p-3 flex flex-col gap-1.5 transition-all cursor-pointer"
          :class="session.visible
            ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'
            : 'border-neutral-100 dark:border-neutral-800 bg-transparent opacity-50'"
          :style="session.id === activeSessionId
            ? { outline: '2px solid var(--ui-primary)', outlineOffset: '1px' }
            : {}"
          @click="emit('select-session', session.id)"
        >
          <!-- Name row -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-neutral-400 dark:text-neutral-500 shrink-0">S{{ sessionIdx + 1 }}</span>
            <template v-if="renamingId === session.id">
              <input
                ref="renameInputRef"
                v-model="renameValue"
                class="flex-1 text-sm bg-transparent border-b border-primary-400 outline-none"
                @keydown.enter="confirmRename(session.id)"
                @keydown.escape="renamingId = null"
                @blur="confirmRename(session.id)"
              />
            </template>
            <template v-else>
              <span
                class="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate cursor-pointer hover:text-primary-500"
                :title="session.name"
                @dblclick="startRename(session)"
              >{{ session.name }}</span>
            </template>
          </div>

          <!-- Meta -->
          <div class="text-xs text-neutral-400">
            {{ session.annotations.length }} annotation{{ session.annotations.length !== 1 ? 's' : '' }}
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 flex-wrap">
            <UButton
              :icon="session.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              size="xs"
              variant="ghost"
              :title="session.visible ? 'Hide session' : 'Show session'"
              @click.stop="emit('toggle-visibility', session.id)"
            />
            <UButton
              icon="i-lucide-download"
              size="xs"
              variant="ghost"
              title="Export this session"
              @click.stop="emit('export-session', session.id)"
            />
            <template v-if="confirmingDeleteId === session.id">
              <span class="text-xs text-neutral-400 dark:text-neutral-500">Delete?</span>
              <UButton icon="i-lucide-check" size="xs" variant="ghost" color="error" title="Confirm" @click.stop="confirmDelete(session.id)" />
              <UButton icon="i-lucide-x" size="xs" variant="ghost" title="Cancel" @click.stop="confirmingDeleteId = null" />
            </template>
            <UButton
              v-else
              icon="i-lucide-trash-2"
              size="xs"
              variant="ghost"
              color="error"
              title="Delete session"
              @click.stop="confirmingDeleteId = session.id"
            />
          </div>
        </div>

          <!-- Empty state -->
          <div v-if="!sessions.length" class="text-center text-sm text-neutral-400 py-8">
            No sessions yet.<br />Drop a CSV file to create one.
          </div>
          </div>

          <!-- Footer actions -->
          <div class="border-t border-neutral-200 dark:border-neutral-700 p-3 flex flex-col gap-2 flex-shrink-0">
            <UButton
              v-if="sessions.length >= 2"
              icon="i-lucide-layers"
              size="sm"
              variant="outline"
              label="Combine all sessions"
              class="w-full justify-center"
              @click="emit('combine-sessions')"
            />
            <UButton
              v-if="sessions.length"
              icon="i-lucide-download"
              size="sm"
              variant="outline"
              label="Export CSV…"
              class="w-full justify-center"
              @click="emit('export-csv')"
            />
            <UButton
              icon="i-lucide-plus"
              size="sm"
              variant="solid"
              label="New session"
              class="w-full justify-center"
              @click="emit('add-session')"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* slides in from the left, exits to the left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>

<script setup lang="ts">
export interface Session {
  id: string
  name: string
  color: string
  visible: boolean
  annotations: Array<{ timeMs: number; text: string; type: string }>
}

const props = defineProps<{
  open: boolean
  sessions: Session[]
  activeSessionId?: string | null
}>()

const emit = defineEmits<{
  toggle: []
  'select-session': [id: string]
  'toggle-visibility': [id: string]
  'delete-session': [id: string]
  'export-session': [id: string]
  'combine-sessions': []
  'export-csv': []
  'add-session': []
  'rename-session': [id: string, name: string]
}>()

const renamingId = ref<string | null>(null)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

function startRename(session: Session) {
  renamingId.value = session.id
  renameValue.value = session.name
  nextTick(() => renameInputRef.value?.focus())
}

function confirmRename(id: string) {
  if (renamingId.value !== id) return
  const name = renameValue.value.trim()
  if (name) emit('rename-session', id, name)
  renamingId.value = null
}

const confirmingDeleteId = ref<string | null>(null)

function confirmDelete(id: string) {
  confirmingDeleteId.value = null
  emit('delete-session', id)
}

const sessionCardRefs = reactive<Record<string, HTMLElement | undefined>>({})

function setSessionCardRef(id: string, el: unknown) {
  sessionCardRefs[id] = el instanceof HTMLElement ? el : undefined
}

defineExpose({
  getSessionCardEl: (id: string): HTMLElement | null => sessionCardRefs[id] ?? null,
})
</script>
