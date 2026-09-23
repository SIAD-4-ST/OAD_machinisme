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
     sources: [],                       // [{ code: 'F-VHA', reference: '…', date: '…', page?: '…' }], au moins une si 'valide'
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
| `fiche` | `blocs: [{ type: 'paragraphe' \| 'alerte' \| 'formule', texte }, { type: 'liste', items: ['…' ou { texte, source?, lectureGraphique? }] }, { type: 'tableau', entetes: ['…'], lignes: [['…']] }]` — chaque bloc accepte `source?` et `lectureGraphique?` |
| `procedure` | `intro?`, `etapes: [{ id, texte, detail?, source? }]` |
| `entretien` | `intro?`, `taches: [{ id, texte, periodicite, detail?, source? }]` — périodicités : `chaque-utilisation`, `quotidienne`, `hebdomadaire`, `semestrielle` (« Au moins deux fois par an »), `debut-campagne`, `fin-campagne`, `annuelle` ; `detail` s'affiche entre parenthèses après le texte (ex. « ou toutes les 500 h ») |
| `calculateur` | `intro?`, `calculateur: 'volHa' \| 'debitBuse' \| 'pressionPourVolume' \| 'vitesseMesuree' \| 'debitChantier' \| 'largeurTraitee' \| 'debitCuve' \| 'hauteursBuses' \| 'ecartDiffuseurs'` |
| `quiz` | `questions: [{ id, enonce, choix: ['…'], bonnes: [indices à partir de 0], explication, source? }]` — plusieurs bonnes réponses = question à choix multiples |
| `cas` | `situation`, `source?` (celle de la situation), `options: [{ texte, correct: true/false, retour, source? }]`, au moins une option correcte |

Toute section accepte `technologie?` : `toutes` (défaut), `pneumatique`,
`jets-portes`, `jets-projetes`, `confine`. Elle s'affiche en badge à côté du
type. Le porteur (tracteur, chenillard) n'est pas une technologie. À utiliser
dès qu'une consigne ne vaut que pour une technologie : certaines s'opposent
d'une technologie à l'autre (buse anti-dérive, par exemple).

## Sources et provenance

- Chaque source du module a un **code** unique dans le module : majuscules,
  chiffres, tirets (`F-VHA`, `B20-1`). Reprendre le code de la synthèse du
  corpus quand la source y figure.
- Un élément (bloc, ligne de liste, étape, tâche, question, option de cas,
  section) cite sa source par `source: '<code>'`, qui doit exister dans les
  `sources` du module (sinon « source inconnue »). À l'écran : « Source :
  <référence> (<date>) » sous l'élément.
- `lectureGraphique: true` (bloc ou ligne de liste) : la valeur a été lue sur
  un graphique de la source ; l'écran l'indique.
- Bloc `tableau` : `entetes` et `lignes`, chaque ligne de la longueur des
  en-têtes, cellules en texte (`'0,3 (300)'`).
- **Règle de validation (D-B4-3).** Un module `valide` n'a aucun élément dont
  le texte visible contient un chiffre sans `source` (une liste sourcée couvre
  ses lignes ; la source d'une section couvre son introduction, la situation
  d'un cas, l'énoncé d'un exercice). En `brouillon`, ce n'est pas une erreur :
  le bandeau du module affiche « N éléments chiffrés sans source ».

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
