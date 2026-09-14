<template>
  <div style="flex: 1 1 auto;"            
    class="flex flex-col flex-1 h-[calc(100dvh-var(--ui-header-height)-var(--ui-footer-height))]"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Welcome / disclaimer modal -->
    <WelcomeModal />

    <!-- Header (full width, above the flex-row body) -->
    <div class="flex items-center justify-between px-8 pt-4 pb-0 flex-shrink-0">
      <h1 class="text-neutral-500 dark:text-neutral-500">
        <UIcon name="i-lucide-chart-no-axes-gantt" class="text-neutral-300 dark:text-neutral-600" />
        CritList
        <span class="text-sm text-neutral-400 dark:text-neutral-600 mt-1">for critical listening &ndash; v0.3.2</span>
      </h1>
    </div>

    <!-- Drag overlay -->
    <div
      v-if="isDragOver"
      class="fixed inset-0 z-50 flex min-h-[calc(100dvh-var(--ui-header-height)-var(--ui-footer-height))] items-center justify-center bg-primary-500/10 border-4 border-dashed border-primary-400 pointer-events-none"
    >
      <p class="text-primary-500 font-semibold text-lg">Drop audio or CSV</p>
    </div>

    <!-- Body: outer centering shell -->
    <div class="flex flex-row flex-1 justify-center" style="flex: 1 1 auto;">

      <!-- Centered column: audio controls on top, annotation/sidebar row below -->
      <div class="flex flex-col flex-1 h-[calc(100dvh-var(--ui-header-height)-var(--ui-footer-height))] max-w-[calc(56rem+14rem)] min-w-0">

          <!-- Empty state: no audio, no sessions -->
          <div v-if="!audioUrl && !sessions.length" class="flex items-center justify-center pointer-events-none select-none mt-50">
            <div class="text-center">
              <UIcon name="i-lucide-music" class="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
              <p class="text-lg font-medium text-neutral-400 dark:text-neutral-500">Drop an audio file to get started</p>
              <p class="text-sm text-neutral-300 dark:text-neutral-600 mt-1">MP3, WAV, M4A … or a .csv to import annotations</p>
            </div>
          </div>

          <!-- Workspace: shown when audio OR sessions exist -->
          <div
            v-if="audioUrl || sessions.length"
            class="flex-1 flex flex-col gap-4 p-4 w-full h-[calc(100dvh-var(--ui-header-height)-var(--ui-footer-height))]"
            @click="deselectAll"
          >
          <!-- Hidden audio element -->
          <audio
            v-if="audioUrl"
            ref="audioRef"
            :src="audioUrl"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
          />

          <!-- Audio player (only when audio is loaded) -->
          <AudioPlayer
            v-if="audioUrl"
            :file-name="audioFileName"
            :is-playing="isPlaying"
            :current-time-s="currentTimeS"
            :duration="duration"
            :annotations="allVisibleAnnotations"
            :color-map="typeColors"
            :is-creating="isCreating"
            :selected-idx="selectedIdx"
            :eq-open="eqOpen"
            @toggle-play-pause="togglePlayPause"
            @seek-ratio="seekToRatio"
            @seek-time="seekToTime"
            @export-csv="handleExportCSV"
            @toggle-eq="eqOpen = !eqOpen"
          />

          <Transition name="eq-slide">
            <EQPanel
              v-if="audioUrl && eqOpen"
              v-model:bands="eqBands"
              v-model:bypass="eqBypass"
              v-model:preAmp="eqPreAmp"
              :presets="EQ_PRESETS"
              @load-preset="loadEQPreset"
            />
          </Transition>

          <!-- No-audio hint when only CSV sessions are loaded -->
          <div
            v-if="!audioUrl && sessions.length"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-500"
          >
            <UIcon name="i-lucide-music" class="text-neutral-400 flex-shrink-0" />
            <span>Drop an audio file to enable playback</span>
          </div>

          <div class="flex flex-row flex-1 min-h-0">
          <AnnotationList
            ref="annListRef"
            class="flex-1 min-h-0"
            :is-creating="isCreating"
            :new-time-ms="newTimeMs"
            :new-text="newText"
            :new-type="newType"
            :current-time-ms="Math.round(currentTimeS * 1000)"
            :annotations="annotations"
            :selected-idx="selectedIdx"
            :edit-idx="editIdx"
            :edit-text="editText"
            :edit-type="editType"
            :type-edit-idx="typeEditIdx"
            :type-edit-value="typeEditValue"
            :known-types="knownTypes"
            :color-map="typeColors"
            :session-labels="sessionLabels"
            :sort-desc="sortDesc"
            @select="selectAnnotation"
            @jump="jumpToAnnotation"
            @start-edit="startEditing"
            @save-edit="saveEditing"
            @cancel-edit="cancelEditing"
            @update:edit-text="editText = $event"
            @update:edit-type="editType = $event"
            @start-type-edit="startTypeEdit"
            @save-type-edit="saveTypeEdit"
            @cancel-type-edit="cancelTypeEdit"
            @update:type-edit-value="typeEditValue = $event"
            @delete="deleteAnnotation"
            @export-csv="handleExportCSV"
            @update:sort-desc="sortDesc = $event"
            @update:new-text="newText = $event"
            @update:new-type="newType = $event"
            @save="saveNewAnnotation"
            @cancel="cancelCreating"
            @start="startCreating('')"
          />
          <SessionSidebar
            ref="sessionSidebarRef"
            :open="sidebarOpen"
            :sessions="sessions"
            :active-session-id="activeSessionId"
            @toggle="sidebarOpen = !sidebarOpen"          @select-session="setActiveSession"            @toggle-visibility="handleToggleVisibility"
            @delete-session="handleDeleteSession"
            @export-session="handleExportSession"
            @combine-sessions="handleCombineSessions"
            @export-csv="handleExportCSV"
            @add-session="handleAddSession"
            @rename-session="handleRenameSession"
          />
          </div>

          <p
            class="flex-shrink mt-10 pt-2 text-xs text-center text-neutral-400"
            :class="isDragOver ? 'text-primary-400' : ''"
          >
            Drop a new audio file or .csv to replace / import
          </p>
        </div>
        <!-- /workspace div -->
      </div>
    </div>

    <ImportModal
      :open="importModalOpen"
      @confirm="handleImportChoice"
      @cancel="handleImportCancel"
    />

    <!-- Export modal -->
    <ExportModal
      :open="exportModalOpen"
      :sessions="sessions"
      @confirm="handleExportConfirm"
      @cancel="exportModalOpen = false"
    />

    <!-- Bezier connection lines between annotations and their session cards -->
    <Teleport to="body">
      <canvas ref="connectionCanvasRef" style="position:fixed;top:0;left:0;pointer-events:none;z-index:10;" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useEQ } from '~/composables/useEQ'
import { EQ_PRESETS } from '~/data/eqPresets'
import type { Session } from '~/components/SessionSidebar.vue'

interface Annotation { timeMs: number; text: string; type: string }

// ── Palettes ──────────────────────────────────────────────────────────────────
const SESSION_PALETTE = [
  '#60a5fa', '#34d399', '#fbbf24', '#f87171',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6',
]
const TYPE_PALETTE = [
  '#fbbf24', '#34d399', '#60a5fa', '#f87171',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6',
  '#a3e635', '#38bdf8',
]

// ── Type colors (global, consistent across all sessions) ──────────────────────
const typeColors = ref<Record<string, string>>({})
const knownTypes = computed(() => Object.keys(typeColors.value))

function registerColor(type: string) {
  if (!type || typeColors.value[type]) return
  const idx = Object.keys(typeColors.value).length % TYPE_PALETTE.length
  typeColors.value[type] = TYPE_PALETTE[idx]!
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const sessions = ref<Session[]>([])
const activeSessionId = ref<string | null>(null)
const activeSession = computed(() =>
  sessions.value.find(s => s.id === activeSessionId.value) ?? sessions.value[0] ?? null
)

function setActiveSession(id: string) {
  activeSessionId.value = id
  selectedIdx.value = -1
  editIdx.value = -1
  typeEditIdx.value = -1
}

// Merged visible annotations for the AudioPlayer waveform
const allVisibleAnnotations = computed((): Annotation[] => {
  const out: Annotation[] = []
  for (const s of sessions.value) {
    if (s.visible) out.push(...s.annotations)
  }
  return out.sort((a, b) => a.timeMs - b.timeMs)
})

// All visible annotations merged — displayed in AnnotationList regardless of which session is active
const annotations = computed((): Annotation[] => allVisibleAnnotations.value)

// Short session label for each flat annotation (e.g. "S1", "S2")
const sessionLabels = computed(() =>
  allVisibleAnnotations.value.map(ann => {
    const idx = sessions.value.findIndex(s => s.visible && s.annotations.includes(ann))
    return idx >= 0 ? `S${idx + 1}` : ''
  })
)

// Resolve a flat index into allVisibleAnnotations → its owning session + local index.
// Uses object-identity so it stays correct even after reorders.
function findAnnotationSource(flatIdx: number): { session: Session; annIdx: number } | null {
  const flat = allVisibleAnnotations.value
  if (flatIdx < 0 || flatIdx >= flat.length) return null
  const target = flat[flatIdx]!
  for (const s of sessions.value) {
    if (!s.visible) continue
    const annIdx = s.annotations.indexOf(target)
    if (annIdx >= 0) return { session: s, annIdx }
  }
  return null
}

function nextSessionColor(): string {
  return SESSION_PALETTE[sessions.value.length % SESSION_PALETTE.length]!
}

function createSession(name: string, anns: Annotation[] = []): Session {
  return {
    id: crypto.randomUUID(),
    name,
    color: nextSessionColor(),
    visible: true,
    annotations: anns,
  } as Session
}

function addSession(s: Session) {
  sessions.value.push(s)
  activeSessionId.value = s.id
}

function ensureActiveSession(): Session {
  if (activeSession.value) return activeSession.value
  const s = createSession('Session 1')
  addSession(s)
  return s
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const sidebarOpen = ref(true)

function handleAddSession() {
  const s = createSession(`Session ${sessions.value.length + 1}`)
  addSession(s)
}

function handleDeleteSession(id: string) {
  const idx = sessions.value.findIndex(s => s.id === id)
  if (idx < 0) return
  sessions.value.splice(idx, 1)
  if (activeSessionId.value === id)
    activeSessionId.value = sessions.value[0]?.id ?? null
}

function handleToggleVisibility(id: string) {
  const s = sessions.value.find(s => s.id === id)
  if (s) s.visible = !s.visible
}

function handleRenameSession(id: string, name: string) {
  const s = sessions.value.find(s => s.id === id)
  if (s) s.name = name
}

function handleCombineSessions() {
  const allAnns: Annotation[] = []
  for (const s of sessions.value) allAnns.push(...s.annotations)
  allAnns.sort((a, b) => a.timeMs - b.timeMs)
  const combined = createSession('Combined', allAnns)
  sessions.value = [combined]
  activeSessionId.value = combined.id
  sidebarOpen.value = false
}

// ── Audio ─────────────────────────────────────────────────────────────────────
const audioRef = ref<HTMLAudioElement | null>(null)
const { bands: eqBands, bypass: eqBypass, preAmp: eqPreAmp, loadPreset: loadEQPreset } = useEQ(audioRef)
const eqOpen = ref(false)
const audioUrl = ref<string | null>(null)
const audioFileName = ref('')
const isPlaying = ref(false)
const currentTimeS = ref(0)
const duration = ref(0)

function togglePlayPause() {
  if (!audioRef.value) return
  isPlaying.value ? audioRef.value.pause() : audioRef.value.play()
}
function seekToRatio(ratio: number) {
  if (!audioRef.value || !duration.value) return
  audioRef.value.currentTime = ratio * duration.value
}
function seekToTime(timeS: number) {
  if (!audioRef.value) return
  audioRef.value.currentTime = timeS
}
function seekRelative(d: number) {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(0, Math.min(duration.value, audioRef.value.currentTime + d))
}
function onTimeUpdate() { currentTimeS.value = audioRef.value?.currentTime ?? 0 }
function onLoadedMetadata() { duration.value = audioRef.value?.duration ?? 0 }
function onPlay() { isPlaying.value = true }
function onPause() { isPlaying.value = false }
function onEnded() { isPlaying.value = false }

// ── Drag & Drop ───────────────────────────────────────────────────────────────
const isDragOver = ref(false)

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (!file) return
  if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name)) {
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = URL.createObjectURL(file)
    audioFileName.value = file.name
    selectedIdx.value = -1
  } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
    const baseName = file.name.replace(/\.csv$/i, '')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      if (sessions.value.length > 0) {
        pendingCSVContent.value = content
        pendingCSVName.value = baseName
        importModalOpen.value = true
      } else {
        loadCSVContent(content, baseName)
      }
    }
    reader.readAsText(file)
  }
}
function onDragOver(e: DragEvent) { e.preventDefault(); isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }

// ── CSV Import ────────────────────────────────────────────────────────────────
const pendingCSVContent = ref<string | null>(null)
const pendingCSVName = ref('')
const importModalOpen = ref(false)

function loadCSVContent(content: string, name: string) {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return
  const header = parseCSVLine(lines[0]!).map(h => h.trim())
  const lowerHeader = header.map(h => h.toLowerCase())

  // ── Separate multi-session format: multiple time_ms_* columns ──
  const timeMsGroups = header.filter(h => /^time_ms_.+/i.test(h))
  if (timeMsGroups.length > 1) {
    for (const timeCol of timeMsGroups) {
      const suffix = timeCol.slice('time_ms_'.length)
      const tIdx = header.findIndex(h => h.toLowerCase() === `time_ms_${suffix.toLowerCase()}`)
      const xIdx = header.findIndex(h => h.toLowerCase() === `text_${suffix.toLowerCase()}`)
      const yIdx = header.findIndex(h => h.toLowerCase() === `type_${suffix.toLowerCase()}`)
      if (tIdx < 0 || xIdx < 0) continue
      const anns: Annotation[] = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]!.trim()) continue
        const cols = parseCSVLine(lines[i]!)
        const timeMs = parseInt(cols[tIdx] ?? '')
        const text = (cols[xIdx] ?? '').replace(/\\n/g, '\n')
        const type = yIdx >= 0 ? (cols[yIdx] ?? '').trim() : ''
        if (!isNaN(timeMs) && text) anns.push({ timeMs, text, type })
      }
      if (!anns.length) continue
      anns.sort((a, b) => a.timeMs - b.timeMs)
      const sessName = suffix.replace(/_/g, ' ').trim()
      for (const a of anns) if (a.type) registerColor(a.type)
      addSession(createSession(sessName || name, anns))
    }
    return
  }

  // ── Merged multi-session format: has 'session', 'time_ms', 'text' columns ──
  const sessIdx = lowerHeader.indexOf('session')
  const tIdx = lowerHeader.indexOf('time_ms')
  const xIdx = lowerHeader.indexOf('text')
  const yIdx = lowerHeader.indexOf('type')
  if (sessIdx >= 0 && tIdx >= 0 && xIdx >= 0) {
    const sessionMap = new Map<string, Annotation[]>()
    const sessionOrder: string[] = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]!.trim()) continue
      const cols = parseCSVLine(lines[i]!)
      const sessName = (cols[sessIdx] ?? '').trim()
      const timeMs = parseInt(cols[tIdx] ?? '')
      const text = (cols[xIdx] ?? '').replace(/\\n/g, '\n')
      const type = yIdx >= 0 ? (cols[yIdx] ?? '').trim() : ''
      if (!isNaN(timeMs) && text) {
        if (!sessionMap.has(sessName)) {
          sessionMap.set(sessName, [])
          sessionOrder.push(sessName)
        }
        sessionMap.get(sessName)!.push({ timeMs, text, type })
      }
    }
    for (const sessName of sessionOrder) {
      const anns = sessionMap.get(sessName)!
      anns.sort((a, b) => a.timeMs - b.timeMs)
      for (const a of anns) if (a.type) registerColor(a.type)
      addSession(createSession(sessName || name, anns))
    }
    return
  }

  // ── Single session format ──
  const anns = parseCSVToAnnotations(content)
  for (const a of anns) if (a.type) registerColor(a.type)
  if (anns.length) addSession(createSession(name, anns))
}

function handleImportChoice(choice: 'replace' | 'merge') {
  importModalOpen.value = false
  if (!pendingCSVContent.value) return
  if (choice === 'replace') {
    sessions.value = []
    typeColors.value = {}
    selectedIdx.value = -1
    editIdx.value = -1
    typeEditIdx.value = -1
  }
  loadCSVContent(pendingCSVContent.value, pendingCSVName.value)
  pendingCSVContent.value = null
  pendingCSVName.value = ''
}

function handleImportCancel() {
  importModalOpen.value = false
  pendingCSVContent.value = null
  pendingCSVName.value = ''
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (q && line[i + 1] === '"') { cur += '"'; i++ }
      else { q = !q }
    } else if (ch === ',' && !q) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

function parseCSVToAnnotations(content: string): Annotation[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  const header = parseCSVLine(lines[0]!)
  const tIdx = header.findIndex(h => h.trim().toLowerCase() === 'time_ms')
  const xIdx = header.findIndex(h => h.trim().toLowerCase() === 'text')
  const yIdx = header.findIndex(h => h.trim().toLowerCase() === 'type')
  if (tIdx < 0 || xIdx < 0) return []
  const out: Annotation[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]!.trim()) continue
    const cols = parseCSVLine(lines[i]!)
    const timeMs = parseInt(cols[tIdx]!)
    const text = (cols[xIdx] ?? '').replace(/\\n/g, '\n')
    const type = yIdx >= 0 ? (cols[yIdx] ?? '').trim() : ''
    if (!isNaN(timeMs) && text) out.push({ timeMs, text, type })
  }
  return out.sort((a, b) => a.timeMs - b.timeMs)
}

// ── CSV Export ────────────────────────────────────────────────────────────────
const exportModalOpen = ref(false)

// Direct single-session export (no modal needed)
function handleExportSession(id: string) {
  const s = sessions.value.find(sess => sess.id === id)
  if (!s) return
  const rows = ['time_ms,text,type']
  for (const ann of s.annotations) {
    const t = ann.text.replace(/"/g, '""').replace(/\n/g, '\\n')
    const y = (ann.type ?? '').replace(/"/g, '""')
    rows.push(`${ann.timeMs},"${t}","${y}"`)
  }
  downloadCSV(rows.join('\n'), s.name)
}

// Opens modal when multiple sessions exist, otherwise exports directly
function handleExportCSV() {
  if (sessions.value.length <= 1) {
    const s = sessions.value[0]
    if (s) handleExportSession(s.id)
    return
  }
  exportModalOpen.value = true
}

function handleExportConfirm(sessionIds: string[], strategy: 'merged' | 'separate', addSessionPrefix: boolean) {
  exportModalOpen.value = false
  const selected = sessions.value.filter(s => sessionIds.includes(s.id))
  if (!selected.length) return

  if (strategy === 'merged') {
    const rows = ['session,time_ms,text,type']
    for (const s of selected) {
      let sessionAbbr = "";
      if(addSessionPrefix) {
        let index = sessions.value.findIndex(sess => sess.id === s.id);
        sessionAbbr = `[S${index + 1}] `;
      }
      
      for (const ann of s.annotations) {
        const sn = s.name.replace(/"/g, '""')
        const t = ann.text.replace(/"/g, '""').replace(/\n/g, '\\n')
        const y = (ann.type ?? '').replace(/"/g, '""')
        rows.push(`"${sn}",${ann.timeMs},"${sessionAbbr}${t}","${y}"`)
      }
    }
    const baseFile = audioFileName.value ? audioFileName.value.replace(/\.[^.]+$/, '') : null
    const dateStr = new Date().toISOString().slice(0, 10)
    const fileName = baseFile
      ? `${baseFile}-${selected.length}-sessions-merged`
      : `CritList-Annotations-${dateStr}-merged`
    downloadCSV(rows.join('\n'), fileName)
  } else {
    const maxLen = Math.max(...selected.map(s => s.annotations.length), 0)
    const headerCols = selected.flatMap(s => {
      const safe = s.name.replace(/[^a-z0-9]/gi, '_')
      return [`time_ms_${safe}`, `text_${safe}`, `type_${safe}`]
    })
    const rows = [headerCols.join(',')]
    for (let i = 0; i < maxLen; i++) {
      const cols: string[] = []
      for (const s of selected) {
        let sessionAbbr = "";
        if(addSessionPrefix) {
          let index = sessions.value.findIndex(sess => sess.id === s.id);
          sessionAbbr = `[S${index + 1}] `;
        }
        const ann = s.annotations[i]
        if (ann) {
          const t = ann.text.replace(/"/g, '""').replace(/\n/g, '\\n')
          const y = (ann.type ?? '').replace(/"/g, '""')
          cols.push(String(ann.timeMs), `"${sessionAbbr}${t}"`, `"${y}"`)
        } else {
          cols.push('', '', '')
        }
      }
      rows.push(cols.join(','))
    }
    const baseFile = audioFileName.value ? audioFileName.value.replace(/\.[^.]+$/, '') : null
    const dateStr = new Date().toISOString().slice(0, 10)
    const fileName = baseFile
      ? `${baseFile}-${selected.length}-sessions`
      : `CritList-Annotations-${dateStr}`
    downloadCSV(rows.join('\n'), fileName)
  }
}

function downloadCSV(content: string, name: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Annotation editing state ──────────────────────────────────────────────────
const selectedIdx = ref(-1)
const isCreating = ref(false)
const newText = ref('')
const newType = ref('')
const newTimeMs = ref<number | null>(null)
const editIdx = ref(-1)
const editText = ref('')
const editType = ref('')
const editTarget = ref<Annotation | null>(null)
const typeEditIdx = ref(-1)
const typeEditValue = ref('')
const typeEditTarget = ref<Annotation | null>(null)
const sortDesc = ref(true)

function startCreating(initialChar: string) {
  ensureActiveSession()
  cancelEditing(); cancelTypeEdit()
  selectedIdx.value = -1
  newTimeMs.value = Math.round(currentTimeS.value * 1000)
  newText.value = initialChar
  newType.value = ''
  isCreating.value = true
}

function saveNewAnnotation() {
  const s = activeSession.value
  if (!s) return
  const text = newText.value.trim()
  if (text && newTimeMs.value !== null) {
    const type = newType.value.trim()
    if (type) registerColor(type)
    s.annotations.push({ timeMs: newTimeMs.value, text, type })
    s.annotations.sort((a, b) => a.timeMs - b.timeMs)
  }
  isCreating.value = false; newText.value = ''; newType.value = ''; newTimeMs.value = null
}

function cancelCreating() {
  isCreating.value = false; newText.value = ''; newType.value = ''; newTimeMs.value = null
}

function startEditing(idx: number, appendChar = '') {
  cancelTypeEdit()
  const source = findAnnotationSource(idx)
  if (!source) return
  const ann = source.session.annotations[source.annIdx]!
  editIdx.value = idx
  editTarget.value = ann
  editText.value = ann.text + appendChar
  editType.value = ann.type
}

function saveEditing() {
  if (editIdx.value < 0 || !editTarget.value) return
  const text = editText.value.trim()
  if (text) {
    const type = editType.value.trim()
    if (type) registerColor(type)
    editTarget.value.text = text
    editTarget.value.type = type
  }
  editIdx.value = -1; editText.value = ''; editType.value = ''; editTarget.value = null
}

function cancelEditing() { editIdx.value = -1; editText.value = ''; editType.value = ''; editTarget.value = null }

function startTypeEdit(idx: number) {
  cancelEditing()
  const source = findAnnotationSource(idx)
  if (!source) return
  typeEditIdx.value = idx
  typeEditTarget.value = source.session.annotations[source.annIdx]!
  typeEditValue.value = typeEditTarget.value.type
}

function saveTypeEdit() {
  if (typeEditIdx.value < 0 || !typeEditTarget.value) return
  const type = typeEditValue.value.trim()
  if (type) registerColor(type)
  typeEditTarget.value.type = type
  typeEditIdx.value = -1; typeEditValue.value = ''; typeEditTarget.value = null
}

function cancelTypeEdit() { typeEditIdx.value = -1; typeEditValue.value = ''; typeEditTarget.value = null }

function selectAnnotation(idx: number) { selectedIdx.value = idx }

function deselectAll() {
  if (editIdx.value >= 0) saveEditing()
  if (typeEditIdx.value >= 0) saveTypeEdit()
  selectedIdx.value = -1
}

function jumpToAnnotation(idx: number) {
  const source = findAnnotationSource(idx)
  if (!source) return
  seekToTime(source.session.annotations[source.annIdx]!.timeMs / 1000)
  selectedIdx.value = idx
  if (audioUrl.value && !isPlaying.value) audioRef.value?.play()
}

function moveUp() {
  const len = annotations.value.length
  if (!len) return
  if (sortDesc.value)
    selectedIdx.value = selectedIdx.value < 0 ? len - 1 : Math.min(len - 1, selectedIdx.value + 1)
  else
    selectedIdx.value = selectedIdx.value <= 0 ? 0 : selectedIdx.value - 1
}

function moveDown() {
  const len = annotations.value.length
  if (!len) return
  if (sortDesc.value)
    selectedIdx.value = selectedIdx.value <= 0 ? 0 : selectedIdx.value - 1
  else
    selectedIdx.value = selectedIdx.value < 0 ? 0 : Math.min(len - 1, selectedIdx.value + 1)
}

function shiftTime(deltaS: number) {
  const idx = selectedIdx.value
  if (idx < 0) return
  const source = findAnnotationSource(idx)
  if (!source) return
  const ann = source.session.annotations[source.annIdx]!
  ann.timeMs = Math.max(0, Math.round(ann.timeMs + deltaS * 1000))
  source.session.annotations.sort((a, b) => a.timeMs - b.timeMs)
  selectedIdx.value = allVisibleAnnotations.value.indexOf(ann)
}

function deleteAnnotation(idx: number) {
  const source = findAnnotationSource(idx)
  if (!source) return
  source.session.annotations.splice(source.annIdx, 1)
  const newLen = allVisibleAnnotations.value.length
  if (selectedIdx.value >= newLen)
    selectedIdx.value = newLen - 1
}

// ── Connection lines ──────────────────────────────────────────────────────────
const connectionCanvasRef = ref<HTMLCanvasElement | null>(null)
const annListRef = ref<{ getAnnEl: (idx: number) => HTMLElement | null; getScrollContainerRect: () => DOMRect | null } | null>(null)
const sessionSidebarRef = ref<{ getSessionCardEl: (id: string) => HTMLElement | null } | null>(null)
let connectionRafId: number | null = null

function resizeConnectionCanvas() {
  const canvas = connectionCanvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth, h = window.innerHeight
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
}

function drawConnectionLines() {
  const canvas = connectionCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  if (!sidebarOpen.value || !annListRef.value || !sessionSidebarRef.value || !activeSessionId.value) return
  const getAnn = annListRef.value.getAnnEl
  const getCard = sessionSidebarRef.value.getSessionCardEl
  const scrollRect = annListRef.value.getScrollContainerRect()
  const cardEl = getCard(activeSessionId.value)
  if (!cardEl) return
  const cr = cardEl.getBoundingClientRect()
  if (cr.bottom < 0 || cr.top > window.innerHeight) return
  for (let i = 0; i < allVisibleAnnotations.value.length; i++) {
    const source = findAnnotationSource(i)
    if (!source || source.session.id !== activeSessionId.value) continue
    const annEl = getAnn(i)
    if (!annEl) continue
    const ar = annEl.getBoundingClientRect()
    if (ar.height < 10) continue
    if (scrollRect && (ar.bottom < scrollRect.top || ar.top > scrollRect.bottom)) continue
    const x1 = ar.right, y1 = (ar.top + ar.bottom) / 2
    const x2 = cr.left, y2 = (cr.top + cr.bottom) / 2
    const dx = x2 - x1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.bezierCurveTo(x1 + dx * 0.5, y1, x2 - dx * 0.5, y2, x2, y2)
    ctx.strokeStyle = 'rgba(34,197,94,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function startConnectionLoop() {
  if (connectionRafId !== null) return
  const loop = () => { drawConnectionLines(); connectionRafId = requestAnimationFrame(loop) }
  connectionRafId = requestAnimationFrame(loop)
}

function stopConnectionLoop() {
  if (connectionRafId !== null) { cancelAnimationFrame(connectionRafId); connectionRafId = null }
  const ctx = connectionCanvasRef.value?.getContext('2d')
  if (ctx && connectionCanvasRef.value) ctx.clearRect(0, 0, connectionCanvasRef.value.width, connectionCanvasRef.value.height)
}

watch(sidebarOpen, open => { if (open) nextTick(startConnectionLoop); else stopConnectionLoop() })

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
function onGlobalKeydown(e: KeyboardEvent) {
  if (!audioUrl.value && !sessions.value.length) return
  if (isCreating.value) return
  if (editIdx.value >= 0) return
  if (typeEditIdx.value >= 0) return
  const tag = (document.activeElement?.tagName ?? '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  const hasSel = selectedIdx.value >= 0

  switch (e.key) {
    case ' ':
      if (!audioUrl.value) return
      e.preventDefault(); togglePlayPause(); return
    case 'ArrowLeft':
      if (!audioUrl.value) return
      e.preventDefault(); hasSel ? shiftTime(-0.5) : seekRelative(-1); return
    case 'ArrowRight':
      if (!audioUrl.value) return
      e.preventDefault(); hasSel ? shiftTime(+0.5) : seekRelative(+1); return
    case 'ArrowUp':
      e.preventDefault(); moveUp(); return
    case 'ArrowDown':
      e.preventDefault(); moveDown(); return
    case 'Escape':
      if (hasSel) { e.preventDefault(); selectedIdx.value = -1 } return
    case 'Delete':
    case 'Backspace':
      if (hasSel) { e.preventDefault(); deleteAnnotation(selectedIdx.value) } return
    default:
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        if (hasSel) startEditing(selectedIdx.value, e.key)
        else startCreating(e.key)
      }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  window.addEventListener('resize', resizeConnectionCanvas)
  nextTick(() => { resizeConnectionCanvas(); if (sidebarOpen.value) startConnectionLoop() })
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  window.removeEventListener('resize', resizeConnectionCanvas)
  stopConnectionLoop()
})
</script>

<style>
h1 {
  font-size: 1.7rem;
  font-weight: 100;
}

.eq-slide-enter-active,
.eq-slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}
.eq-slide-enter-from,
.eq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.eq-slide-enter-to,
.eq-slide-leave-from {
  max-height: 410px;
  opacity: 1;
}
</style>