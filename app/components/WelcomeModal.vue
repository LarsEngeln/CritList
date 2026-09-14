<template>
  <UModal v-model:open="open" :prevent-close="true">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-info" class="text-primary-500" />
            <span class="font-semibold">Welcome to CritList</span>
          </div>
        </template>

        <div class="flex flex-col gap-5 text-sm text-neutral-600 dark:text-neutral-300">

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-cookie" class="mt-0.5 text-green-500 flex-shrink-0 text-base" />
            <div>
              <div class="font-medium text-neutral-800 dark:text-neutral-200">No cookies</div>
              <div class="text-neutral-500 dark:text-neutral-400 mt-0.5">
                This page does not use cookies of any kind.
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-shield-off" class="mt-0.5 text-green-500 flex-shrink-0 text-base" />
            <div>
              <div class="font-medium text-neutral-800 dark:text-neutral-200">No data storage</div>
              <div class="text-neutral-500 dark:text-neutral-400 mt-0.5">
                No personal data or usage data is collected or stored anywhere.
                Everything you do stays in your browser and is never transmitted to a server.
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-flask-conical" class="mt-0.5 text-yellow-500 flex-shrink-0 text-base" />
            <div>
              <div class="font-medium text-neutral-800 dark:text-neutral-200">Alpha version</div>
              <div class="text-neutral-500 dark:text-neutral-400 mt-0.5">
                CritList is in early alpha. Features, behavior, and data formats may change
                at any time without notice. Use at your own risk.
              </div>
            </div>
          </div>

        </div>

        <template #footer>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm flex-wrap">
              <p>By using CritList, you agree to the</p>
              <button class="hover:text-neutral-600 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors cursor-pointer" @click="openLegal('terms')">
                Terms of Use
              </button>
              <p>and</p>
              <button class="hover:text-neutral-600 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors cursor-pointer" @click="openLegal('privacy')">
                Data Protection
              </button>
            </div>
            <div class="flex items-center justify-between">
              <button class="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors cursor-pointer" @click="openLegal('imprint')">
                Imprint
              </button>
              <UButton label="I agree" @click="accept" />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>

  <LegalModal v-model:open="legalOpen" :type="legalType" />
</template>

<script setup lang="ts">
const open = ref(false)
const legalOpen = ref(false)
const legalType = ref<'terms' | 'privacy' | 'imprint'>('terms')

function openLegal(type: 'terms' | 'privacy' | 'imprint') {
  legalType.value = type
  legalOpen.value = true
}

onMounted(() => {
  open.value = true
})

function accept() {
  open.value = false
}
</script>
