export type FactsDatabase = 'openfoodfacts' | 'openbeautyfacts' | 'openproductsfacts'

export interface OffProduct {
  found: boolean
  database?: FactsDatabase
  productName?: string
  brand?: string
  imageUrl?: string
  ingredientsText?: string
  labels?: string
}

const DATABASES: { id: FactsDatabase; host: string }[] = [
  { id: 'openfoodfacts', host: 'world.openfoodfacts.org' },
  { id: 'openbeautyfacts', host: 'world.openbeautyfacts.org' },
  { id: 'openproductsfacts', host: 'world.openproductsfacts.org' },
]

const FIELDS = 'product_name,brands,image_front_small_url,ingredients_text_fr,ingredients_text,ingredients_text_en,ingredients_tags,labels'

// Dernier recours quand aucune liste n'est rédigée : les ingrédients reconnus
// par Open Food Facts (« en:gelatin », « fr:porc »...) remis en texte.
const fromTags = (tags?: string[]) => (tags ?? []).map((tag) => tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(', ')

export function useOpenFoodFacts() {
  async function lookupOn(host: string, code: string) {
    const res = await fetch(`https://${host}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null
    return data.product
  }

  // Open Food Facts, Open Beauty Facts and Open Products Facts run on the
  // same platform (Product Opener) with an identical API shape, so a
  // product missing from one is worth trying on the next -- a barcode
  // could just as well be a shampoo or a cleaning product as food.
  async function lookupBarcode(code: string): Promise<OffProduct> {
    for (const db of DATABASES) {
      const p = await lookupOn(db.host, code).catch(() => null)
      if (p) {
        return {
          found: true,
          database: db.id,
          productName: p.product_name || undefined,
          brand: p.brands || undefined,
          imageUrl: p.image_front_small_url || undefined,
          ingredientsText: p.ingredients_text_fr || p.ingredients_text || p.ingredients_text_en || fromTags(p.ingredients_tags),
          labels: p.labels || undefined,
        }
      }
    }
    return { found: false }
  }

  return { lookupBarcode }
}
