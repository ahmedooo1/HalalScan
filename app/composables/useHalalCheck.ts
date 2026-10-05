export type Severity = 'forbidden' | 'suspect' | 'positive'

export interface FlaggedIngredient {
  match: string
  severity: Severity
  reasonKey: string
}

export interface HalalVerdict {
  status: 'likely_halal' | 'flagged' | 'unknown'
  flagged: FlaggedIngredient[]
  positiveSignals: FlaggedIngredient[]
}

interface Rule {
  patterns: RegExp[]
  severity: Severity
  reasonKey: string
}

// Les motifs s'appliquent à un texte normalisé (minuscules, sans accents,
// mots coupés en fin de ligne recollés) : « Gélatine », « gelatine » ou
// « géla-\ntine » lu sur une photo sont reconnus de la même façon.
// Numéros E acceptés sous les formes E471, E 471 et E-471.
const e = (n: number) => new RegExp(`\\be ?-?${n}\\b`)

// Ingredients that make a product certainly not halal.
const FORBIDDEN: Rule[] = [
  { patterns: [/\bporc\b/, /\bpork\b/, /\blard\b/, /\bsaindoux\b/, /\bbacon\b/], severity: 'forbidden', reasonKey: 'reason.pork' },
  { patterns: [/\balcool\b/, /\balcohol\b/, /\b(vin|wine)\b/, /\b(biere|beer)\b/, /\brhum\b/, /\brum\b/, /\bethanol\b/, /\bliqueur\b/], severity: 'forbidden', reasonKey: 'reason.alcohol' },
  { patterns: [/\bsang\b/, /\bblood\b/, /\bplasma (animal|sanguin)\b/], severity: 'forbidden', reasonKey: 'reason.blood' },
]

// Ingredients that could be halal or not depending on their exact source --
// flagged for the user to double-check, not an automatic rejection.
const SUSPECT: Rule[] = [
  { patterns: [/\bgelatine?\b/], severity: 'suspect', reasonKey: 'reason.gelatin' },
  { patterns: [/\bpresure\b/, /\brennet\b/], severity: 'suspect', reasonKey: 'reason.rennet' },
  { patterns: [/\bpepsine?\b/], severity: 'suspect', reasonKey: 'reason.pepsin' },
  { patterns: [/\bl-cysteine\b/, e(920)], severity: 'suspect', reasonKey: 'reason.lcysteine' },
  { patterns: [e(441)], severity: 'suspect', reasonKey: 'reason.e441' },
  { patterns: [e(542)], severity: 'suspect', reasonKey: 'reason.e542' },
  { patterns: [e(904), /\bgomme laque\b/, /\bshellac\b/], severity: 'suspect', reasonKey: 'reason.e904' },
  { patterns: [e(471), /\bmono-? ?et diglycerides\b/], severity: 'suspect', reasonKey: 'reason.e471' },
  { patterns: [/\baromes? naturels?\b/, /\bnatural flavou?r(s|ing)?\b/], severity: 'suspect', reasonKey: 'reason.naturalFlavor' },
  { patterns: [/\bgraisse animale\b/, /\banimal fat\b/], severity: 'suspect', reasonKey: 'reason.animalFat' },
  { patterns: [/\bemulsifiant animal\b/, /\bmono glyceride\b/], severity: 'suspect', reasonKey: 'reason.animalEmulsifier' },
]

const POSITIVE: Rule[] = [
  { patterns: [/\bhalal\b/], severity: 'positive', reasonKey: 'reason.halalMention' },
  { patterns: [/\bgelatine de poisson\b/, /\bfish gelatine?\b/], severity: 'positive', reasonKey: 'reason.fishGelatin' },
  { patterns: [/\bpresure (microbienne|vegetale)\b/, /\bmicrobial rennet\b/], severity: 'positive', reasonKey: 'reason.nonAnimalRennet' },
]

/** Minuscules, sans accents, mots coupés en fin de ligne recollés, espaces simplifiés. */
export function normalizeIngredients(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .replace(/([a-z])-\s*\n\s*([a-z])/g, '$1$2')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
}

// Le vinaigre (même de vin) et les mentions « sans alcool » ne sont pas de l'alcool.
const NOT_ALCOHOL = /\b(vinaigre( de vin( blanc| rouge)?)?|(red |white )?wine vinegar|sans alcool|alcohol[- ]free)\b/g

function scan(text: string, rules: Rule[]): FlaggedIngredient[] {
  const found: FlaggedIngredient[] = []
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern)
      if (match) {
        found.push({ match: match[0], severity: rule.severity, reasonKey: rule.reasonKey })
        break
      }
    }
  }
  return found
}

export function useHalalCheck() {
  function analyzeIngredients(ingredientsText: string): HalalVerdict {
    const text = normalizeIngredients(ingredientsText)
    const forbidden = scan(text.replace(NOT_ALCOHOL, ' '), FORBIDDEN)
    const suspect = scan(text, SUSPECT)
    const positive = scan(text, POSITIVE)

    const flagged = [...forbidden, ...suspect]

    let status: HalalVerdict['status']
    if (forbidden.length > 0 || suspect.length > 0) {
      status = 'flagged'
    } else if (!ingredientsText.trim()) {
      status = 'unknown'
    } else {
      status = 'likely_halal'
    }

    return { status, flagged, positiveSignals: positive }
  }

  return { analyzeIngredients }
}
