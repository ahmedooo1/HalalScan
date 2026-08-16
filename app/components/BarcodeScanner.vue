<script setup lang="ts">
const emit = defineEmits<{ detected: [code: string] }>()

const videoEl = ref<HTMLVideoElement | null>(null)
const status = ref<'starting' | 'scanning' | 'denied' | 'error'>('starting')
const errorMsg = ref('')

let controls: { stop: () => void } | null = null

onMounted(async () => {
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ])

    const reader = new BrowserMultiFormatReader(hints)
    status.value = 'scanning'

    controls = await reader.decodeFromVideoDevice(undefined, videoEl.value!, (result) => {
      if (result) {
        emit('detected', result.getText())
      }
    })
  } catch (err: any) {
    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      status.value = 'denied'
    } else {
      status.value = 'error'
      errorMsg.value = err?.message || 'Impossible de démarrer la caméra.'
    }
  }
})

onBeforeUnmount(() => {
  controls?.stop()
})
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-black">
    <video ref="videoEl" class="aspect-[3/4] w-full object-cover sm:aspect-video" muted playsinline />

    <div v-if="status === 'scanning'" class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="relative h-40 w-64 max-w-[80%]">
        <span class="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-lime rounded-tl-lg" />
        <span class="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-lime rounded-tr-lg" />
        <span class="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-lime rounded-bl-lg" />
        <span class="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-lime rounded-br-lg" />
        <span class="scanline absolute left-0 right-0 h-0.5 bg-lime/90 shadow-[0_0_12px_2px_rgba(163,230,53,0.7)]" />
      </div>
    </div>

    <div v-if="status === 'starting'" class="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white/70">
      Ouverture de la caméra...
    </div>

    <div v-if="status === 'denied'" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-6 text-center text-sm text-white/80">
      <p class="font-semibold text-white">Accès caméra refusé</p>
      <p>Autorise la caméra dans les réglages de ton navigateur pour scanner un produit.</p>
    </div>

    <div v-if="status === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-6 text-center text-sm text-white/80">
      <p class="font-semibold text-white">Caméra indisponible</p>
      <p>{{ errorMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes scanline-move {
  0% { top: 4%; }
  50% { top: 94%; }
  100% { top: 4%; }
}
.scanline {
  animation: scanline-move 2.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .scanline { animation: none; top: 50%; }
}
</style>
