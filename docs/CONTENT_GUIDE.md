# Guide de rédaction du contenu

Chaque module de formation est un fichier de `contenu/`. On le rédige sans
toucher au code de l'outil.

## Ajouter un module

1. **Créer `contenu/<id>.js`** avec l'enveloppe ci-dessous. `<id>` est en
   minuscules, chiffres et tirets, et identique au champ `id`.
   ```js
   (function (m) {
     if (typeof module !== 'undefined' && module.exports) module.exports = m;
     else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
   })({
     id: 'mon-module',
     titre: '…',
     domaine: 'pulverisation',          // ou 'travail-du-sol'
     statut: 'brouillon',               // 'brouillon' | 'a-valider' | 'valide'
     valideur: null,                    // nom du valideur, obligatoire si 'valide'
     resume: '…',
     public: '…',
     dureeMin: 20,
     sources: [],                       // [{ reference: '…', date: 'jj/mm/aaaa' }], au moins une si 'valide'
     sections: [ /* voir ci-dessous */ ]
   });
   ```
2. **L'ajouter à `contenu/index.js`** (tableau des fichiers) **et** dans
   `<helmet>` d'`index.html` (`<script src="contenu/<id>.js"></script>`),
   **au même rang dans les deux**, avant `moteur-oad.js`. Ce rang est l'ordre
   du catalogue.
3. **Lancer `node tests/parite.test.js`** : le schéma de chaque module, la
   correspondance fichier/id et l'ordre `<helmet>` = `contenu/index.js` sont
   vérifiés. À l'écran, un défaut de contenu s'affiche dans un bandeau
   « Contenu à corriger ».

## Sections

Chaque section a un `id` unique dans le module, un `titre` et un `type`.
Les `id` des sections `quiz` et `cas` doivent aussi être uniques sur tout le
catalogue.

| Type | Champs |
|---|---|
| `fiche` | `blocs: [{ type: 'paragraphe' \| 'alerte' \| 'formule', texte }, { type: 'liste', items: ['…'] }]` |
| `procedure` | `intro?`, `etapes: [{ id, texte, detail? }]` |
| `entretien` | `intro?`, `taches: [{ id, texte, periodicite }]` — périodicités : `chaque-utilisation`, `quotidienne`, `hebdomadaire`, `debut-campagne`, `fin-campagne`, `annuelle` |
| `calculateur` | `intro?`, `calculateur: 'volHa' \| 'debitBuse' \| 'pressionPourVolume' \| 'vitesseMesuree' \| 'debitChantier' \| 'largeurTraitee' \| 'debitCuve' \| 'hauteursBuses'` |
| `quiz` | `questions: [{ id, enonce, choix: ['…'], bonnes: [indices à partir de 0], explication }]` — plusieurs bonnes réponses = question à choix multiples |
| `cas` | `situation`, `options: [{ texte, correct: true/false, retour }]`, au moins une option correcte |

## Règles de rédaction

- Aucun chiffre réglementaire, aucune périodicité légale, aucune tolérance
  écrite de mémoire : citer le texte dans `sources`, ou renvoyer à « la
  réglementation en vigueur » / à la notice du constructeur.
- Un module modifié repasse en `brouillon` ; seul le valideur le passe en
  `valide`.
- L'outil forme, il ne prescrit pas : pas de produit, de dose ni de réglage à
  appliquer tel quel.
- Un nouveau calculateur ou une nouvelle formule n'est pas du contenu : c'est
  une évolution du moteur, à demander à un développeur.
