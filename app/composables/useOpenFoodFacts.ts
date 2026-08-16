export interface OffProduct {
  found: boolean
  productName?: string
  brand?: string
  imageUrl?: string
  ingredientsText?: string
  labels?: string
}

export function useOpenFoodFacts() {
  async function lookupBarcode(code: string): Promise<OffProduct> {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,image_front_small_url,ingredients_text_fr,ingredients_text,labels`,
    )
    if (!res.ok) return { found: false }
    const data = await res.json()
    if (data.status !== 1 || !data.product) return { found: false }

    const p = data.product
    return {
      found: true,
      productName: p.product_name || undefined,
      brand: p.brands || undefined,
      imageUrl: p.image_front_small_url || undefined,
      ingredientsText: p.ingredients_text_fr || p.ingredients_text || '',
      labels: p.labels || undefined,
    }
  }

  return { lookupBarcode }
}
