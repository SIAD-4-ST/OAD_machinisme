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
12. Lot B — portes et état
13. À contrôler au document primaire
14. Consignes retirées, à reproposer au valideur
15. Édition du contenu
16. Journal d'arbitrages — lot B

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
état, quiz réussis) → module (sommaire, section courante, sections voisines) ; page
Calculateurs (les calculateurs hors module) ; page Progression (tableau par
module : sections consultées, quiz, quiz réussis, état ; effacement).

**Progression.** L'état d'un module est calculé, jamais stocké : *Non
commencé*, *En cours*, *Consulté* (toutes les sections ouvertes), *Maîtrisé*
(en plus, tous les quiz et exercices réussis à 100 %, tentatives illimitées).
Un module sans quiz ni exercice plafonne à *Consulté* (« Pas de quiz dans ce
module »). Clé et format de stockage inchangés : une progression enregistrée
avant B6 se relit sans migration. Pied de page : date d'édition du contenu. Navigation par hash : liens profonds et bouton retour.

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
| Volume par hectare (`volHa`) | V = 600 × Q / (v × L) | 9,6 L/min, 5 km/h, 7,7 m → 150 L/ha (149,61) |
| Débit par buse (`debitBuse`) | Q = V × v × L / 600 ; q = Q / n | 150 L/ha, 5 km/h, 7,7 m, 12 buses → 9,63 L/min ; 0,8 L/min |
| Pression pour un nouveau volume (`pressionPourVolume`) | P2 = P1 × (V2 / V1)^(1 / b) | 3 bar, 150 → 180 L/ha, b = 0,5, plage de la buse 3 à 4,5 bar → 4,3 bar (4,32), sans alerte |
| Vitesse réelle mesurée (`vitesseMesuree`) | v = 3,6 × d / t | 50 m, 30 s → 6 km/h |
| Débit de chantier théorique (`debitChantier`) | S = v × L / 10 | 6 km/h, 2,5 m → 1,5 ha/h |
| Largeur traitée (`largeurTraitee`) | L = n × e | 7 rangs, 1,10 m → 7,7 m |
| Débit total par le niveau de la cuve (`debitCuve`) | Q = volume refait / durée | 48 L, 5 min → 9,6 L/min |
| Volume selon le nombre de hauteurs de buses (`hauteursBuses`) | V2 = V1 × h2 / h1 | 180 L/ha, 3 → 2 hauteurs → 120 L/ha |
| Écart entre diffuseurs (`ecartDiffuseurs`) | m = Σ q / n ; e = (q − m) / m | 1,40 ; 1,38 ; 1,52 ; 1,41 ; 1,25 ; 1,39 ; 1,40 L/min → moyenne 1,39 L/min ; diffuseur n° 5 à −10,26 %, à contrôler |

Neuf calculateurs. `ecartDiffuseurs` reçoit une **liste** (valeurs séparées
par un point-virgule, la virgule restant décimale) et affiche le détail par
diffuseur dans un tableau ; un diffuseur est signalé si son écart dépasse
strictement 10 % (`ECART_DIFFUSEUR_MAX`, F-VHA).

Formule sans calculateur, utilisée par les tests du cas pratique :
`volumeApresChangementVitesse(V1, v1, v2) = V1 × v1 / v2`.

Les facteurs 600, 3,6 et 10 sont des conversions d'unités, démontrées en
commentaire dans `moteur-oad.js`. Alerte de pression : le résultat est
comparé à la plage de la buse **saisie** (`pMin`, `pMax`) ; hors plage,
l'écran conseille de changer de calibre ou de vitesse plutôt que de forcer
la pression (D-B1-2). Le calculateur de pression indique sa portée : buses
hydrauliques, pas les diffuseurs pneumatiques.

## 5. Valeurs ASSUMÉ

Valeurs sans source, affichées à l'écran « Valeur d'exemple, sans source : à
confirmer par le référent ». Aucune n'est modifiée tant que le référent
désigné ne l'a pas tranchée.

| Calculateur | Entrée | Valeur | Qui tranche |
|---|---|---|---|
| Débit par buse | Nombre de buses n | 12 | Référent pulvérisation (D-B1-3 : le corpus ne donne pas de nombre de buses par matériel) |
| Débit de chantier théorique | Vitesse v | 6 km/h | Référent travail du sol (D-B1-4 : aucune vitesse d'interceps dans le corpus) |
| Débit de chantier théorique | Largeur L | 2,5 m | Référent travail du sol (D-B1-4) |
| Écart entre diffuseurs | Liste des débits | 1,40 ; 1,38 ; 1,52 ; 1,41 ; 1,25 ; 1,39 ; 1,40 L/min | Exemple fabriqué pour l'exercice (D-B3-5), sans valeur de réglage ; affiché « Exemple fabriqué pour l'exercice » |

Depuis B1, les autres valeurs par défaut sont reprises de la synthèse du
corpus et listées en section 13 (à contrôler au document primaire). Hors
tableau, parce que ce n'est pas un réglage : `b = 0,5` (« Valeur fixe de
l'outil IFV Mon réglage pulvé (code lu le 22/09/2026) »). `Q = 9,6 L/min` de
`volHa` est **déduit** de 150 L/ha à 5 km/h sur 7,7 m (9,625 arrondi, D-B1-1).

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
7 bis. **Écart entre diffuseurs sur 400 px** : le tableau de 7 diffuseurs se
   lit sans défilement horizontal de la page (le tableau défile dans son
   conteneur s'il le faut) ; la ligne « à contrôler » reste lisible dans les
   deux thèmes.
8. Parcours d'acceptation (Chrome de bureau, Wi-Fi coupé) : catalogue affiché ;
   « Volume par hectare », Q = 12 (v = 5, L = 7,7) → 187 L/ha ; quiz validé →
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

- ~~**O4** : valeurs ASSUMÉ (section 5) et seuil 1–25 bar~~ — clos par B1 :
  défauts recalés sur le corpus, seuil remplacé par la plage de la buse
  saisie. Restent ASSUMÉ : `n` et `debitChantier` (section 5).
- Relecture et validation des trois modules (statut `brouillon`).
- L'origine de `b = 0,5` (« outil IFV Mon réglage pulvé ») est reprise du
  prompt A2, non vérifiée lors de la création.
- ~~Les textes `origineDefaut` affichés contiennent « (O4) »~~ — clos par B1
  (D-B1-5), testé.
- ~~Contenu non relié au moteur (fragilité F5 de l'audit)~~ — clos par B5 :
  section `exercice` corrigée par le moteur ; nombres des cas pratiques
  vérifiés par `CAS_CHIFFRES` (garde statique contre les ajouts).
- Charte graphique éventuelle du Comité Champagne.
- Recette sur la tablette cible (section 7).

## 12. Lot B — portes et état

Le lot B (audit du 23/09/2026, arbitrages A1 à A5) se fait sur la branche
`lot-b`. Le dépôt est public : fusionner dans `main`, c'est publier. Un
prompt soumis à une porte peut être exécuté sur `lot-b`, mais pas fusionné
tant que la porte n'est pas levée.

| Porte | Objet | Qui la lève | Prompts concernés | Levée le |
|---|---|---|---|---|
| **G1** | Droit de reprendre les valeurs et schémas des fiches du Groupe Machinisme Champenois (CC BY-NC-ND 3.0) et des articles B20 (*Le Vigneron Champenois*, avril–mai 2020) | Direction de la communication / service juridique du Comité Champagne ; co-auteurs des fiches cosignées (CA 51, Magister, GDV 51, CV-CNF) | B1 à B3 (valeurs par défaut et origines affichées), B7 à B12 | |
| **G2** | Validité en 2026 des valeurs 2014–2016, et désignation des valideurs | Référent pulvérisation / machinisme du Service vigne | Passage d'un module en `valide` ; B12 en entier | |
| **G3** | Hébergement public et mise en ligne | DSI et direction de la communication | Tout déploiement (B13 est un essai, pas un déploiement) | |
| **G4** | Consigne de buse anti-dérive en jets portés (TVI) | Responsable pulvérisation du Comité Champagne | Aucun prompt du lot : sujet exclu | |

### Écart avec la synthèse du corpus, §1

La synthèse du corpus (`docs/corpus/synthese-corpus-formation-machines.md`,
hors dépôt, D-B0-2) décrit en §1 une spécification antérieure qui n'a pas été
retenue : `synthesePulve` / `syntheseSol`, `OAD.CONTENU`, buse de référence
`BUSE_REF` ATR Blanche, clé de stockage `oad-formation-machines-v1`,
typographie 36 / 22 / 13,5 / 11,5 px. **Le dépôt fait foi pour
l'architecture. La synthèse fait foi pour les valeurs**, sous réserve de
D-B0-4 : c'est une source secondaire ; chaque valeur reprise porte son code
source (F-VHA, B20-1…) et figure en §13 jusqu'au contrôle au document
primaire ; aucune valeur absente de la synthèse n'est ajoutée.

## 13. À contrôler au document primaire

Valeurs reprises de la synthèse du corpus (source secondaire, D-B0-4), à
contrôler une à une sur le document primaire.

| Valeur | Où dans l'outil | Code source | Page | Contrôlé le | Par |
|---|---|---|---|---|---|
| Largeur traitée 7 × 1,10 m = 7,7 m | `volHa.L`, `debitBuse.L` | F-VHA | | | |
| Vitesse 5 km/h | `volHa.v`, `debitBuse.v` | F-CGE, F-CGA, F-JET, F-PRE, F-IDE, F-GRE | | | |
| 150 L/ha en pleine végétation | `debitBuse.V`, `pressionPourVolume.V1` | F-CGE, F-CGA, F-JET | | | |
| 150–180 L/ha en pleine végétation (jets portés) | `pressionPourVolume.V2` (180) | F-PRE, F-IDE | | | |
| 50 m en 30 s → 6 km/h | `vitesseMesuree.d`, `vitesseMesuree.t` | F-VHA | | | |
| Pression de travail 3,0–4,5 bar, TeeJet Conejet TXA80 0050 | `pressionPourVolume.pMin`, `.pMax`, `.P1` (3) | F-PRE, F-IDE | | | |
| 7 rangs × 1,10 m | `largeurTraitee.n`, `.e` | F-VHA | | | |
| Durée de mesure au niveau de cuve : 5 min (pneumatiques, jets portés), 2 min (jets projetés) | `debitCuve.duree` | F-VHA | | | |
| 180 L/ha avec 3 hauteurs de buses → 120 L/ha avec 2 | `hauteursBuses.V1`, `.h1`, `.h2` | A-LVC | | | |
| Intervention si écart d'un diffuseur > 10 % à la moyenne (strict : « supérieur à ») | `ECART_DIFFUSEUR_MAX`, calculateur `ecartDiffuseurs` | F-VHA | | | |
| Formule Volume/ha = Débit × 600 / (Vitesse × Largeur) | `pulve-reglage-volume` › principes | F-VHA | | | |
| Largeur : 7 × 1,10 m = 7,7 m ; chenillard 1, 2 ou 3 écartements | `pulve-reglage-volume` › principes, `exo-volume` | F-VHA | | | |
| Mesure de vitesse « départ lancé » sur 50 m ; v = d × 3,6 / t | `pulve-reglage-volume` › mesure-vitesse, `exo-vitesse` (50 m en 35 s) | F-VHA | | | |
| Table temps → vitesse sur 50 m : 27,5 s → 6,5 ; 30 → 6 ; 32,5 → 5,5 ; 35 → 5,1 ; **37 → 4,8** ; 40 → 4,5 ; 45 → 4 ; 60 s → 3 km/h | `pulve-reglage-volume` › table-vitesse | F-VHA | | | |
| (note : 50 × 3,6 / 37 = 4,86, soit 4,9 à l'arrondi ; la source donne 4,8 — à vérifier au document primaire) | | | | | |
| Débit par le niveau de cuve : 2 min (jets projetés, pendillards) ou 5 min (pneumatiques, jets portés) | `pulve-reglage-volume` › mesure-debit | F-VHA | | | |
| Écart > 10 % à la moyenne : nettoyage, buse ou pastille, anti-gouttes | `pulve-reglage-volume` › controle-diffuseurs | F-VHA | | | |
| Exercice : 9,6 L/min, 5 km/h, 7,7 m → 150 L/ha | `pulve-reglage-volume` › exo-volume | F-VHA (valeurs d'exemple de B1) | | | |
| Buse usée : débit plus élevé ; comparer à une buse neuve de même type et taille | `pulve-reglage-volume` › controle-diffuseurs ; `pulve-entretien` › pourquoi | B20-1 | 26–38 | | |
| Durée de vie des buses : 2 à 5 ans en moyenne | `pulve-entretien` › pourquoi | B20-1 | 26–38 | | |
| Filtre d'aspiration à chaque remplissage ; refoulement après chaque traitement | `pulve-entretien` › plan-entretien, quiz | F-FIL | | | |
| Filtre de cabine : 1 fois par an ou toutes les 500 h | `pulve-entretien` › plan-entretien | A-WEB | | | |
| Filtres A2P3 : au moins 2 fois par an | `pulve-entretien` › plan-entretien | A-WEB | | | |
| Contrôle de tous les débits et traque des fuites en remise en route | `pulve-entretien` › plan-entretien | A-WEB | | | |
| Profondeur de lame 3 à 6 cm pour le désherbage, à adapter (couvert dense, sol compact) | `sol-outil-interceps` › reglage-interceps, `q-profondeur` | F-BOI, F-BRA | | | |
| Palpeur 5 cm en avant de la lame, sur toute sa longueur, le plus bas possible | `sol-outil-interceps` › reglage-interceps | F-BOI, F-BRA | | | |
| Besoin hydraulique 6 à 15 L/min par moteur, environ 90 bar | `sol-outil-interceps` › hydraulique | F-BOI, F-BRA | | | |
| Charrue sans palpeur : lame à environ 45° vers l'arrière | `sol-outil-interceps` › types-outils | F-DER | | | |
| Outils d'ouverture : griffe 4 et 8 cm ; couteau ≈ 1 cm ; cœur 12–20 cm ; rasette 20–35 cm ; disques quelques mm, 1 à 2 passages par an | `sol-outil-interceps` › types-outils (tableau) | F-OUV | | | |

## 14. Consignes retirées, à reproposer au valideur

Consignes présentes dans la rédaction initiale mais absentes du corpus : elles
sont retirées (pas reformulées) et attendent la décision du valideur.

| Module | Consigne retirée | Raison | Décision du valideur |
|---|---|---|---|
| pulve-reglage-volume | « Refaire la mesure dans l'autre sens et retenir la moyenne des deux temps » (aller-retour de la mesure de vitesse) | Absente du corpus : F-VHA mesure « départ lancé » sur 50 m, sans aller-retour | |
| pulve-reglage-volume | « Baliser une distance connue (par exemple 100 m) » | Remplacée par 50 m entre deux jalons (F-VHA) | |
| pulve-reglage-volume | Introduction de la mesure de vitesse : « cuve à moitié pleine, dans le rapport de boîte et au régime utilisés pour traiter » | Absente du corpus | |
| pulve-reglage-volume | « Recueillir chaque buse pendant une minute dans un récipient gradué » ; « comparer aux données du fabricant, tolérance indiquée » | Remplacées par la mesure au niveau de la cuve et l'écart de 10 % à la moyenne (F-VHA) | |
| pulve-reglage-volume | « Le débit se mesure buse par buse, à la pression de travail, avec de l'eau claire » | Absente du corpus sous cette forme | |
| pulve-reglage-volume | Explication de `q-pression` : débit « comme une puissance de la pression (racine carrée) » | Fondée sur l'exposant b, non vérifié dans le corpus ; remplacée par A-LVC / B20-1 | |
| pulve-entretien | « Contrôler visuellement les fuites, raccords et flexibles » — **chaque jour** | Périodicité absente du corpus ; la traque des fuites est gardée en remise en route (A-WEB) | |
| pulve-entretien | « Graisser les points prévus par la notice » — **chaque semaine** | Périodicité absente du corpus ; devenue « à la fréquence prévue par la notice » | |
| pulve-entretien | « Faire réviser pompe, régulation et rampe » — **chaque année** | Absente du corpus | |
| pulve-entretien | « Mesurer le débit de chaque buse et remplacer les buses hors tolérance » | Remplacée par le contrôle de tous les débits (A-WEB) et le contrôle diffuseur par diffuseur (F-VHA) | |
| pulve-entretien | « Sécurité : moins de fuites et de contacts avec la bouillie » ; « Durée de vie : moins de corrosion et de pannes » | Absentes du corpus ; remplacées par l'usure et la durée de vie des buses (B20-1) | |
| sol-outil-interceps | « Contrôler le travail et l'absence de blessure des ceps **après 50 m**, puis corriger » | Absente du corpus | |
| sol-outil-interceps | « Mesurer la vitesse réelle et vérifier que l'outil suit le rang sans à-coups » | Absente du corpus (aucune vitesse d'interceps, synthèse §7.3) ; le calculateur de vitesse reste disponible | |
| sol-outil-interceps | « Mettre l'outil d'aplomb et régler la hauteur de travail sur sol plat » ; « Régler la profondeur selon l'état du sol et l'objectif » ; « … puis vérifier l'effacement sur quelques ceps » | Remplacées par les réglages communs F-BOI / F-BRA (porte-outil horizontal, 3 à 6 cm, palpeur) | |
| sol-outil-interceps | Familles : « lames : travail en profondeur » ; « disques : buttage ou débuttage » ; « outils rotatifs ou à doigts : sans palpeur » ; « fils ou brosses : sans travail du sol » | Caractérisations absentes du corpus ; remplacées par les familles de D-SOL | |
| sol-outil-interceps | Alerte « palpeur trop peu sensible : blesse les ceps ; trop sensible : laisse de l'herbe » et question associée | Absente du corpus ; remplacée par « sensibilité selon l'âge de la vigne » (F-BOI, F-BRA) | |
| sol-outil-interceps | **À rédiger par le valideur** : plan d'entretien (nettoyage à chaque utilisation, usure et hydraulique chaque jour, graissage chaque semaine, remisage) | Conservé tel quel, sans source (D-B8-4) : le corpus ne contient aucune consigne d'entretien des outils de sol ; périodicités à valider | |

## 15. Édition du contenu

Édition en cours : **23/09/2026** (`EDITION_CONTENU = '2026-09-23'` dans
`moteur-oad.js`). À changer à chaque modification de `contenu/`, ici et dans
le moteur ; l'écran l'affiche en pied de page, pour savoir quelle version un
apprenant a sous les yeux et retirer une consigne erronée.

## 16. Journal d'arbitrages — lot B

### B0 — préparation (23/09/2026)

- **D-B0-1** : tout le lot se fait sur la branche `lot-b`. Fusion dans `main`
  seulement après la levée de G1 (dépôt public).
- **D-B0-2** : la synthèse du corpus est copiée dans `docs/corpus/`, ignoré
  par git (`.gitignore`) : elle reproduit des valeurs de documents dont les
  droits sont en question (G1). Testé : aucun fichier suivi sous ce dossier.
- **D-B0-5** : CI GitHub (`.github/workflows/tests.yml`) : `node
  tests/parite.test.js` sous Node 18 à chaque push et pull request. Aucune
  dépendance npm.

Ajout hors prompt : `.gitattributes` interdit la conversion de fin de ligne
sur `support.js` et `vendor/`. Constat : sous Windows avec
`core.autocrlf=true`, ces fichiers étaient extraits en CRLF, et les trois
tests d'empreinte échouaient (64 ok, 3 FAIL au lieu de 67 ok). Les octets du
dépôt n'ont jamais changé ; seule la copie de travail différait.

### B1 — défauts recalés, plage de pression par buse (23/09/2026)

- **D-B1-1** : `volHa.Q` = 9,6 L/min, déduit de 150 L/ha à 5 km/h sur 7,7 m
  (9,625 exact), pour un résultat rond à la saisie.
- **D-B1-2** : la plage de pression devient deux entrées, `pMin` = 3 et
  `pMax` = 4,5 bar (buse TXA80 0050, F-PRE). `PLAGE_PRESSION_ALERTE_BAR`
  supprimée. Alerte « plage invalide » si `pMin ≥ pMax` ou non positive ;
  sinon alerte si P2 sort de la plage. Le moteur renvoie les bornes brutes
  (alerte `{ gabarit, operandes }`), la vue les met en forme en fr-FR.
- **D-B1-3** : `n` reste ASSUMÉ. **D-B1-4** : `debitChantier` reste ASSUMÉ.
- **D-B1-5** : `ORIGINE_ASSUME` = « Valeur d'exemple, sans source : à
  confirmer par le référent » ; aucune référence interne visible (testé).
- Lecture retenue : P1 = 3 bar **et** V1 = 150 L/ha portent l'origine
  « Exemple dans la plage de travail de la buse de référence » (le couple est
  l'exemple).
- Champ `portee` sur `pressionPourVolume`, affiché sous la description
  (remplacé par `technologies` en B4).

**Refusé.** Une plage de pression fixe (elle dépend de la buse) ; un nombre de
buses « sourcé » (absent du corpus). **Point de révision.** `n` et
`debitChantier` dès que le référent fournit des valeurs. Les formules
(section 2 du moteur) sont inchangées : test §1 `volumeHectare(12, 6, 2,5) =
480` toujours vert.

### B2 — nouveaux calculateurs scalaires (23/09/2026)

- **D-B2-1** : `largeurTraitee`, une seule formule L = n × e ; le chenillard
  passe par n (1, 2 ou 3 écartements), dit dans la description.
- **D-B2-2** : `debitCuve`, durée 5 min (F-VHA) ; volume 48 L déduit
  (9,6 L/min × 5 min), cohérent avec `volHa` (testé : 149,61 L/ha).
- **D-B2-3** : `hauteursBuses` suppose le même débit à chaque hauteur de buse
  (dit dans la description) ; h1, h2 arrondis à l'entier, au moins 1.
- **D-B2-4** : formule `volumeApresChangementVitesse` sans calculateur, pour
  le test du cas pratique (B5).

La page Calculateurs liste 8 calculateurs (testé). Le compte de routes du
test §6 est calculé à partir des modules et des calculateurs, pas écrit en
dur : pas de modification.

### B3 — écart entre diffuseurs (23/09/2026)

- **D-B3-1** : nouveau type d'entrée `liste` ; saisie « 1,40 ; 1,38 ; … »,
  convertie par la vue (`versListe`, seul point de conversion des listes) ;
  le moteur reçoit un tableau de nombres, NaN compris.
- **D-B3-2** : `ECART_DIFFUSEUR_MAX = 0.10` (F-VHA) ; signalé si |écart| >
  seuil + 1e-9 : 10 % tout juste n'est pas signalé (testé sur [1,1 ; 0,9]).
- **D-B3-3** : au moins 2 valeurs lisibles, sinon résultat `null` et alerte ;
  une valeur illisible → « Valeur n° k illisible », calcul sur les autres.
- **D-B3-4** : détail par diffuseur en tableau `React.createElement`
  (`tableauEcarts`), ligne hors seuil en classe `hors-seuil` **et** texte
  « à contrôler ».
- **D-B3-5** : liste par défaut fabriquée pour l'exercice.

Ajouts : un débit de 0 est lisible (diffuseur bouché, justement à signaler) ;
seuls les négatifs et les illisibles sont écartés. Garde de schéma du
registre `erreursRegistre` (entrée liste ⇒ défaut tableau), testée. Le test
§1 « aucune alerte avec les défauts » admet l'alerte volontaire de
`ecartDiffuseurs` (commentée).

### B4 — schéma : technologie, sources par élément, tableau (23/09/2026)

- **D-B4-1** : `TECHNOLOGIES` = toutes, pneumatique, jets portés, jets
  projetés, confiné. `technologie` sur une section (badge), `technologies` sur
  un calculateur (« S'applique à : … ») ; `pressionPourVolume` = jets portés,
  jets projetés ; `portee` de B1 supprimé.
- **D-B4-2** : `sources: [{ code, reference, date, page? }]`, code unique au
  format `F-VHA` ; `source: '<code>'` sur bloc, ligne de liste, étape, tâche,
  question, option, section ; référence inconnue = erreur.
- **D-B4-3** : un module `valide` n'a aucun élément chiffré sans source ; en
  brouillon, le nombre est affiché dans le bandeau.
- **D-B4-4** : bloc `tableau`, construit par `createElement`.
- **D-B4-5** : `lectureGraphique` sur un bloc ou une ligne de liste.
- **D-B4-6** : périodicité `semestrielle` (« Au moins deux fois par an ») ;
  `detail` de tâche.
- **D-B4-7** : source affichée sous l'élément ; pas de filtre par
  technologie.

Choix de mise en œuvre : une ligne de liste peut être un objet `{ texte,
source?, lectureGraphique? }` (nécessaire pour D-B4-5) ; l'introduction d'une
section compte comme élément de la section (sa source est celle de la
section) — plus strict que la liste du prompt, pour qu'aucun chiffre visible
n'échappe à D-B4-3. Garde du registre : `technologies` de chaque
calculateur dans le vocabulaire (testé).

### B5 — section « exercice » corrigée par le moteur (23/09/2026)

- **D-B5-1** : section `exercice` : `enonce`, `calculateur`, `valeurs`,
  `resultat`, `source?` ; l'attendu est calculé par le moteur
  (`attenduExercice`).
- **D-B5-2** : juste si réponse et attendu sont égaux une fois arrondis au
  nombre de décimales du résultat (`corrigerExercice`, ne lève jamais).
- **D-B5-3** : un exercice est enregistré comme un quiz d'une question
  (taux 1 ou 0), via `enregistrerQuiz`.
- **D-B5-4** : après correction, formule ouverte avec les valeurs (étapes
  formatées par la même méthode que les calculateurs, `etapesFormatees`).
- **D-B5-5** : les cas pratiques restent à choix ; `CAS_CHIFFRES` (tests)
  recalcule chaque nombre (129 et le distracteur 175 de `cas-vitesse`).

Choix de mise en œuvre : `verifierExo` délègue à `validerQuiz`, qui corrige
quiz et exercices ; ainsi l'horloge reste lue une seule fois, dans
`validerQuiz` (contrainte du `CLAUDE.md`, test statique inchangé). Unicité
des ids de quiz, cas et exercices vérifiée aussi par `erreursContenu`
(bandeau « Contenu à corriger »), plus seulement par un test.

### B6 — états « consulté » / « maîtrisé », édition du contenu (23/09/2026)

- **D-B6-1** : `ETATS_MODULE` = non-commence, en-cours, consulte, maitrise ;
  `termine` disparaît. État calculé, aucune migration (testé sur une
  progression v1 écrite en dur).
- **D-B6-2** : `SEUIL_MAITRISE = 1`, ASSUMÉ (formation, pas certification ;
  à trancher par le référent pédagogique si un usage certifiant apparaît).
- **D-B6-3** : sans quiz ni exercice, plafond « consulté » ; l'écran dit
  « Pas de quiz dans ce module ».
- **D-B6-4** : `EDITION_CONTENU` (section 7 du moteur), affiché en pied de
  page « Édition du contenu : jj/mm/aaaa » ; même date en section 15 du README (testé).
  Règle ajoutée au `CLAUDE.md` : toute modification de `contenu/` change
  `EDITION_CONTENU`.

Ajout : le résumé de la page Progression distingue modules maîtrisés et
consultés (il comptait les modules « terminés »).

### B7 — contenu : modules pulvérisation (23/09/2026, porte G1)

- **D-B7-1** : sources `pulve-reglage-volume` F-VHA, A-LVC, B20-1, F-PRE ;
  `pulve-entretien` F-VHA, F-FIL, A-WEB, B20-1 (références et dates du §0 de
  la synthèse).
- **D-B7-2** : consignes absentes du corpus retirées, listées en section 14.
- **D-B7-3** : graissage « aux points et à la fréquence prévus par la notice
  du constructeur », sans périodicité.
- **D-B7-4** : alerte du contrôle technique périodique, sans périodicité ni
  mention « plus de 5 ans ».
- **D-B7-5** : aucune consigne de buse anti-dérive (G4).

Contenu : largeur traitée et causes d'écart (F-VHA), mesure de vitesse sur
50 m et table temps → vitesse, débit au niveau de la cuve, contrôle diffuseur
par diffuseur ; calculateurs largeur, débit à la cuve, écart ; exercices
`exo-vitesse` (5,1 km/h) et `exo-volume` (150 L/ha). Les deux modules
restent en `brouillon` ; aucun élément chiffré sans source (testé).

Écarts au prompt, à trancher par le valideur :
- **Nettoyage des buses** (B20-1) : en ligne de fiche et non en tâche du plan
  d'entretien, faute de périodicité dans le corpus (règle du `CLAUDE.md` :
  aucune périodicité de mémoire).
- **Table F-VHA** : la valeur 4,8 km/h pour 37 s est reprise telle quelle,
  alors que le calcul donne 4,86 (4,9) ; signalée en section 13.
- **`cas-vitesse`** : texte inchangé, mais `source: 'F-VHA'` ajouté à la
  situation et aux options (la règle « chiffre ⇒ source » l'exige).
- **`q-pression`** : explication fondée sur B20-1 (gouttes fines et dérive,
  plage de pression, « le bon calibre à la bonne pression »), qui couvre aussi
  le principe A-LVC ; un seul code par élément.
- Conservés sans source car sans chiffre et cohérents avec le corpus :
  rinçage de la cuve, vérification du manomètre, échéance du contrôle
  technique, hivernage selon la notice, étape « équipements de protection » de
  la mesure de débit, procédure de rinçage de fin de traitement (sécurité :
  relecture du valideur requise).
- `dureeMin` de `pulve-reglage-volume` : 30 → 50 min (9 → 16 sections).

### B8 — contenu : module interceps (23/09/2026, porte G1)

- **D-B8-1** : sources F-BOI, F-BRA, F-DER, F-OUV, D-SOL.
- **D-B8-2** : évaluation colorée D-SOL non reprise (pas de légende).
- **D-B8-3** : réglages propres à chaque marque non repris ; l'introduction
  de la procédure renvoie à la notice.
- **D-B8-4** : entretien sans consigne dans le corpus : tâches conservées sans
  source ni chiffre, signalées en section 14 ; l'écran les présente comme
  « plan indicatif, en attente de validation ».

Contenu : charrue sans palpeur (F-DER), tableau des 6 outils d'ouverture
(F-OUV), réglages communs (profondeur 3 à 6 cm, palpeur à 5 cm, outil
d'ouverture, fils au sol), besoin hydraulique (6 à 15 L/min, ≈ 90 bar),
questions `q-profondeur` et `q-ouverture`. « Après 50 m » retiré (testé).

Choix : les réglages communs, cités par F-BOI **et** F-BRA, portent le code
F-BOI (un code par élément) ; la section 13 nomme les deux. `q-palpeur`
réécrite sur l'âge de la vigne. `dureeMin` 25 → 30 min (6 → 7 sections).
