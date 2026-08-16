export type Severity = 'forbidden' | 'suspect' | 'positive'

export interface FlaggedIngredient {
  match: string
  severity: Severity
  reason: string
}

export interface HalalVerdict {
  status: 'likely_halal' | 'flagged' | 'unknown'
  flagged: FlaggedIngredient[]
  positiveSignals: FlaggedIngredient[]
}

interface Rule {
  patterns: RegExp[]
  severity: Severity
  reason: string
}

// Ingredients that make a product certainly not halal.
const FORBIDDEN: Rule[] = [
  { patterns: [/\bpor(c|k)\b/i, /\blard\b/i, /\bsaindoux\b/i, /\bbacon\b/i, /\bjambon de porc\b/i], severity: 'forbidden', reason: 'Porc ou dérivé du porc' },
  { patterns: [/\balcool\b/i, /\balcohol\b/i, /\b(vin|wine)\b/i, /\b(bière|beer)\b/i, /\brhum\b/i, /\brum\b/i, /\béthanol\b/i, /\bethanol\b/i, /\bliqueur\b/i], severity: 'forbidden', reason: "Alcool en tant qu'ingrédient" },
  { patterns: [/\bsang\b/i, /\bblood\b/i, /\bplasma (animal|sanguin)\b/i], severity: 'forbidden', reason: 'Sang ou plasma sanguin' },
]

// Ingredients that could be halal or not depending on their exact source --
// flagged for the user to double-check, not an automatic rejection.
const SUSPECT: Rule[] = [
  { patterns: [/\bgélatine\b/i, /\bgelatin(e)?\b/i, /\bgelatine\b/i], severity: 'suspect', reason: "Gélatine : vérifie qu'elle est bovine halal ou de poisson (pas porcine)" },
  { patterns: [/\bprésure\b/i, /\brennet\b/i], severity: 'suspect', reason: "Présure : vérifie qu'elle est microbienne/végétale ou animale halal" },
  { patterns: [/\bpepsine\b/i, /\bpepsin\b/i], severity: 'suspect', reason: "Pepsine : enzyme parfois d'origine porcine" },
  { patterns: [/\bl-cyst[ée]ine\b/i, /\be920\b/i, /\bl-cysteine\b/i], severity: 'suspect', reason: "L-cystéine (E920) : peut venir de plumes/cheveux ou être synthétique" },
  { patterns: [/\be441\b/i], severity: 'suspect', reason: 'E441 : gélatine' },
  { patterns: [/\be542\b/i], severity: 'suspect', reason: 'E542 : phosphate osseux, origine animale' },
  { patterns: [/\be904\b/i, /\bgomme laque\b/i, /\bshellac\b/i], severity: 'suspect', reason: "E904 (gomme laque) : d'origine insecte, statut débattu" },
  { patterns: [/\be471\b/i, /\bmono[- ]?et diglyc[ée]rides\b/i], severity: 'suspect', reason: "E471 : peut être d'origine animale ou végétale selon le fabricant" },
  { patterns: [/\bar[ôo]mes? naturels?\b/i, /\bnatural flavor(s|ing)?\b/i], severity: 'suspect', reason: "Arômes naturels : peuvent contenir un support alcoolique ou une base animale" },
  { patterns: [/\bgraisse animale\b/i, /\banimal fat\b/i], severity: 'suspect', reason: "Graisse animale d'origine non précisée" },
  { patterns: [/\bemulsifiant animal\b/i, /\bmono glyceride\b/i], severity: 'suspect', reason: "Émulsifiant d'origine possiblement animale" },
]

const POSITIVE: Rule[] = [
  { patterns: [/\bhalal\b/i], severity: 'positive', reason: 'Mention halal trouvée' },
  { patterns: [/\bgélatine de poisson\b/i, /\bfish gelatin\b/i], severity: 'positive', reason: 'Gélatine de poisson (halal)' },
  { patterns: [/\bprésure (microbienne|végétale)\b/i, /\bmicrobial rennet\b/i], severity: 'positive', reason: 'Présure non-animale' },
]

function scan(text: string, rules: Rule[]): FlaggedIngredient[] {
  const found: FlaggedIngredient[] = []
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern)
      if (match) {
        found.push({ match: match[0], severity: rule.severity, reason: rule.reason })
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
