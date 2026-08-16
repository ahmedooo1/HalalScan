# HalalScan

Scanne le code-barres d'un produit et repère les ingrédients à surveiller (porc, alcool, gélatine, présure, E-numéros d'origine animale...), à partir de la base publique [Open Food Facts](https://world.openfoodfacts.org).

Si le produit n'est pas dans la base ou n'a pas d'ingrédients listés, l'appli propose de photographier directement l'étiquette pour une analyse par OCR (reconnaissance de texte).

**Ce n'est pas une certification halal officielle** : c'est un outil d'aide à la vérification basé sur une liste de mots-clés, pas une garantie.

## Stack

- Nuxt 3 (mode SPA, sans backend), Tailwind CSS
- Scan code-barres caméra : `@zxing/browser`
- OCR photo : `tesseract.js`
- Données produits : API publique Open Food Facts (aucune clé requise)

## Démarrer en local

```bash
npm install
npm run dev
```

## Build (site statique)

```bash
npm run generate
```

Produit un dossier `.output/public` servable directement par n'importe quel serveur web statique (nginx, etc.) -- aucun processus Node requis en production.
