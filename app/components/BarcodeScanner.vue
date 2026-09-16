<script setup lang="ts">
const emit = defineEmits<{ detected: [code: string] }>()
const { t } = useI18n()

const videoEl = ref<HTMLVideoElement | null>(null)
const status = ref<'starting' | 'scanning' | 'denied' | 'error'>('starting')
const errorMsg = ref('')

interface BarcodeDetectorResult {
  rawValue: string
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>
}
interface BarcodeDetectorConstructorLike {
  new (options: { formats: string[] }): BarcodeDetectorLike
  getSupportedFormats(): Promise<string[]>
}

const SUPPORTED_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']

// Ask for a sharp, continuously-focused rear-camera feed instead of
// whatever low-res default getUserMedia would otherwise pick -- this is
// most of what makes users "hunt" for the right distance/angle.
const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    advanced: [{ focusMode: 'continuous' } as any],
  },
}

let controls: { stop: () => void } | null = null
let nativeStream: MediaStream | null = null
let rafId: number | null = null
let stopped = false

// Chrome/Edge/Android expose a hardware-accelerated native decoder that
// reads several times faster than the pure-JS zxing fallback. Use it when
// available; otherwise fall back to zxing (needed for Safari/Firefox).
async function startNativeDetector(): Promise<boolean> {
  const BarcodeDetectorCtor = (window as any).BarcodeDetector as BarcodeDetectorConstructorLike | undefined
  if (!BarcodeDetectorCtor) return false

  let formats: string[]
  try {
    const supported = await BarcodeDetectorCtor.getSupportedFormats()
    formats = SUPPORTED_FORMATS.filter((f) => supported.includes(f))
  } catch {
    return false
  }
  if (!formats.length) return false

  try {
    nativeStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
    videoEl.value!.srcObject = nativeStream
    await videoEl.value!.play()

    const detector = new BarcodeDetectorCtor({ formats })
    status.value = 'scanning'

    const tick = async () => {
      if (stopped) return
      try {
        const codes = await detector.detect(videoEl.value!)
        if (codes.length) emit('detected', codes[0].rawValue)
      } catch {
        // transient per-frame decode error -- keep scanning
      }
      if (!stopped) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return true
  } catch {
    nativeStream?.getTracks().forEach((track) => track.stop())
    nativeStream = null
    return false
  }
}

async function startZxingFallback() {
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

  // Default zxing only retries every 500ms; 120ms keeps it responsive
  // without pegging the CPU on low-end phones.
  const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 })
  status.value = 'scanning'

  controls = await reader.decodeFromConstraints(VIDEO_CONSTRAINTS, videoEl.value!, (result) => {
    if (result) emit('detected', result.getText())
  })
}

onMounted(async () => {
  try {
    const usedNative = await startNativeDetector()
    if (!usedNative) await startZxingFallback()
  } catch (err: any) {
    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      status.value = 'denied'
    } else {
      status.value = 'error'
      errorMsg.value = err?.message || t('camera.errorDefault')
    }
  }
})

onBeforeUnmount(() => {
  stopped = true
  if (rafId !== null) cancelAnimationFrame(rafId)
  controls?.stop()
  nativeStream?.getTracks().forEach((track) => track.stop())
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
      {{ t('camera.opening') }}
    </div>

    <div v-if="status === 'denied'" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-6 text-center text-sm text-white/80">
      <p class="font-semibold text-white">{{ t('camera.deniedTitle') }}</p>
      <p>{{ t('camera.deniedBody') }}</p>
    </div>

    <div v-if="status === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-6 text-center text-sm text-white/80">
      <p class="font-semibold text-white">{{ t('camera.errorTitle') }}</p>
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
