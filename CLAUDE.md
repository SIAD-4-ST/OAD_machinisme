# CLAUDE.md — Formation machines

Outil de formation mono-page au format `<x-dc>`, utilisable hors réseau.
Lire ce document en entier avant toute modification ; le détail est dans
`README.md`, `docs/ARCHITECTURE.md` et `docs/CONTENT_GUIDE.md`.

## Contraintes absolues

- **NE JAMAIS modifier `support.js`** ni les fichiers de `vendor/`. Runtime
  générique généré (`// GENERATED from dc-runtime/src/*.ts — do not edit`),
  sources absentes du dépôt ; React 18.3.1 embarqué, octets identiques aux SRI
  écrits dans `support.js`. Empreintes vérifiées par `tests/parite.test.js`.
  Provenance : `docs/PROVENANCE-runtime.md`.
- **React embarqué, hors ligne.** `<head>` charge `vendor/react…`,
  `vendor/react-dom…` puis `support.js` : React étant présent, `support.js` ne
  télécharge rien. Aucune ressource externe (police, CDN) : tout ajout réseau
  casse l'usage au champ.
- **`index.html` n'est pas du HTML classique.** Template `<x-dc>` interprété
  par `support.js` : `<sc-if value="{{ cond }}">`, `<sc-for list="{{ tab }}"
  as="x">`, interpolations `{{ expr }}`, composant `class Component extends
  DCLogic` dans `<script type="text/x-dc" data-dc-script>`. **Pas de JSX**
  (`React.createElement` uniquement), **pas de `<form>`**.
- **Aucune directive (`sc-for`, `sc-if`) dans `<table>`, `<thead>`, `<tbody>`,
  `<tr>`, `<select>` ni leurs descendants.** En `file://`, le gabarit est celui
  du parseur HTML, qui les éjecte : rien ne s'affiche. Un tableau se construit
  par `React.createElement` dans le composant et s'insère par `{{ x }}`.
  Pas de `<select>`. Testé.
- **Le gabarit ne voit que l'objet renvoyé par `renderVals()`** — ni
  `this.state`, ni les méthodes. Toute clé lue par `{{ }}` doit y figurer, sur
  toutes les routes : `valeursVides()` les déclare toutes.
- **`moteur-oad.js` est pur** : sans DOM, sans état, sans réseau, sans horloge,
  sans mise en forme. Double export `module.exports` / `window.OAD`. Toute
  formule, tout seuil, toute règle de notation ou de progression y va
  exclusivement — jamais dans `index.html`. Seule lecture globale :
  `OAD.modules()` (contenu).
- **Contenu hors du code** : un fichier par module dans `contenu/`, déclaré
  dans `contenu/index.js` **et** dans `<helmet>`, dans le même ordre.
- **Aucun build, aucune dépendance npm.** Ouvrir `index.html` suffit.
- **Persistance** : `localStorage`, clé `formation-machines:progression:v1`,
  format `{ version, modules }` ; la progression seule, jamais les saisies.
  Interdits : tout appel réseau, toute saisie dans l'URL (le hash ne porte que
  des identifiants).
- **Horloge** : lue une seule fois, dans `validerQuiz` du composant ; la date
  est passée au moteur.
- **Tests avant ET après toute modification** : `node tests/parite.test.js`.
  Une valeur attendue changée volontairement porte un commentaire : pourquoi +
  prompt/chantier.
- **Sourcing** : chaque valeur préréglée porte son origine (`origineDefaut`
  pour les entrées de calculateur, commentaire pour les constantes) ; sinon
  `ASSUMÉ` avec la raison et qui tranche. Liste au README, section *Valeurs
  ASSUMÉ*.
- **Formats fr-FR** à l'écran : espace insécable, virgule décimale, signe `−`,
  unité après une espace. Mise en forme dans le composant uniquement.
- **Vocabulaire visible** : jamais de numéro de prompt, de chantier ou de
  renvoi au README dans un texte lu par l'utilisateur — seulement en
  commentaire.

## Règles sur le contenu technique

- Aucun chiffre réglementaire, aucune périodicité légale, aucune dose ni
  tolérance écrite de mémoire : le texte primaire est cité (référence et date
  dans `sources`), sinon la phrase renvoie à « la réglementation en vigueur » ou
  à la notice du constructeur.
- Un module rédigé ou modifié passe au statut `brouillon` ; seul le valideur
  du domaine le fait passer à `valide`, avec son nom dans `valideur` et au
  moins une source datée (règle vérifiée par `validerModule`).
- L'outil forme, il ne prescrit pas : pas de recommandation de produit, de
  dose ni de réglage à appliquer tel quel ; les valeurs par défaut des
  calculateurs sont des exemples et l'écran le dit.
- Toute consigne touchant la sécurité (EPI, bouillie, effluents) est relue par
  le valideur avant publication.
- Toute modification de `contenu/` change `EDITION_CONTENU` (`moteur-oad.js`,
  section 7) et la date de la section « Édition du contenu » du README.
- Un expert rédige le contenu sans toucher au code ; un développeur ne modifie
  pas le sens d'un contenu sans l'accord de son rédacteur.

## Où changer quoi

| Changement | Fichier |
|---|---|
| Formule, seuil, notation, progression, route | `moteur-oad.js` (+ test) |
| Module de formation (texte, quiz, procédure…) | `contenu/<id>.js` (+ `contenu/index.js` et `<helmet>` si nouveau) |
| Libellé, mise en page, parcours | gabarit `<x-dc>` d'`index.html` |
| Comportement d'un bouton, texte affiché, mise en forme | `<script data-dc-script>` d'`index.html` |
| `support.js`, `vendor/` | jamais |

## Vérification

1. `node tests/parite.test.js` → `0 FAIL`.
2. Vérificateur du skill oad-maquette :
   `python <skill>/scripts/verifier_maquette.py .`
3. Ouverture d'`index.html` dans un navigateur, réseau coupé (le rendu réel
   n'est pas entièrement testable hors navigateur) ; recette humaine au README.
