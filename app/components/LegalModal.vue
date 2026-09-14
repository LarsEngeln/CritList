<template>
  <UModal class="" v-model:open="open">
    <template #content>
      <UCard class="max-h-[80vh] overflow-y-auto">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="meta.icon" class="text-primary-500" />
            <span class="font-semibold">{{ meta.title }}</span>
          </div>
        </template>

        <!-- Terms of Use -->
        <div v-if="type === 'terms'" class="flex flex-col gap-5 text-sm text-neutral-600 dark:text-neutral-300">
          <!--<p class="text-neutral-400 dark:text-neutral-500 text-xs">Last updated: May 2026</p>-->
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Alpha software</h2>
            <p>CritList is provided as an alpha-stage application. It is offered as-is, without any warranty of fitness for a particular purpose, availability, or reliability. Features, behavior, and data formats may change at any time without prior notice.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Use at your own risk</h2>
            <p>You use CritList entirely at your own risk. The authors accept no liability for data loss, inaccuracies, or any other damages arising from use of the application.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">No guarantees of continuity</h2>
            <p>The service may be modified, suspended, or discontinued at any time. No guarantee of continued availability or backwards compatibility is made.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Acceptable use</h2>
            <p>You agree to use CritList only for lawful purposes and in accordance with applicable laws. You must not attempt to misuse, reverse-engineer, or disrupt the application.</p>
          </section>
        </div>

        <!-- Privacy -->
        <div v-else-if="type === 'privacy'" class="flex flex-col gap-5 text-sm text-neutral-600 dark:text-neutral-300">
          <p class="text-neutral-400 dark:text-neutral-500 text-xs">Last updated: May 2026</p>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">No data collection</h2>
            <p>CritList does not collect, transmit, or store any personal data or usage data. All processing happens locally in your browser. No information ever leaves your device.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">No cookies</h2>
            <p>This application does not use cookies of any kind — no tracking cookies, no session cookies, no third-party cookies.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Third-party services</h2>
            <p>No third-party analytics, advertising, or tracking services are used.</p>
          </section>
          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Contact</h2>
            <p>If you have any questions regarding data protection, please reach out via the project repository.</p>
          </section>
        </div>

        <!-- Imprint -->
        <div v-else-if="type === 'imprint'" class="flex flex-col gap-5 text-sm text-neutral-600 dark:text-neutral-300">
          <p class="text-neutral-400 dark:text-neutral-500 text-xs">Last updated: May 2026</p>

          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Responsible for this site</h2>
            <p class="leading-relaxed">
              Lars Engeln<br>
              Lange Str. 10<br>
              32756 Detmold<br>
              <a href="mailto:mail@lars-engeln.de" class="underline hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">mail(a)lars-engeln.de</a>
            </p>
            <p class="mt-2">The use of contact data published as part of the imprint obligation for unsolicited advertising by third parties (including spam mails) is prohibited. In such cases, the site operator reserves the right to take legal action.</p>
          </section>

          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Liability for content</h2>
            <p>No guarantee can be given for the accuracy, completeness or currency of the content. Should third-party copyrights not be observed, please report this so that action can be taken immediately.</p>
          </section>

          <section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Liability for links</h2>
            <p>The site operator distances himself from links to external third-party websites and therefore assumes no liability for their content, for which the respective operator (or provider) of the site is always responsible. At the time of linking, the respective website was checked for possible legal violations. No illegal content was recognisable. Continuous monitoring of linked pages is not possible. Should a legal infringement become known, the corresponding link will be removed immediately.</p>
          </section>

          <!--<section>
            <h2 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Copyright</h2>
            <p>All content (images, photographs, etc.), if any, is created by the site operator. All content and works created by the site operator are protected by German copyright law. Reproduction, editing and distribution are therefore prohibited. Downloads from this site are only permitted for private, non-commercial use with an appropriate reference to the author. Should third-party copyrights not be observed, please report this so that action can be taken immediately.</p>
          </section>-->
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="ghost" label="Close" @click="open = false" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
type LegalType = 'terms' | 'privacy' | 'imprint'

const props = defineProps<{
  type: LegalType
}>()

const open = defineModel<boolean>('open', { default: false })

const metaMap: Record<LegalType, { title: string; icon: string }> = {
  terms:   { title: 'Terms of Use',             icon: 'i-lucide-scroll-text' },
  privacy: { title: 'Data Protection & Privacy', icon: 'i-lucide-shield-check' },
  imprint: { title: 'Imprint',                   icon: 'i-lucide-building-2' },
}

const meta = computed(() => metaMap[props.type])
</script>
