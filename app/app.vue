<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'CritList – audio annotation tool for critical listening'
const description = 'drop it, play it, annotate.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

const legalOpen = ref(false)
const legalType = ref<'terms' | 'privacy' | 'imprint'>('terms')

function openLegal(type: 'terms' | 'privacy' | 'imprint') {
  legalType.value = type
  legalOpen.value = true
}
</script>

<template>
  <UApp>
    <UMain class="flex">
      <NuxtPage />
    </UMain>

    <!--<USeparator icon="i-lucide-chart-no-axes-gantt" class="text-neutral-300 dark:text-neutral-600" />-->

    <UFooter class="h-12 sm:h-16">
      <template #left>
        <div class="text-neutral-500 dark:text-neutral-400 text-sm ">
        CritList is part of <a href="https://www.uni-paderborn.de/en/project/1614" class="underline inline">"DInt &ndash; Conceptualising a Digital Performance Edition"</a> funded by the DFG under grant no.: 555717918.
        </div>
      </template>
      
      <div class="text-neutral-500 dark:text-neutral-400 text-sm">
      feature requests &amp; bug reports: <a href="mailto:mail@lars-engeln.de" class="underline">mail@lars-engeln.de</a>
      </div>
      <template #right>
        <div class="text-neutral-500 dark:text-neutral-400 text-sm flex items-center gap-4">
          <a href="https://github.com/LarsEngeln/CritList" class="underline" target="_blank" rel="noopener noreferrer">GitHub</a>
          <button class="underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors" @click="openLegal('terms')">Terms of Use</button>
          <button class="underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors" @click="openLegal('privacy')">Privacy</button>
          <button class="underline cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors" @click="openLegal('imprint')">Imprint</button>
        </div>
      </template>
    </UFooter>

    <LegalModal v-model:open="legalOpen" :type="legalType" />
  </UApp>
</template>
