<script setup lang="ts">
// Photo de l'étiquette prise dans l'application, sans ouvrir l'appareil photo
// du téléphone : sur Android, quitter la page pour l'appareil photo peut
// faire fermer l'onglet faute de mémoire, et l'utilisateur revenait alors à
// l'accueil sans résultat.
const emit = defineEmits<{ captured: [photo: Blob]; unavailable: []; cancel: [] }>()
const { t } = useI18n()

const videoEl = ref<HTMLVideoElement | null>(null)
const ready = ref(false)
const taking = ref(false)
let stream: MediaStream | null = null

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 2560 },
        height: { ideal: 1440 },
        advanced: [{ focusMode: 'continuous' } as any],
      },
    })
    videoEl.value!.srcObject = stream
    await videoEl.value!.play()
    ready.value = true
  } catch {
    emit('unavailable')
  }
})

onBeforeUnmount(() => stream?.getTracks().forEach((track) => track.stop()))

async function take() {
  if (!stream || taking.value) return
  taking.value = true
  try {
    const track = stream.getVideoTracks()[0]!
    // Photo pleine résolution quand le navigateur le permet (Chrome Android),
    // sinon l'image affichée par la caméra.
    const ImageCaptureCtor = (window as any).ImageCapture
    if (ImageCaptureCtor) {
      try {
        // Certains appareils ne répondent jamais : 4 s au plus.
        const photo = await Promise.race<Blob | null>([
          new ImageCaptureCtor(track).takePhoto(),
          new Promise((resolve) => setTimeout(() => resolve(null), 4000)),
        ])
        if (photo) {
          emit('captured', photo)
          return
        }
      } catch {
        // on se rabat sur l'image vidéo
      }
    }
    const video = videoEl.value!
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (blob) emit('captured', blob)
  } finally {
    taking.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative overflow-hidden rounded-3xl bg-black">
      <video ref="videoEl" class="aspect-[3/4] w-full object-cover" muted playsinline />
      <div v-if="ready" class="pointer-events-none absolute inset-5 rounded-2xl border-2 border-dashed border-lime/70" />
      <p v-if="ready" class="pointer-events-none absolute inset-x-0 bottom-3 text-center"><span class="rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">{{ t('ocr.frameHint') }}</span></p>
      <div v-else class="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white/70">{{ t('camera.opening') }}</div>
    </div>
    <button
      type="button"
      class="focus-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-lime transition active:scale-90 disabled:opacity-40"
      :disabled="!ready || taking"
      :aria-label="t('ocr.capture')"
      @click="take"
    />
    <button type="button" class="text-sm text-white/50 underline underline-offset-2" @click="emit('cancel')">{{ t('ocr.cancel') }}</button>
  </div>
</template>
