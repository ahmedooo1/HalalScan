// Copie le moteur de lecture de texte (tesseract.js) et le français dans
// public/ocr : le site les sert lui-même au lieu de dépendre d'un CDN
// (bloqué par certains réseaux ou par la politique de sécurité du site).
import { cpSync, mkdirSync, rmSync } from 'node:fs'

const out = 'public/ocr'
rmSync(out, { recursive: true, force: true })
mkdirSync(`${out}/core`, { recursive: true })
mkdirSync(`${out}/lang`, { recursive: true })

cpSync('node_modules/tesseract.js/dist/worker.min.js', `${out}/worker.min.js`)
for (const variant of ['lstm', 'simd-lstm', 'relaxedsimd-lstm']) {
  cpSync(`node_modules/tesseract.js-core/tesseract-core-${variant}.wasm.js`, `${out}/core/tesseract-core-${variant}.wasm.js`)
}
for (const lang of ['fra']) {
  cpSync(`node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`, `${out}/lang/${lang}.traineddata.gz`)
}
console.log('OCR : moteur et langues copiés dans public/ocr')
