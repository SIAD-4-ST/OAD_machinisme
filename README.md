# Formation machines

Outil de formation au réglage et à l'entretien des machines viticoles
(pulvérisation, travail du sol) : fiches, procédures à cocher, plans
d'entretien, calculateurs à formules ouvertes, quiz et cas pratiques, avec
suivi de progression. Il fonctionne **sans réseau**, sur tablette ou
téléphone au champ.

Ce qu'il ne fait pas : aucune prescription (produit, dose, réglage à appliquer
tel quel) ; les valeurs par défaut des calculateurs sont des exemples dont
l'origine est affichée ; aucune donnée ne quitte l'appareil.

## Sommaire

1. Démarrage rapide
2. Architecture
3. Interface
4. Calculateurs et formules
5. Valeurs ASSUMÉ
6. Tests
7. Recette humaine
8. Journal d'arbitrages — portage x-dc, A1 (23/09/2026)
9. Journal d'arbitrages — portage x-dc, A2 (23/09/2026)
10. Journal d'arbitrages — portage x-dc, A3 (23/09/2026)
11. Points ouverts

## 1. Démarrage rapide

- **Utiliser** : ouvrir `index.html` dans un navigateur (double-clic, `file://`).
  Aucune connexion requise : React est embarqué dans `vendor/`.
- **Distribuer** : copier le **dossier entier** (`index.html`, `support.js`,
  `moteur-oad.js`, `contenu/`, `vendor/`). Un fichier isolé ne fonctionne pas.
- **Tester** : `node tests/parite.test.js` (Node 18 ou plus, sans installation).
- **Ajouter un module** : `docs/CONTENT_GUIDE.md`.

## 2. Architecture

`contenu/` → `moteur-oad.js` → `index.html`, sur le runtime figé `support.js`
et React 18.3.1 embarqué. Détail : `docs/ARCHITECTURE.md` ; décisions :
`docs/DECISIONS.md` ; règles de travail : `CLAUDE.md`.

```
index.html            gabarit <x-dc> + feuille de style + composant DCLogic
moteur-oad.js         logique pure (window.OAD / module.exports)
contenu/<id>.js       un module de formation par fichier
contenu/index.js      ordre du catalogue (Node)
support.js            runtime <x-dc> figé — ne jamais modifier
vendor/               React 18.3.1 UMD — ne jamais modifier
tests/parite.test.js  tests Node sans dépendance
docs/                 architecture, guide de contenu, décisions, provenance du runtime
```

## 3. Interface

**Contexte d'usage.** Chauffeurs et chefs de culture, en formation ou au
champ, sur tablette ou téléphone, souvent hors réseau, parfois en plein
soleil ou avec des gants. Largeur utile minimale : 400 px.

**Critère d'acceptation de l'écran.** Sur un écran de 400 px, hors réseau :
chaque écran se lit sans défilement horizontal ; chaque cible tactile fait au
moins 44 px ; chaque résultat de calcul se relie à sa formule, aux valeurs
utilisées et à l'origine de chaque valeur par défaut ; la progression survit à
la fermeture du navigateur ; l'outil reste utilisable si le stockage est
refusé.

**Parcours.** Catalogue (modules groupés par domaine, statut, durée,
avancement) → module (sommaire, section courante, sections voisines) ; page
Calculateurs (les 5 calculateurs hors module) ; page Progression (tableau par
module, effacement). Navigation par hash : liens profonds et bouton retour.

**Restitution.** Calculateurs : résultats en tête, puis « Détail du calcul »
(formule symbolique, formule avec les valeurs, résultat), et sous chaque champ
la valeur par défaut et son origine. Module non validé : bandeau « Contenu en
cours de rédaction ».

**Sorties.** Impression des procédures et plans d'entretien (bouton dédié ;
l'en-tête, le sommaire et la navigation sont masqués à l'impression).

**Identité visuelle.** Neutre (vert d'accent), thèmes clair et sombre
(automatique selon l'appareil, ou forcé par le bouton « Thème »). Aucune charte
du Comité Champagne appliquée : à confirmer si une charte s'impose (point ouvert).

**Accessibilité.** `aria-current` sur la navigation et le sommaire ;
`aria-live="polite"` sur les sorties de calculateur, de quiz et de cas ;
`role="progressbar"` sur les jauges ; `<fieldset>`/`<legend>` pour les
questions ; `aria-pressed` sur les choix ; focus visible.

## 4. Calculateurs et formules

| Calculateur | Formule | Défauts → résultat |
|---|---|---|
| Volume par hectare (`volHa`) | V = 600 × Q / (v × L) | 6 L/min, 6 km/h, 2,5 m → 240 L/ha |
| Débit par buse (`debitBuse`) | Q = V × v × L / 600 ; q = Q / n | 150 L/ha, 6 km/h, 2,5 m, 12 buses → 3,75 L/min ; 0,31 L/min |
| Pression pour un nouveau volume (`pressionPourVolume`) | P2 = P1 × (V2 / V1)^(1 / b) | 8 bar, 150 → 180 L/ha, b = 0,5 → 11,5 bar (11,52) |
| Vitesse réelle mesurée (`vitesseMesuree`) | v = 3,6 × d / t | 100 m, 60 s → 6 km/h |
| Débit de chantier théorique (`debitChantier`) | S = v × L / 10 | 6 km/h, 2,5 m → 1,5 ha/h |

Les facteurs 600, 3,6 et 10 sont des conversions d'unités, démontrées en
commentaire dans `moteur-oad.js`. Alerte de pression hors de
`PLAGE_PRESSION_ALERTE_BAR`.

## 5. Valeurs ASSUMÉ

Valeurs sans source, affichées comme telles à l'écran. Aucune n'est modifiée
tant que le valideur désigné ne l'a pas tranchée (O4).

| Calculateur | Entrée | Valeur | Qui tranche |
|---|---|---|---|
| Volume par hectare | Débit total Q | 6 L/min | Valideur pulvérisation (O4) |
| Volume par hectare | Vitesse v | 6 km/h | Valideur pulvérisation (O4) |
| Volume par hectare | Largeur L | 2,5 m | Valideur pulvérisation (O4) |
| Débit par buse | Volume visé V | 150 L/ha | Valideur pulvérisation (O4) |
| Débit par buse | Vitesse v | 6 km/h | Valideur pulvérisation (O4) |
| Débit par buse | Largeur L | 2,5 m | Valideur pulvérisation (O4) |
| Débit par buse | Nombre de buses n | 12 | Valideur pulvérisation (O4) |
| Pression pour un nouveau volume | Pression actuelle P1 | 8 bar | Valideur pulvérisation (O4) |
| Pression pour un nouveau volume | Volume actuel V1 | 150 L/ha | Valideur pulvérisation (O4) |
| Pression pour un nouveau volume | Volume visé V2 | 180 L/ha | Valideur pulvérisation (O4) |
| Débit de chantier théorique | Vitesse v | 6 km/h | Valideur travail du sol (O4) |
| Débit de chantier théorique | Largeur L | 2,5 m | Valideur travail du sol (O4) |
| Pression pour un nouveau volume (alerte) | `PLAGE_PRESSION_ALERTE_BAR` | 1 à 25 bar | Valideur pulvérisation (O4) |

Hors tableau, parce que ce ne sont pas des réglages : `b = 0,5` (« Valeur fixe
de l'outil IFV Mon réglage pulvé (code lu le 22/09/2026) ») ; `d = 100 m` et
`t = 60 s` de la vitesse mesurée (« Exemple de calcul, sans valeur de
réglage »).

**Contenu des modules.** Les trois modules sont au statut `brouillon`, sans
valideur ni source : rédaction initiale du 23/09/2026, à relire entièrement
par les valideurs pulvérisation et travail du sol.

## 6. Tests

`node tests/parite.test.js` — 67 tests au 23/09/2026 :

| Section | Objet |
|---|---|
| §1 Formules | 7 formules, gardes de saisie, registre avec défauts |
| §2 Contenu et schéma | conformité des 3 modules, `validerModule` sur un module fabriqué |
| §3 A1 — ajouts | routes, libellés, registre, ordre du catalogue, dédoublonnage navigateur, quiz, progression |
| §4 A2 | sorties brutes, `substituer`, date injectée, `origineDefaut`, moteur sans horloge ni formatage |
| §5 A3 — statiques | pas de `<form>`/JSX/réseau, pas de directive dans `table`/`select`, ordre `<helmet>`, calcul délégué, SHA de `support.js` et `vendor/` |
| §6 A3 — rendu à blanc | chaque route (34) sans exception ni clé manquante ; saisie Q = 12 → 480 L/ha ; quiz validé → score ; progression écrite et relue ; stockage refusé |

Vérificateur du skill oad-maquette : `python <skill>/scripts/verifier_maquette.py .`
→ OK, sans avertissement.

## 7. Recette humaine

Contrôles non automatisables, à faire à chaque changement d'écran. Contrôles
déjà faits le 23/09/2026 dans Edge sans interface, `file://`, réseau bloqué :
rendu du catalogue, d'un calculateur, d'un quiz et du tableau de progression ;
mise en page dans un cadre de 400 px ; thèmes clair et sombre. **Pas encore
fait : tout ce qui suit sur le matériel cible.**

1. **Tablette cible, mode avion, ouverture en `file://`.** Consigner ici le
   moyen d'ouvrir un dossier local sur ce support (gestionnaire de fichiers,
   application, carte SD…) : _à renseigner_. Si le dossier ne s'ouvre pas,
   voir D-A3-4.
2. **Safari iOS**, si le parc en comporte.
3. **Largeur 400 px** : aucun débordement horizontal, sur chaque écran.
4. **Thème sombre** : lisibilité, contrastes, en plein jour aussi.
5. **Bouton retour** entre deux sections d'un module.
6. **Navigation privée, stockage refusé** : l'outil reste utilisable (sans
   mémoire de progression).
7. **Impression d'une procédure** : seule la section s'imprime, lisible.
8. Parcours d'acceptation (Chrome de bureau, Wi-Fi coupé) : catalogue affiché ;
   « Volume par hectare », Q = 12 (v = 6, L = 2,5) → 480 L/ha ; quiz validé →
   score affiché ; page rechargée → progression conservée ; onglet réseau des
   outils de développement : aucune requête hors `file://`.

## 8. Journal d'arbitrages — portage x-dc, A1 (23/09/2026)

**Problème.** Donner à l'outil un moteur pur, testable sous Node et appelable
par l'écran x-dc (`window.OAD`), avec un contenu rédigeable par des experts.

**Constat préalable.** Le prompt A1 portait `src/engine` et `src/content`
existants ; le dossier était vide. Moteur et contenu ont été **écrits**, pas
portés : il n'y a pas de parité à vérifier avec une version antérieure, et le
contrôle `/tmp/parite-a1.mjs` n'avait pas d'objet. Les attendus des tests sont
calculés à la main.

- **D-A1-1** : `lireRoute(hash)` (paramètre obligatoire) et `lien(...)` dans
  le moteur, testables sous Node.
- **D-A1-2** : contenu hors du moteur, un fichier par module ; `OAD.modules()`
  lit `contenu/index.js` sous Node et `window.OAD_CONTENU` dans le navigateur,
  au moment de l'appel. Seul accès global du moteur. Ajout : dédoublonnage par
  id dans le navigateur (chaque script de `<helmet>` s'exécute deux fois) et
  `ordonnerModules(modules, ids)` pour rétablir l'ordre déclaré.
- **D-A1-3** : pas de stockage dans le moteur ; persistance dans le composant.
- **D-A1-4** : les fonctions de registre prennent la liste des modules en
  paramètre.

**Refusé.** Contenu littéral dans le moteur (rédaction réservée aux
développeurs). **Point de révision.** D-A1-2 : si les experts ne rédigent
jamais les fichiers, le contenu peut rejoindre le moteur.
**Hors périmètre.** Aucune valeur de réglage sourcée ; aucun module validé.

## 9. Journal d'arbitrages — portage x-dc, A2 (23/09/2026)

- **D-A2-1** : chaque étape de calcul est `{ titre, formule, gabarit,
  operandes[{valeur, decimales}], resultat{valeur, unite, decimales} }` ; la
  vue formate et appelle `OAD.substituer`. Le moteur ne contient ni
  `toLocaleString` ni formatage (testé). Alternative écartée : arbre
  d'expression, trop lourd pour 5 calculateurs.
- **D-A2-2** : `enregistrerQuiz(p, moduleId, sectionId, score, dateISO)` ;
  date absente ou non-chaîne → `null`, sans lever. Le moteur ne lit pas
  l'horloge (testé).
- **D-A2-3** : chaque entrée porte `origineDefaut`, affiché sous le champ.
  15 entrées ; exceptions `b` (IFV) et `d`, `t` (exemple de calcul). Tableau en
  section 5.

Ajout hors prompt : une valeur non calculable vaut `null` (jamais `NaN`) et
produit l'alerte « Calcul impossible… ».

## 10. Journal d'arbitrages — portage x-dc, A3 (23/09/2026)

- **D-A3-1** : navigation par hash (`hashchange`, retrait au démontage), route
  calculée par `OAD.lireRoute`, identifiants seulement dans l'URL.
- **D-A3-2** : progression sous `formation-machines:progression:v1`, format
  `{ version, modules }`, par `lireProgression` / `ecrireProgression` avec
  try/catch. Écart assumé au format `{ version, v }` du squelette. (Aucune
  progression antérieure n'existait : la clé est gardée pour rester conforme
  au prompt ; révisable sans perte.)
- **D-A3-3** : aucune directive dans `table`/`select` ; tableau de progression
  construit par `React.createElement` (`tableauProgression()`) ; pas de
  `<select>`.
- **D-A3-4** : distribution = le dossier, ouvert par `index.html` ; pas
  d'assemblage. Révisable après la recette tablette.
- **D-A3-5** : interface conçue pour ce projet (aucun écran antérieur à
  reproduire) : jetons `:root`, thème sombre, gouttière 16 px, cibles 44 px.
- **D-A3-6** : `marquerVue` dans `componentDidMount` / `componentDidUpdate`,
  seulement quand la route change, jamais dans `renderVals()` (testé).

Ajouts nécessaires constatés : les scripts de `<helmet>` se chargent après le
premier rendu, donc le composant attend le moteur et le contenu (10 s au plus,
puis message d'échec) ; préférence de thème stockée à part.

## 11. Points ouverts

- **O4** : valeurs ASSUMÉ (section 5) et seuil 1–25 bar, à trancher par les
  valideurs.
- Relecture et validation des trois modules (statut `brouillon`).
- L'origine de `b = 0,5` (« outil IFV Mon réglage pulvé ») est reprise du
  prompt A2, non vérifiée lors de la création.
- Les textes `origineDefaut` affichés contiennent « (O4) », référence interne
  lisible par l'apprenant : texte imposé par D-A2-3, à reformuler si l'on
  applique strictement la règle de vocabulaire visible.
- Charte graphique éventuelle du Comité Champagne.
- Recette sur la tablette cible (section 7).
