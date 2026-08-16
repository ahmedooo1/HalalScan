<script setup lang="ts">
import type { HalalVerdict } from '~/composables/useHalalCheck'
import type { FactsDatabase, OffProduct } from '~/composables/useOpenFoodFacts'

type Step = 'scan' | 'lookup' | 'result' | 'ocr' | 'ocr-processing'

const { lookupBarcode } = useOpenFoodFacts()
const { analyzeIngredients } = useHalalCheck()

const DATABASE_LABELS: Record<FactsDatabase, string> = {
  openfoodfacts: 'Open Food Facts',
  openbeautyfacts: 'Open Beauty Facts',
  openproductsfacts: 'Open Products Facts',
}

const step = ref<Step>('scan')
const barcode = ref('')
const product = ref<OffProduct | null>(null)
const verdict = ref<HalalVerdict | null>(null)
const source = ref<FactsDatabase | 'photo'>('openfoodfacts')
const manualBarcode = ref('')
const ocrProgress = ref(0)
const ocrError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const sourceLabel = computed(() => (source.value === 'photo' ? 'une photo' : DATABASE_LABELS[source.value]))

async function handleDetected(code: string) {
  if (step.value !== 'scan') return
  await runLookup(code)
}

async function runLookup(code: string) {
  barcode.value = code
  step.value = 'lookup'
  try {
    const result = await lookupBarcode(code)
    product.value = result
    source.value = result.database || 'openfoodfacts'

    if (result.found && result.ingredientsText && result.ingredientsText.trim().length > 3) {
      verdict.value = analyzeIngredients(result.ingredientsText)
      step.value = 'result'
    } else {
      // Product unknown, or known but without an ingredients list -- offer
      // the OCR fallback instead of dead-ending on "not found".
      step.value = 'ocr'
    }
  } catch {
    step.value = 'ocr'
  }
}

function submitManualBarcode() {
  if (!manualBarcode.value.trim()) return
  runLookup(manualBarcode.value.trim())
}

function openCameraForPhoto() {
  fileInput.value?.click()
}

async function handlePhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  step.value = 'ocr-processing'
  ocrProgress.value = 0
  ocrError.value = ''
  source.value = 'photo'

  try {
    const Tesseract = await import('tesseract.js')
    const { data } = await Tesseract.recognize(file, 'fra+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') ocrProgress.value = Math.round(m.progress * 100)
      },
    })
    verdict.value = analyzeIngredients(data.text)
    step.value = 'result'
  } catch (err) {
    ocrError.value = "La lecture du texte a échoué. Réessaie avec une photo plus nette."
    step.value = 'ocr'
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

function reset() {
  step.value = 'scan'
  barcode.value = ''
  manualBarcode.value = ''
  product.value = null
  verdict.value = null
  ocrError.value = ''
}

const verdictTheme = computed(() => {
  if (!verdict.value) return null
  if (verdict.value.status === 'flagged') {
    const hasForbidden = verdict.value.flagged.some((f) => f.severity === 'forbidden')
    return hasForbidden
      ? { color: 'bad', label: 'Ingrédient non-halal détecté', icon: 'x' }
      : { color: 'warn', label: 'À vérifier', icon: '!' }
  }
  if (verdict.value.status === 'likely_halal') return { color: 'ok', label: 'Rien de suspect trouvé', icon: 'check' }
  return { color: 'warn', label: 'Ingrédients introuvables', icon: '?' }
})
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
    <header class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-lime/15 text-lime">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <span class="font-display text-lg font-semibold text-white">HalalScan</span>
      </div>
      <a href="#a-propos" class="font-mono text-[11px] uppercase tracking-wide text-white/40 hover:text-white/70">À propos</a>
    </header>

    <!-- SCAN -->
    <section v-if="step === 'scan'" class="flex flex-1 flex-col">
      <BarcodeScanner @detected="handleDetected" />
      <p class="mt-4 text-center text-sm text-white/50">
        Vise le code-barres du produit. Le scan se fait automatiquement.
      </p>

      <div class="mt-6 rounded-2xl border border-white/10 bg-panel p-4">
        <p class="mb-2 text-xs font-medium text-white/60">Le scan ne marche pas ?</p>
        <div class="flex gap-2">
          <input
            v-model="manualBarcode"
            type="text"
            inputmode="numeric"
            placeholder="Code-barres (ex: 3017620422003)"
            class="focus-ring min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30"
            @keyup.enter="submitManualBarcode"
          />
          <button class="focus-ring shrink-0 rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-ink" @click="submitManualBarcode">
            OK
          </button>
        </div>
        <button class="mt-3 text-xs text-white/50 underline underline-offset-2 hover:text-white/80" @click="openCameraForPhoto">
          Ou prendre en photo la liste d'ingrédients directement
        </button>
      </div>
    </section>

    <!-- LOOKUP -->
    <section v-else-if="step === 'lookup'" class="flex flex-1 flex-col items-center justify-center gap-4">
      <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-lime pulse-ring">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="animate-spin"><path d="M12 3a9 9 0 100 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
      </div>
      <p class="font-mono text-sm text-white/60">Recherche du produit...</p>
      <p class="font-mono text-xs text-white/30">{{ barcode }}</p>
    </section>

    <!-- OCR PROMPT (product not found or no ingredients listed) -->
    <section v-else-if="step === 'ocr'" class="pop-in flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <span class="flex h-14 w-14 items-center justify-center rounded-full bg-warn/15 text-warn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /></svg>
      </span>
      <div>
        <p class="font-display text-lg font-semibold text-white">
          {{ product?.found ? "Pas d'ingrédients listés pour ce produit" : 'Produit non trouvé dans les bases' }}
        </p>
        <p class="mt-1 max-w-xs text-sm text-white/50">
          Prends en photo la liste d'ingrédients sur l'emballage pour une analyse directe.
        </p>
      </div>
      <p v-if="ocrError" class="text-sm text-bad">{{ ocrError }}</p>
      <button class="focus-ring rounded-full bg-lime px-6 py-3 text-sm font-bold text-ink" @click="openCameraForPhoto">
        Photographier les ingrédients
      </button>
      <button class="text-sm text-white/50 underline underline-offset-2" @click="reset">Scanner un autre produit</button>
    </section>

    <!-- OCR PROCESSING -->
    <section v-else-if="step === 'ocr-processing'" class="flex flex-1 flex-col items-center justify-center gap-4">
      <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-lime pulse-ring">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="animate-spin"><path d="M12 3a9 9 0 100 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
      </div>
      <p class="font-mono text-sm text-white/60">Lecture du texte... {{ ocrProgress }}%</p>
    </section>

    <!-- RESULT -->
    <section v-else-if="step === 'result' && verdict && verdictTheme" class="pop-in flex flex-1 flex-col">
      <div
        class="rounded-3xl border p-6 text-center"
        :class="{
          'border-ok/30 bg-ok/10': verdictTheme.color === 'ok',
          'border-warn/30 bg-warn/10': verdictTheme.color === 'warn',
          'border-bad/30 bg-bad/10': verdictTheme.color === 'bad',
        }"
      >
        <span
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          :class="{
            'bg-ok/20 text-ok': verdictTheme.color === 'ok',
            'bg-warn/20 text-warn': verdictTheme.color === 'warn',
            'bg-bad/20 text-bad': verdictTheme.color === 'bad',
          }"
        >
          <svg v-if="verdictTheme.icon === 'check'" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg v-else-if="verdictTheme.icon === 'x'" width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
          <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /></svg>
        </span>
        <p class="mt-3 font-display text-xl font-semibold text-white">{{ verdictTheme.label }}</p>
        <p v-if="product?.productName" class="mt-1 text-sm text-white/60">{{ product.productName }}<span v-if="product.brand"> &middot; {{ product.brand }}</span></p>
      </div>

      <div v-if="verdict.flagged.length" class="mt-5 space-y-2">
        <p class="font-mono text-[11px] uppercase tracking-wide text-white/40">Ingrédients relevés</p>
        <div
          v-for="(f, i) in verdict.flagged"
          :key="i"
          class="rounded-xl border p-3 text-sm"
          :class="f.severity === 'forbidden' ? 'border-bad/30 bg-bad/5 text-bad' : 'border-warn/30 bg-warn/5 text-warn'"
        >
          <p class="font-semibold capitalize">{{ f.match }}</p>
          <p class="mt-0.5 text-white/60">{{ f.reason }}</p>
        </div>
      </div>

      <div v-if="verdict.positiveSignals.length" class="mt-3 space-y-2">
        <div v-for="(f, i) in verdict.positiveSignals" :key="i" class="rounded-xl border border-ok/30 bg-ok/5 p-3 text-sm text-ok">
          {{ f.reason }}
        </div>
      </div>

      <p class="mt-6 rounded-xl bg-white/5 p-3 text-center text-xs leading-relaxed text-white/40">
        Analyse automatique basée sur {{ sourceLabel }}, pas une certification officielle. En cas de doute, vérifie l'emballage ou contacte le fabricant.
      </p>

      <button class="focus-ring mt-6 rounded-full bg-lime px-6 py-3.5 text-sm font-bold text-ink" @click="reset">
        Scanner un autre produit
      </button>
    </section>

    <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handlePhoto" />

    <footer id="a-propos" class="mt-10 border-t border-white/10 pt-5 text-center text-xs leading-relaxed text-white/35">
      HalalScan croise le code-barres avec les bases publiques
      <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener" class="underline">Open Food Facts</a>,
      <a href="https://world.openbeautyfacts.org" target="_blank" rel="noopener" class="underline">Open Beauty Facts</a>
      et
      <a href="https://world.openproductsfacts.org" target="_blank" rel="noopener" class="underline">Open Products Facts</a>
      (alimentaire, cosmétique, autres produits) et repère les ingrédients à surveiller. Ce n'est pas un organisme de certification halal : c'est un outil d'aide à la vérification, pas une garantie.
    </footer>
  </main>
</template>
