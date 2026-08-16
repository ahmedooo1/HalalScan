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

// Ingredients that make a product certainly not halal.
const FORBIDDEN: Rule[] = [
  { patterns: [/\bpor(c|k)\b/i, /\blard\b/i, /\bsaindoux\b/i, /\bbacon\b/i, /\bjambon de porc\b/i], severity: 'forbidden', reasonKey: 'reason.pork' },
  { patterns: [/\balcool\b/i, /\balcohol\b/i, /\b(vin|wine)\b/i, /\b(bière|beer)\b/i, /\brhum\b/i, /\brum\b/i, /\béthanol\b/i, /\bethanol\b/i, /\bliqueur\b/i], severity: 'forbidden', reasonKey: 'reason.alcohol' },
  { patterns: [/\bsang\b/i, /\bblood\b/i, /\bplasma (animal|sanguin)\b/i], severity: 'forbidden', reasonKey: 'reason.blood' },
]

// Ingredients that could be halal or not depending on their exact source --
// flagged for the user to double-check, not an automatic rejection.
const SUSPECT: Rule[] = [
  { patterns: [/\bgélatine\b/i, /\bgelatin(e)?\b/i, /\bgelatine\b/i], severity: 'suspect', reasonKey: 'reason.gelatin' },
  { patterns: [/\bprésure\b/i, /\brennet\b/i], severity: 'suspect', reasonKey: 'reason.rennet' },
  { patterns: [/\bpepsine\b/i, /\bpepsin\b/i], severity: 'suspect', reasonKey: 'reason.pepsin' },
  { patterns: [/\bl-cyst[ée]ine\b/i, /\be920\b/i, /\bl-cysteine\b/i], severity: 'suspect', reasonKey: 'reason.lcysteine' },
  { patterns: [/\be441\b/i], severity: 'suspect', reasonKey: 'reason.e441' },
  { patterns: [/\be542\b/i], severity: 'suspect', reasonKey: 'reason.e542' },
  { patterns: [/\be904\b/i, /\bgomme laque\b/i, /\bshellac\b/i], severity: 'suspect', reasonKey: 'reason.e904' },
  { patterns: [/\be471\b/i, /\bmono[- ]?et diglyc[ée]rides\b/i], severity: 'suspect', reasonKey: 'reason.e471' },
  { patterns: [/\bar[ôo]mes? naturels?\b/i, /\bnatural flavor(s|ing)?\b/i], severity: 'suspect', reasonKey: 'reason.naturalFlavor' },
  { patterns: [/\bgraisse animale\b/i, /\banimal fat\b/i], severity: 'suspect', reasonKey: 'reason.animalFat' },
  { patterns: [/\bemulsifiant animal\b/i, /\bmono glyceride\b/i], severity: 'suspect', reasonKey: 'reason.animalEmulsifier' },
]

const POSITIVE: Rule[] = [
  { patterns: [/\bhalal\b/i], severity: 'positive', reasonKey: 'reason.halalMention' },
  { patterns: [/\bgélatine de poisson\b/i, /\bfish gelatin\b/i], severity: 'positive', reasonKey: 'reason.fishGelatin' },
  { patterns: [/\bprésure (microbienne|végétale)\b/i, /\bmicrobial rennet\b/i], severity: 'positive', reasonKey: 'reason.nonAnimalRennet' },
]

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
    const text = ingredientsText.toLowerCase()
    const forbidden = scan(text, FORBIDDEN)
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
