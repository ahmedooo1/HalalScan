// Lecture du texte d'une étiquette photographiée.
//
// Le moteur (tesseract.js) et les langues sont servis par le site lui-même
// (public/ocr, copiés au build) : aucun CDN externe à joindre.
// La photo est préparée avant lecture : orientation de l'appareil respectée,
// taille ramenée à ce que le moteur lit le mieux, niveaux de gris et
// contraste renforcé. Une photo de téléphone brute (12 Mpx, couleurs, reflets)
// donne sinon un texte quasi illisible.

const LONGEST_SIDE = 2000
const SHORTEST_SIDE = 1000

async function prepare(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const longest = Math.max(bitmap.width, bitmap.height)
  const shortest = Math.min(bitmap.width, bitmap.height)
  const scale = longest > LONGEST_SIDE ? LONGEST_SIDE / longest : shortest < SHORTEST_SIDE ? Math.min(2, SHORTEST_SIDE / shortest) : 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // Niveaux de gris, puis étirement du contraste entre les 2 % les plus
  // sombres et les 2 % les plus clairs (insensible à quelques reflets).
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = image.data
  const histogram = new Uint32Array(256)
  for (let i = 0; i < px.length; i += 4) {
    const gray = Math.round(0.299 * px[i]! + 0.587 * px[i + 1]! + 0.114 * px[i + 2]!)
    px[i] = gray
    histogram[gray]!++
  }
  const total = px.length / 4
  let low = 0
  let high = 255
  for (let acc = 0; low < 255 && (acc += histogram[low]!) < total * 0.02; low++);
  for (let acc = 0; high > 0 && (acc += histogram[high]!) < total * 0.02; high--);
  const range = Math.max(1, high - low)
  for (let i = 0; i < px.length; i += 4) {
    const v = Math.max(0, Math.min(255, ((px[i]! - low) * 255) / range))
    px[i] = px[i + 1] = px[i + 2] = v
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

export function useOcr() {
  async function readLabel(file: File, onProgress: (percent: number) => void): Promise<string> {
    const canvas = await prepare(file)
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('fra+eng', 1, {
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr/core',
      langPath: '/ocr/lang',
      logger: (m) => {
        if (m.status === 'recognizing text') onProgress(Math.round(m.progress * 100))
      },
    })
    try {
      const { data } = await worker.recognize(canvas)
      return data.text
    } finally {
      await worker.terminate()
    }
  }

  return { readLabel }
}
