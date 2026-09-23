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
17. Journal d'arbitrages — C2, unification des calculateurs (23/09/2026)

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
docs/                 architecture, guide de contenu, décisions, provenance du runtime, essai service worker
docs/corpus/          synthèse du corpus — locale, ignorée par git (D-B0-2)
.github/workflows/    CI : tests à chaque push
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
Calculateurs (les calculateurs hors module, groupés en quatre familles) ; page Progression (tableau par
module : sections consultées, quiz, quiz réussis, état ; effacement).

**Catalogue.** Pulvérisation : régler le volume par hectare ; entretenir le
pulvérisateur ; comprendre la filtration ; remettre le pulvérisateur en
route ; contrôler la couverture ; comprendre les réglages selon le stade.
Travail du sol : régler et entretenir un
outil interceps. Effeuillage : caler une effeuilleuse. Plus le glossaire,
atteint par la navigation. Tous en `brouillon`.

**Progression.** L'état d'un module est calculé, jamais stocké : *Non
commencé*, *En cours*, *Consulté* (toutes les sections ouvertes), *Maîtrisé*
(en plus, tous les quiz et exercices réussis à 100 %, tentatives illimitées).
Un module sans quiz ni exercice plafonne à *Consulté* (« Pas de quiz dans ce
module »). Clé et format de stockage inchangés : une progression enregistrée
avant B6 se relit sans migration. Pied de page : date d'édition du contenu. Navigation par hash : liens profonds et bouton retour.

**Restitution.** Calculateurs : pastilles des autres calculs de la même
famille, résultats en tête, champs, puis « Détail du calcul » (formule
symbolique, formule avec les valeurs, résultat), et sous chaque champ la
valeur par défaut et son origine. Une entrée mesurable (débit, vitesse,
largeur) propose « Calculer à partir d'une mesure » : les champs de la mesure
s'ouvrent sous elle et ses étapes précèdent celles du calcul. Module non validé : bandeau « Contenu en
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
| Vitesse à tenir pour un volume visé (`vitesseVisee`) | v = 600 × Q / (V × L) | 150 L/ha, 9,6 L/min, 7,7 m → 5 km/h (4,987) |
| Volume après un changement de vitesse (`changementVitesse`) | V2 = V1 × v1 / v2 | 150 L/ha, 5 → 6 km/h → 125 L/ha |
| Écart entre diffuseurs (`ecartDiffuseurs`) | m = Σ q / n ; e = (q − m) / m | 1,40 ; 1,38 ; 1,52 ; 1,41 ; 1,25 ; 1,39 ; 1,40 L/min → moyenne 1,39 L/min ; diffuseur n° 5 à −10,26 %, à contrôler |

Onze calculateurs, en quatre familles (C2) : *Volume, débit et vitesse*
(`volHa`, `debitBuse`, `vitesseVisee` : la même relation résolue pour V, Q
ou v) ; *Changer le volume : un levier à la fois* (`pressionPourVolume`,
`hauteursBuses`, `changementVitesse`) ; *Mesures au champ*
(`vitesseMesuree`, `largeurTraitee`, `debitCuve`, `ecartDiffuseurs`) ;
*Travail du sol* (`debitChantier`). Dans les deux premières familles, les
saisies sont communes à tous les calculs de la famille. `ecartDiffuseurs` reçoit une **liste** (valeurs séparées
par un point-virgule, la virgule restant décimale) et affiche le détail par
diffuseur dans un tableau ; un diffuseur est signalé si son écart dépasse
strictement 10 % (`ECART_DIFFUSEUR_MAX`, F-VHA). Un débit nul désigne un
diffuseur bouché : il n'entre pas dans la moyenne, qui porte sur les seuls
débits non nuls (au moins deux), et il est toujours signalé, même quand la
moyenne n'est pas calculable (D-C1-1, D-C1-2).

`volumeApresChangementVitesse(V1, v1, v2) = V1 × v1 / v2`, jusqu'ici sans
écran (tests du cas pratique), a désormais son calculateur
(`changementVitesse`).

**Mesures.** Une entrée déclarée `mesure: '<calculateur>'` peut être
calculée à partir de ce calculateur de mesure : `Q` ← `debitCuve`, `v` ←
`vitesseMesuree`, `L` ← `largeurTraitee`, dans `volHa`, `debitBuse`,
`vitesseVisee` et `changementVitesse` (`v1`). Les saisies de la mesure sont
celles de sa propre page : mesurer une fois sert partout.
`OAD.calculer(id, valeurs, mesures)` enchaîne les calculs ; les gardes
`erreursRegistre` et `erreursFamilles` vérifient qu'une mesure fournit la
grandeur de l'entrée dans son unité et que, dans une famille partagée, une
même clé d'entrée a partout la même unité.

Les facteurs 600, 3,6 et 10 sont des conversions d'unités, démontrées en
commentaire dans `moteur-oad.js`. Alerte de pression : le résultat est
comparé à la plage de la buse **saisie** (`pMin`, `pMax`) ; hors plage,
l'écran conseille de changer de calibre ou de vitesse plutôt que de forcer
la pression (D-B1-2). La pression actuelle saisie est comparée à la même
plage, bornes incluses : hors plage, une seconde alerte demande de vérifier
la saisie ou la buse montée (D-C1-3). Le calculateur de pression indique
sa portée : buses hydrauliques, pas les diffuseurs pneumatiques.

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

`node tests/parite.test.js` — 150 tests au 23/09/2026 (fin du lot B) ; CI
GitHub à chaque push (`.github/workflows/tests.yml`) :

| Section | Objet |
|---|---|
| §1 Formules | formules, gardes de saisie, registre avec défauts |
| §2 Contenu et schéma | conformité des modules, `validerModule` sur un module fabriqué, unicité des sections évaluées |
| §3 A1 — ajouts | routes, libellés, registre, ordre du catalogue, dédoublonnage navigateur, quiz, progression |
| §4 A2 | sorties brutes, `substituer`, date injectée, `origineDefaut`, moteur sans horloge ni formatage |
| §5 A3 — statiques | pas de `<form>`/JSX/réseau, pas de directive dans `table`/`select`, ordre `<helmet>`, calcul délégué, horloge unique, SHA de `support.js` et `vendor/` |
| §6 A3 — rendu à blanc | chaque route sans exception ni clé manquante ; saisie Q = 12 → 187 L/ha ; quiz validé → score ; progression écrite et relue ; stockage refusé |
| §7 B0 | `.gitignore`, CI, corpus non suivi |
| §8 B1 | défauts recalés, plage de pression de la buse |
| §9 B2 | largeur traitée, débit à la cuve, hauteurs de buses |
| §10 B3 | écart entre diffuseurs (liste, seuil strict, tableau) |
| §11 B4 | sources à code, technologies, tableau, lecture graphique, semestrielle, chiffres sans source |
| §12 B5 | exercices corrigés par le moteur, `CAS_CHIFFRES` |
| §13 B6 | états consulté / maîtrisé, édition du contenu, progression v1 relue |
| §14–§19 B7–B12 | contenu : conformité, aucun chiffre sans source, mots interdits, rendu à blanc |

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
| **G2** | Validité en 2026 des valeurs 2014–2016, et désignation des valideurs | Référent pulvérisation / machinisme du Service vigne | Passage d'un module en `valide` ; B12 en entier (module `pulve-reglages-stade`) | |
| **G3** | Hébergement public et mise en ligne | DSI et direction de la communication | Tout déploiement (B13 est un essai, pas un déploiement) | |
| **G4** | Consigne de buse anti-dérive en jets portés (TVI) | Responsable pulvérisation du Comité Champagne | Aucun prompt du lot : sujet exclu | |

**Essai de cache hors ligne (B13), 23/09/2026 : compatible.** Dans Chrome de
bureau, servi en http, l'outil fonctionne hors ligne après une première
visite, avec un service worker et sans modifier `support.js` (rechargement,
calculateur, quiz, progression, lien profond observés) ; en `file://`, rien
ne change. Non observé sur Safari ni sur la tablette cible. Rapport :
`docs/ESSAI-SERVICE-WORKER.md` ; code de l'essai sur la branche `essai-sw`,
jamais fusionnée. Tout déploiement reste soumis à G3.

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
| Largeur traitée 7 × 1,10 m = 7,7 m | `volHa.L`, `debitBuse.L`, `vitesseVisee.L` | F-VHA | | | |
| Vitesse 5 km/h | `volHa.v`, `debitBuse.v`, `changementVitesse.v1` | F-CGE, F-CGA, F-JET, F-PRE, F-IDE, F-GRE | | | |
| 150 L/ha en pleine végétation | `debitBuse.V`, `vitesseVisee.V`, `changementVitesse.V1`, `pressionPourVolume.V1` | F-CGE, F-CGA, F-JET | | | |
| 150–180 L/ha en pleine végétation (jets portés) | `pressionPourVolume.V2` (180) | F-PRE, F-IDE | | | |
| 50 m en 30 s → 6 km/h | `vitesseMesuree.d`, `vitesseMesuree.t`, `changementVitesse.v2` | F-VHA | | | |
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
| Tableau des filtres : couleurs anciennes / ISO 19732, mesh 16 / 32 / 50 / 80 / 100, mailles 1,1 / 0,6 / 0,3 / 0,18 / 0,14 mm, usages | `pulve-filtration` › principe, quiz | F-FIL | | | |
| Filtres tube ou coupole de 80 mesh pour pièces en laiton oxydées | `pulve-filtration` › ou-filtrer | F-FIL | | | |
| Ordre d'incorporation : correcteurs de dureté, poudres, liquides SL SC EW EC, adjuvants | `pulve-filtration` › ordre-incorporation | F-FIL | | | |
| Cloche à air à environ ⅓ de la pression de travail | `pulve-remise-en-route` › apres-remontage | A-WEB | | | |
| Filtre de cabine 1 fois par an ou 500 h ; filtres A2P3 au moins 2 fois par an ; gants nitrile ou fluoro-élastomère EN 374 | `pulve-remise-en-route` › eau-claire | A-WEB | | | |
| Réorienter 2 à 4 fois au printemps ; plaque, piquet rouillé, carton, ardoise ; brins de pied | `pulve-couverture` › controler | A-LVC | | | |
| Rosée : jet porté 150 L/ha, dépôt équivalent ; jet projeté 400 L/ha, −40 % et −55 % (**lecture graphique**) | `pulve-couverture` › rosee | D-IDR | | | |
| Passages au chenillard (pleine végétation, vigueur moyenne, 5,1 km/h) : tous les 2 rangs 230 L/ha, −30 %, équivalent ; 3 rangs 150 L/ha, −50 %, −60 % ; 4 rangs 117 L/ha, −65 %, −70 % | `pulve-couverture` › passages, cas-passage | D-IDR | | | |
| CG Expert, 7 rangs : cellule Speedair 3 300 tr/min en début, 3 600 en pleine végétation — valeur 2014–2016, validité 2026 à confirmer (G2) | `pulve-reglages-stade` › q-cellule | F-CGE | | | |
| Début de végétation : couper le diffuseur du haut — validité 2026 à confirmer (G2) | `pulve-reglages-stade` › q-diffuseur-haut | F-CGA, F-JET | | | |
| Jet 5000/6000, début de végétation : angle horizontal de 10° par rapport au rang ; mains qui ne se font pas face — valeur 2014–2016, validité 2026 à confirmer (G2) | `pulve-reglages-stade` › cas-flux-opposes | F-JET, A-LVC | | | |
| Jets portés : 2 hauteurs de buses en début de végétation, 3 en pleine végétation — valeur 2014–2016, validité 2026 à confirmer (G2) | `pulve-reglages-stade` › q-hauteurs-stade | F-PRE, F-IDE | | | |
| Fin de saison, grappes fermées, rognage > 1,30 m : remonter la rampe de 10 cm — valeur 2014–2016, validité 2026 à confirmer (G2) | `pulve-reglages-stade` › q-remonter-rampe | F-IDE (F-PRE sans la condition de hauteur) | | | |
| Début de végétation, jets portés : décaler les descentes (avant / arrière) — validité 2026 à confirmer (G2) | `pulve-reglages-stade` › cas-decaler-descentes | F-PRE, F-IDE | | | |

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
| glossaire | **À rédiger par le valideur** : cellule, régime moteur, prise de force, « main », « tronçon » | Termes confus relevés par l'enquête de 2013 (D-ENQ, 690 questionnaires) mais **non définis** dans la synthèse : l'outil ne les définit pas (D-B10-3) | |
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

### B9 — contenu : filtration, remise en route, couverture (23/09/2026, porte G1)

- **D-B9-1** : `pulve-filtration` (F-FIL) : principe, tableau des 5 filtres,
  où filtrer, ordre d'incorporation, quiz de 3 questions.
- **D-B9-2** : `pulve-remise-en-route` (A-WEB) : deux procédures (après
  remontage ; cuve d'eau claire, pulvérisation enclenchée), cloche à air,
  filtre de cabine, filtres A2P3, EPI. Normes EN 907 / EN 1553 du lave-mains
  non reprises (état à vérifier, synthèse §7.2) — testé.
- **D-B9-3** : `pulve-couverture` (A-LVC, D-IDR) : contrôle, rosée (valeurs du
  jet projeté marquées « lecture graphique »), tableau des passages au
  chenillard avec ses conditions d'essai, cas pratique « toutes les 3
  routes ». Technologie `toutes`, technologie nommée dans chaque bloc.
- **D-B9-4** : aucune consigne de buse anti-dérive, aucune valeur de poudrage
  (testé : ni « TVI » ni « soufre »).

Déclarés dans `contenu/index.js` et `<helmet>` après `pulve-entretien`.

Choix et points à vérifier :
- Date de D-IDR : la synthèse n'en donne pas ; « 2014 » est déduit du nom du
  fichier (« Pulvé Web 2014 »), essais de 2013. À confirmer au document.
- Exemple « sulfate d'ammonium » (correcteur de dureté) non repris : l'outil
  ne cite pas de produit.
- `pulve-remise-en-route` n'a ni quiz ni exercice : il plafonne à
  « Consulté » (D-B6-3). Consignes EPI : relecture du valideur requise.
- `cas-passage` : nombres (−50 %, −60 %) contrôlés par `CAS_CHIFFRES` contre
  le tableau D-IDR du même module (pas de formule).

### B10 — glossaire (23/09/2026, porte G1)

- **D-B10-1** : module `glossaire` du domaine `transversal`, section de type
  `definitions` (`entrees: [{ id, terme, definition, source }]`, source
  obligatoire, termes uniques). Toujours un seul accès global au contenu.
- **D-B10-2** : 8 termes définis dans la synthèse, reformulés avec leur code :
  largeur traitée (F-VHA), mesh (F-FIL), jets projetés (A-LVC), goutte en
  pneumatique (D-ENQ), VMD, NMD, SMD (B20-1), palpeur (F-BOI).
- **D-B10-3** : cellule, régime moteur, prise de force, « main », « tronçon »
  non définis (section 14, à rédiger par le valideur) — testé.
- **D-B10-4** : lien « Glossaire » dans la navigation principale
  (`#/module/glossaire`) ; domaine `transversal` exclu du catalogue ;
  `estModuleReference(m)` exclut le glossaire du tableau et du résumé de
  progression.

Point à vérifier : la définition de « jets projetés » (sans assistance
d'air, pendillards) s'appuie sur l'opposition « sans air / avec air » de la
synthèse (§7.1) ; code A-LVC retenu. Date de D-ENQ : « 2013 » (enquête), la
synthèse ne donne pas la date du diaporama.

### B11 — domaine effeuillage : module de calage (23/09/2026, porte G1)

- **D-B11-1** : contenu admis : tableau qualitatif pneumatique / rouleaux
  (principe, stade, défaut type), stade, procédure de calage (réglage → essai
  sur petite longueur → observation → correction), cible et compromis.
- **D-B11-2** : exclus : pressions, vitesses, régimes, hauteurs, temps de
  chantier (retours d'expérience 2016, divergents entre sources) et
  efficacités chiffrées de l'enquête 2015 — testé (ni « bar », « tr/min »,
  « km/h », « h/ha »).
- **D-B11-3** : technologie `toutes` (le vocabulaire `TECHNOLOGIES` concerne
  la pulvérisation).
- **D-B11-4** : sources F-EPN, F-ERO, D-EF17.

Domaine `effeuillage` ajouté au moteur ; module déclaré après les modules de
travail du sol, avant le glossaire ; catalogue : groupe « Effeuillage ».
Le tableau qualitatif, qui combine F-EPN, F-ERO et D-EF17 dans la synthèse,
porte le code D-EF17 (diaporama des deux familles de machines). Dates de F-EPN
et F-ERO : « sans date (retours d'expérience 2016) », comme la synthèse.

### B12 — réglages selon le stade, en exercices de raisonnement (23/09/2026, portes G1 et G2)

> **Ne pas fusionner dans `main` avant la réponse du référent sur la validité
> 2026 de ces valeurs (G2).**

- **D-B12-1** : chaque question ou cas est rattaché à une technologie
  (`pneumatique` : CG Expert, CG Airmist, Jet 5000/6000 ; `jets-portes` :
  Precijet, Idéal) et cite la fiche, l'organisme et l'année dans l'énoncé.
- **D-B12-2** : 6 items en 4 sections : vitesse de cellule (CG Expert),
  diffuseur du haut coupé, mains qui ne se font pas face (Jet 5000/6000),
  hauteurs de buses, rampe remontée en fin de saison (Idéal), descentes
  décalées (Precijet, Idéal). Chaque retour explique un principe
  (couverture, pénétration, flux opposés) sans prescrire.
- **D-B12-3** : exclus : réponse qui serait un chiffre de réglage (testé par
  expression régulière), fiche Grégoire (source constructeur), buses
  anti-dérive (G4).
- **D-B12-4** : mention G2 en tête du module (commentaire du fichier) et ici ;
  porte G2 de la section 12 mise à jour.

Point à trancher par le valideur : les explications « Principe : … » sont
des raisonnements pédagogiques construits à partir des consignes des
fiches ; la synthèse cite les consignes, pas toujours leur justification
(sauf l'opposition des flux, A-LVC). À relire en priorité.

### B13 — essai de cache hors ligne, branche jetable (23/09/2026)

- **D-B13-1** : branche `essai-sw` depuis `lot-b`, jamais fusionnée ; seul
  `docs/ESSAI-SERVICE-WORKER.md` est rapporté dans `lot-b`.
- **D-B13-2** : cache d'abord, liste explicite des fichiers ; nom du cache
  avec l'édition du contenu ; enregistrement seulement en http(s).
- **D-B13-3** : aucune requête hors de l'origine.

Résultat : **compatible** dans Chrome 154 (bureau, sans interface, piloté par
le protocole DevTools) : (a) à (e) et le cas `file://` observés, sans erreur
de console imputable à l'essai. Le test statique « aucun appel réseau » reste
vert avec l'enregistrement. Limites : Safari et tablette non essayés ;
l'édition est recopiée en dur dans `sw.js`, ce qui ferait un second endroit à
tenir à jour en cas de déploiement (G3).

Ajouts hors prompt, en fin de lot : vérification du rendu réel de `lot-b`
dans Chrome en `file://` (catalogue, calculateurs, exercice, filtration,
glossaire, progression) et dans un cadre de 400 px (tableau d'écart lisible
sans défilement de la page ; tableau de filtration à 5 colonnes défilant dans
son conteneur). Vérificateur du skill oad-maquette : OK.

### C1 — diffuseur bouché, pression actuelle hors plage (23/09/2026)

- **D-C1-1** : un débit nul = diffuseur bouché ; exclu de la moyenne,
  toujours signalé (`bouche: true`, `ecart: null`, `horsSeuil: true`).
  Avant : `[1,4 ×7 ; 0]` donnait une moyenne de 1,225 L/min et signalait les
  8 diffuseurs (+14,29 % pour les 7 sains). Écartés : médiane comme référence
  (s'écarte du texte F-VHA « écart à la moyenne ») ; exclusion itérative des
  valeurs hors seuil (idem, et résultat dépendant de l'ordre d'exclusion).
  À réviser si le référent pulvérisation en décide autrement.
- **D-C1-2** : la moyenne exige au moins 2 débits **non nuls** lisibles ;
  sinon résultat `null` et alerte « Calcul impossible », mais les débits nuls
  restent signalés et comptés dans « Diffuseurs à contrôler ».
- **D-C1-3** : `pressionPourVolume` signale une pression actuelle `P1` hors
  de la plage `pMin`–`pMax` (bornes incluses), si la plage est valide ;
  l'alerte vient **après** l'alerte sur P2, pour ne pas décaler l'indice des
  alertes testées.

Sans débit nul et avec P1 dans la plage, résultats et alertes inchangés.
Le libellé « Calcul impossible : saisissez au moins deux débits lisibles »
est conservé ; il reste exact sauf quand les débits lisibles sont surtout
nuls (ex. `[0 ; 0 ; 1,4]`), cas où « non nuls » serait plus juste. Point
laissé au rédacteur. *Tranché en C2 : « deux débits non nuls ».*

## 17. Journal d'arbitrages — C2, unification des calculateurs (23/09/2026)

Aucune fonctionnalité retirée : les neuf calculateurs gardent leur id, leurs
entrées, leurs défauts, leurs sorties et leurs alertes (test de parité
`calculer` = `compute` sur les neuf). Les contenus qui citent un calculateur
par son id sont inchangés ; `EDITION_CONTENU` aussi.

- **D-C2-1 — fabrique déclarative.** Dix calculateurs sur onze sont décrits
  par `calculateurSimple({ entrees, etapes, resultats, alertes? })` : chaque
  étape lit la portée (entrées et étapes précédentes, par clé). Une seule
  implémentation de l'alerte de saisie et du contrat de sortie.
  `ecartDiffuseurs` (liste, tableau) reste programmé. Parité vérifiée sur
  les défauts et sur des saisies négatives, vides et quelconques : sorties
  identiques octet pour octet.
- **D-C2-2 — familles.** `FAMILLES_CALCULATEURS` groupe la page et, pour
  *Volume, débit et vitesse* et *Changer le volume*, partage les saisies
  (`cleSaisie`) : une vitesse saisie dans « Volume par hectare » se retrouve
  dans « Débit par buse ». Pas de partage dans *Mesures au champ* (`n` y
  désigne des rangs, dans `debitBuse` des buses). « Revenir aux valeurs par
  défaut » vaut pour toute la famille partagée, et le dit. Écarté : partage
  global par nom de grandeur (la vitesse d'un interceps n'est pas celle d'un
  pulvérisateur).
- **D-C2-3 — mesures imbriquées.** Une entrée mesurable s'ouvre sur les
  champs de sa mesure, dont les saisies sont celles de sa page ; les étapes
  de la mesure précèdent celles du calcul ; ses alertes sont préfixées du
  libellé de l'entrée, sans doubler l'alerte de saisie. Pas de mesure pour
  `debitChantier.v` : `vitesseMesuree` porte des saisies de pulvérisation
  (défaut F-VHA) ; à ouvrir si le référent travail du sol le souhaite.
  `ecartDiffuseurs` → `Q` (somme des débits) écarté : exact seulement si
  tous les diffuseurs ouverts sont saisis.
- **D-C2-4 — deux calculateurs ajoutés** pour compléter les familles, sans
  valeur nouvelle : `vitesseVisee` (troisième résolution de V = 600 Q / (v L))
  et `changementVitesse` (formule D-B2-4 déjà testée). Défauts repris
  d'origines existantes (section 13 mise à jour).
- **D-C2-5 — écran.** Résultats au-dessus des champs (le README l'annonçait,
  le gabarit ne le faisait pas) ; tableau d'écart après le détail du calcul ;
  pastilles de famille aussi dans les sections de module (elles mènent à la
  page Calculateurs). Libellé « deux débits non nuls » (point C1).

Rendu vérifié dans Chromium sans interface, `file://`, à 400 px et
1 100 px : famille, mesure de vitesse imbriquée (50 m / 35 s → 145 L/ha,
reprise par « Débit par buse » : 9,9 L/min), aucune largeur excédentaire.
Non vérifié : tablette réelle, gants, plein soleil, thème sombre à l'œil.

