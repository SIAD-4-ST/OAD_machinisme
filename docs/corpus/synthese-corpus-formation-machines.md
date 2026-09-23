# Synthèse du corpus — Formation aux réglages des machines viticoles (pulvérisation, travail du sol, effeuillage, poudrage)

Périmètre : 24 documents du projet « OAD_pulverisation » (2014–2020, Groupe Machinisme Champenois / CIVC / Comité Champagne) + `CLAUDE.md` de la maquette + note projet.
Règle appliquée : valeurs reprises telles quelles, chacune rattachée à son code source (§ 0). Aucune valeur ajoutée de mémoire. Les lectures de graphiques sont signalées « lecture graphique ». Les points périmés ou divergents sont regroupés en § 7.

---

## 0. Inventaire des sources

| Code | Fichier | Nature | Auteurs / date |
|---|---|---|---|
| F-VHA | Fiche_volume_hectare | Fiche méthode volume/ha | CIVC, fév. 2014 |
| F-FIL | Fiche_filtration | Fiche élément du pulvé | CIVC, fév. 2014 |
| F-CGE | Fiche_CG_expert | Fiche réglage Berthoud CG Expert | CIVC, avr. 2016 |
| F-CGA | Fiche_CG_airmist | Fiche réglage Berthoud CG Airmist | Magister-CIVC, avr. 2016 |
| F-JET | fiche_Jet_6000-5000 | Fiche réglage Bobard Jet 5000/6000 | GDV 51 – CIVC, avr. 2016 |
| F-PRE | Fiche_Precijet | Fiche réglage Tecnoma Precijet | Comité Champagne, mai 2016 |
| F-IDE | Fiche_Idéal_Jets_portés | Fiche réglage Idéal jets portés | CIVC, Magister, mai 2014 |
| F-GRE | Fiche_GREGOIRE | Fiche réglage Grégoire Dynadiff / FlexiSpray | CV-CNF – Comité Champagne, mai 2016 |
| F-BOI | FicheBoisselet | Fiche intercep Boisselet Cutmatic | Comité Champagne – CA 51, oct. 2015 |
| F-BRA | fichebraun | Fiche intercep Braun | CA 51 – Comité Champagne, oct. 2015 |
| F-DER | FicheCharrueDérot | Fiche charrue intercep Dérot | Comité Champagne – CA 51, oct. 2015 |
| F-OUV | ficheoutils_ouverture | Fiche outils d'ouverture du sol | CA 51 – Comité Champagne, oct. 2015 |
| F-EPN | Fiche_effeuilleuses_pneumatiques | Fiche effeuillage précoce pneumatique | s.d. (valeurs « 2016 ») |
| F-ERO | Fiche_effeuilleuses_rouleaux | Fiche effeuillage précoce rouleaux | s.d. (valeurs « 2016 ») |
| A-LVC | LVC avril 2014 | Article *Le Vigneron Champenois* (print) | M.-P. Vacavant, avr. 2014 |
| A-WEB | article_2014 | Même article, version web enrichie | M. Liébart, M.-P. Tréfouël-Vacavant, daté 05/04/2014 (cite le Guide 2022 → mis à jour après 2022) |
| D-IDR | Pulvé Web 2014 « idées reçues » | Diaporama essais 2013 | M.-P. Vacavant, S. Debuisson |
| D-ENQ | Résultats enquête pulvé 2013 | Diaporama enquête parc | M. Morlet, M.-P. Vacavant, S. Debuisson |
| D-POU | Poudreuses et poudrage | Diaporama enquête juin 2014 | M.-P. Vacavant, M.-L. Panon, S. Debuisson, 08/12/2014 |
| D-EF15 | effeuillage_2015 | Diaporama enquête + essais 2015 | Service vigne, 15/01/2016 |
| D-EF17 | effeuilleuses_pour_effeuillage_precoce | Diaporama matériels | Service vigne, mai 2017 |
| D-SOL | Outils_de_travail_du_sol | Diaporama outils + sols | Service vigne, avr. 2017 |
| B20-1 | Choisir la bonne buse – Partie 1 | Article *Le Vigneron Champenois* : performances physiques (p. 26–38) | M. Liébart, S. Debuisson, A. Descôtes, avr. 2020 |
| B20-2 | Choisir la bonne buse – Partie 2 | Article *Le Vigneron Champenois* : efficacité biologique (p. 18–25) | M. Liébart, S. Debuisson, A. Descôtes, mai 2020 |
| C-MD | claude_CLAUDE-formation-machines.md | Spécification technique maquette | — |

Licence des documents 2014–2017 : Creative Commons BY-NC-ND 3.0 (« pas de modification ») — conséquence en § 8. Les articles B20 ne portent aucune mention de licence : droits de la revue, à vérifier (§ 8). La dernière page de B20-1 (publicité PE.DI, capsules) est hors sujet et n'est pas reprise.

Note sur les fichiers : les « .pdf » du projet sont des archives zip (images de pages + texte extrait). `article_2014` ne contient aucun texte extrait : son contenu a été lu sur les images.

---

## 1. Cadre de l'outil (C-MD + note projet)

- Maquette mono-page `<x-dc>` interprétée par `support.js` (jamais modifié) ; logique métier exclusivement dans `moteur-oad.js` (pur, double export `module.exports` / `window.OAD`) ; tests `node tests/parite.test.js` avant et après toute modification du moteur.
- Deux domaines dans une page : `pulverisation` et `travail-du-sol` (`v.domaine`) ; moteur : `synthesePulve(inp)`, `syntheseSol(inp)`. La vue ne recalcule rien (test : absence de `600 *` et de `Math.pow` dans le script).
- Contenu pédagogique dans `OAD.CONTENU` : `statut` ∈ brouillon | a-valider | valide, `sources[]`, `valideur` ; `validerContenu()` refuse « valide » sans source ni valideur. Réglage/tolérance/périodicité non sourcé → `[À RÉDIGER]`, statut brouillon. Questions de quiz déduites des formules du moteur (test).
- Buse de référence du panneau Hypothèses : Albuz ATR Blanche, courbe ajustée sur mesures publiques IFV lues le 22/09/2026 (`OAD.BUSE_REF`). **Ces mesures IFV ne figurent pas dans le corpus du projet.**
- Persistance `localStorage`, clé `oad-formation-machines-v1` ; pas d'appel réseau ni de donnée dans l'URL ; formats fr-FR ; jetons couleur `var(--…)` ; 4 niveaux typo 36 / 22 / 13,5 / 11,5 px.
- Base de réflexion déclarée : OAD IFV « Mon réglage pulvé » (reglage-pulve.vignevin.com).
- Besoin terrain documenté (D-ENQ 2013, 690 questionnaires) : manuel non fourni dans 34 % des achats, prise en main réalisée dans 35 % des cas, réglage d'orientation des diffuseurs fait par le vendeur dans 42 % des cas ; plan d'action du Groupe prévoyait « outils interactifs smartphone, Internet » et un glossaire.

---

## 2. Pulvérisation — paramètres de base et formules

### 2.1 Volume par hectare (F-VHA)

**Formule** : Volume/ha (L) = Débit total (L/min) × 600 / [Vitesse (km/h) × Largeur traitée (m)]

**Débit total de l'appareil** : remplir le circuit, pulvériser quelques secondes ; remplir la ou les cuves à ras bord ; faire tourner **2 min** (jets projetés, pendillards) ou **5 min** (pneumatiques, jets portés) ; refaire le niveau en mesurant le volume ; diviser par 2 ou 5.

**Vitesse** : mesure « départ lancé » sur 50 m entre deux jalons ; Vitesse (km/h) = Distance (m) × 3,6 / Temps (s).

| Temps sur 50 m | 27,5 s | 30 s | 32,5 s | 35 s | 37 s | 40 s | 45 s | 60 s |
|---|---|---|---|---|---|---|---|---|
| Vitesse (km/h) | 6,5 | 6 | 5,5 | 5,1 | 4,8 | 4,5 | 4 | 3 |

**Largeur traitée** : enjambeur = nombre de rangs traités × écartement (ex. 7 × 1,10 m = 7,7 m). Turbine sur chenillard : 1×, 2× ou 3× l'écartement selon passage toutes les routes, toutes les 2 ou toutes les 3 routes.

**Contrôle diffuseur par diffuseur** : intervention si écart > 10 % à la moyenne (nettoyage ou changement buse/pastille, vérification anti-gouttes).

**Causes d'écart volume théorique / mesuré** : surface pulvérisée ≠ surface plantée (tronçons, coupures, pointes, chemins) ; volume embarqué mal connu (épalage de cuve) ; débit réel ≠ estimé (buses/pastilles usées, filtres bouchés, fuites, densité produit, manomètre ou débitmètre défaillant, pompe irrégulière) ; vitesse fausse (capteurs, entrées/sorties de rang) ; écartements hétérogènes.

**Règle de trois sur les hauteurs de buses** (A-LVC) : 180 L/ha avec 3 hauteurs par descente → 120 L/ha avec 2 hauteurs.

### 2.2 Vitesse d'avancement

- Optimum ≈ 5 km/h pour la plupart des appareils (A-LVC, D-ENQ) ; 4–5 km/h (D-IDR).
- Essai 2013, jet porté face par face, 150 L/ha, vigne forte vigueur, 4 100 tr/min (D-IDR) : **−50 % de dépôt en zone grappes à 7 km/h**, **−40 % à 3 km/h** (effet « drapeau » : l'air couche les feuilles), −20 % à une vitesse intermédiaire (lecture graphique). Conclusion source : ralentir n'améliore pas la protection avec ce type de matériel ; tout changement de pratique impose d'adapter les réglages.
- D-ENQ nuance : réduire la vitesse possible sur parcelles très vigoureuses ou sans assistance d'air ; l'augmenter légèrement possible en très faible pression.

### 2.3 Filtration (F-FIL)

Principe : filtrer grossier en tête de circuit (grande surface), de plus en plus fin jusqu'à la buse. Le bouchage d'une buse doit être exceptionnel.

| Ancienne couleur | Couleur ISO 19732 | Mesh | Maille mm (µm) | Usage conseillé |
|---|---|---|---|---|
| Noir | Marron | 16 | 1,1 (1 100) | Remplissage |
| Blanc | Rouge | 32 | 0,6 (600) | Remplissage / aspiration |
| Bleu clair | Bleu foncé | 50 | 0,3 (300) | Pression |
| Gris | Jaune | 80 | 0,18 (180) | Pression / rampe |
| Rouge | Vert | 100 | 0,14 (140) | Rampe / buse |

- Mesh = nombre de fils par pouce (mesure inverse de la maille).
- Aspiration : maillage grossier (risque de cavitation), nettoyage à chaque remplissage.
- Refoulement : maille < diamètre des buses, vanne de décompression, nettoyage après chaque traitement.
- Rampe/buse : maille < diamètre buse et ≤ filtre pression ; facultatifs si l'amont est bon.
- Pièces laiton oxydées : filtres tube ou coupole 80 mesh au niveau des buses.
- Ordre d'incorporation : correcteurs de dureté (ex. sulfate d'ammonium) → poudres → liquides SL, SC, EW, EC → adjuvants ; lire l'étiquette.

### 2.4 Taille de gouttes, buses, dérive

| Technologie | Levier contre la dérive / pour le dépôt | Source |
|---|---|---|
| Toutes | Pulvérisation confinée (panneaux récupérateurs) = solution la plus efficace ; limites : encombrement, fragilité, largeur réduite à 2–4 rangs | A-LVC, A-WEB |
| Jets projetés (pendillards) | Buses anti-dérive à injection d'air (TVI) en début de saison : +50 % de produit reçu (essai début 2000), +40 % confirmé en 2010 ; revenir aux buses à turbulence (type ATR) après le premier écimage (grosses gouttes pénètrent mal) ; option : garder l'anti-dérive sur le porte-jet du haut | A-LVC, D-ENQ |
| Jets projetés | Orienter les buses ≈ 10° vers le haut | A-LVC |
| Jets portés | Buses horizontales (incliner perturbe le cône) ; cellule au maximum de vitesse d'air ; pas de buse anti-dérive, « contre-productives sous 300 L/ha » ; buse à turbulence basse pression, calibre > 0,50 (violet) | A-LVC, A-WEB |
| Jets portés | Buses ouvrant complètement le cône à la pression de travail 3,0–4,5 bar, ex. TeeJet Conejet TXA80 0050 lilas ; couverture ≈ 40 cm par buse | F-PRE, F-IDE |
| Jets portés | Buses à injection d'air (ex. TVI) autour des zones accueillant des personnes sensibles ou pour réduire les ZNT | F-PRE (2016) |
| Pneumatiques | Viser de grosses gouttes : réduire la vitesse d'air (jusqu'au moment où la veine ne dégouline plus des mains) ou, si non modulable, augmenter le débit de bouillie | A-LVC |

Résultats 2017–2019 sur le choix de buse en jets portés (dépôt, couverture, efficacité biologique) : voir § 2.8.

Principe transversal (A-LVC) : l'eau n'est qu'un vecteur ; augmenter le volume/ha sur un appareil à buses impose d'augmenter la pression, ce qui affine les gouttes et accroît la dérive.

### 2.5 Écarts de performance entre matériels (A-LVC, A-WEB, D-ENQ)

- Essai CIVC–IFV, début de végétation, 19 matériels ou réglages : rapport de 2 à 3 entre moins et plus performants (lecture graphique : ≈ 185 à ≈ 450 ng/dm² de tartrazine pour 1 g/ha, annoté « × 2,5 »). Face par face ventilé = meilleurs ; pendillards = moins bons. Suite du classement via banc EvaSprayViti (IFV–Irstea) et site performancepulve.fr (cité par A-WEB).
- Banc EvaSprayViti 2015–2016 (IFV, Irstea) : 13 appareils, 110 modalités, début de végétation (B20-1, fig. 1 ; résultats complets dans *Le Vigneron Champenois* de décembre 2015, hors corpus). Lecture graphique, unité non précisée (astérisque sans renvoi) :

| Technologie | Nombre de modalités | Plage lue |
|---|---|---|
| Jet porté | 7 | ≈ 270–430 |
| Pneumatique, diffuseurs dans le rang | 3 | ≈ 310–355 |
| Pneumatique par le dessus | 6 | ≈ 225–270 |
| Pendillard, buses à turbulence | non indiqué | ≈ 135 |

  Conclusion de la source : le face par face dans le rang (jets portés ou pneumatiques) donne les meilleurs résultats. Les jets portés offrent le plus de souplesse, parce qu'on peut choisir la taille des gouttes par la buse, le calibre et la pression.
- Pneumatique par le dessus, végétation 7–8 feuilles : réglage technicien = +60 % de dépôt vs réglage initial du vigneron.
- Méthode IFV de quantification : 540 capteurs par appareil ou réglage ; ≈ 600 h de travail en 2013 (D-IDR).
- D-ENQ, par technologie : pneumatiques = ¾ des surfaces, bons résultats face par face mais forte puissance (carburant) et réglage délicat (goutte = rencontre air/veine liquide) ; jets portés (type Precijet) en forte progression, tous face par face, meilleurs aux tests, moins énergivores, légers, faciles à régler ; pendillards légers et faciles mais pénalisés en vigne feuillue, chaleur, vent.

### 2.6 Rosée (D-IDR, essais 2013)

- Jet porté 150 L/ha : dépôt équivalent en zone grappes sans rosée, rosée moyenne, rosée très forte → avec assistance d'air, la rosée peut être ignorée.
- Jet projeté 400 L/ha : −40 % et −55 % (lecture graphique, rosée moyenne / très forte) → risque de dépasser le point de ruissellement.

### 2.7 Écartement des passages au chenillard (D-IDR, pleine végétation, vigueur moyenne, 5,1 km/h, réglages non adaptés)

| Passage | Volume | Rang indirect : feuilles | Rang indirect : grappes |
|---|---|---|---|
| Tous les 2 rangs | 230 L/ha | −30 % | équivalent |
| Tous les 3 rangs | 150 L/ha | −50 % | −60 % |
| Tous les 4 rangs | 117 L/ha | −65 % | −70 % |

Conclusion source : au-delà d'un passage tous les 2 rangs, protection insuffisante des rangs intermédiaires.

### 2.8 Choix de la buse en jets portés (B20-1, B20-2)

**Fonctions de la buse** : elle calibre le débit à une pression donnée, fractionne la bouillie en gouttelettes et disperse le jet selon un patron. Selon B20-1, c'est le composant qui a le plus d'influence sur la performance d'un appareil à jets portés. La taille des gouttes se choisit par quatre paramètres : le type de buse (turbulence ou fente), sa technologie (classique ou injection d'air), son calibre (qui fixe le volume/ha) et la pression d'utilisation. Consigne de la source : « le bon calibre à la bonne pression ». Hors de la plage de pression recommandée, l'angle du cône et la taille des gouttes se dégradent, même à calibre identique.

**Granulométrie** (B20-1)

| Classe | Taille |
|---|---|
| Fines | 90–150 µm |
| Moyennes | 200–250 µm |
| Grosses | ≈ 450 µm |

- VMD (diamètre médian en volume) : 50 % du volume pulvérisé est en gouttes plus grosses, 50 % en gouttes plus petites.
- NMD (diamètre médian en nombre) : même définition, mais sur le nombre de gouttes.
- SMD (diamètre moyen de Sauter) : rapport volume/surface de l'ensemble des gouttes.
- En pratique agricole, on caractérise une buse par le VMD, le NMD et le rapport VMD/NMD.
- Deux buses de même valeur moyenne peuvent avoir des spectres différents.

**Mécanismes** (B20-1)
- Les gouttes fines sont sensibles à la dérive et à la volatilisation. Elles sont bien transportées par le flux d'air, mais leur énergie cinétique peut être insuffisante pour traverser le feuillage.
- Les grosses gouttes subissent l'effet « flèche » : elles tombent au sol avant d'atteindre la cible. Elles pénètrent mal vers les grappes et la face inférieure des feuilles.
- Les gouttes moyennes sont un compromis entre les deux.

**Buses comparées** : Tecnoma rampe Millésime, descentes Précijet, 5 km/h (B20-1).

| Code | Buse | Type | VMD | Volume/ha |
|---|---|---|---|---|
| Turb | TeeJet Conejet TXA 80005 | Turbulence classique | 150 µm | 150 L |
| Turb AD | Albuz TVI LP 80005 | Turbulence à injection d'air (anti-dérive) | 450 µm | 150 L |
| Fente LD | Lechler AD 90 01 | Fente à dérive limitée, pastille de calibrage | 250 µm | 220 L |

**Performances physiques**

Dispositif : parcelle Terroir du domaine de Plumecoq, gradient de vigueur (fort en bas, faible en haut). 3 buses × 3 vigueurs × 3 stades = 27 modalités. Mesures : dépôt par méthode tartrazine (E 102), couverture par papiers hydrosensibles, surface foliaire par NDVI associé à une mesure destructive.
- **Dépôt moyen** (tous compartiments) : valeurs proches pour les trois buses. Fente LD légèrement au-dessus, sans différence significative aux plus fortes surfaces foliaires. Le dépôt décroît quand la surface foliaire augmente (lecture graphique : ≈ 270 ng/dm² pour 1 g/ha à 0,7 contre ≈ 150–200 à 4,1).
- **Face supérieure des feuilles** : les gouttes moyennes et grosses déposent plus que les fines.
- **Face inférieure des feuilles** : Fente LD > Turb > Turb AD.
- **Zone des grappes** : seule Fente LD se détache ; Turb et Turb AD sont identiques.
- **Banc EvaSprayViti, dépôt global** : proche pour les 3 buses (lecture graphique ≈ 142 / 123 / 121 pour « TPJ AD », « TPJ TVI », « TPJ TXA »). La correspondance entre « TPJ AD » et Fente LD n'est pas explicitée.
- **Couverture et répartition** : Turb AD couvre et répartit moins bien, à dépôt moyen égal. Fente LD est intermédiaire en nombre d'impacts et en couverture. Exception : en face inférieure, la couverture de Turb AD est légèrement supérieure aux deux autres. À surface couverte égale, la répartition de Turb AD reste hétérogène. Pour égaler Turb, il faudrait « de manière très significative » plus de volume, ≈ 300 L/ha.

**Efficacité biologique** (B20-2)

Deux dispositifs :
- petites parcelles : blocs de Fisher, 4 répétitions, ceps contaminateurs ; la source mentionne aussi un carré latin ;
- grandes parcelles : « bandes de comportement » sur le pulvérisateur du viticulteur, moitié buses de référence et moitié buses testées, programme de l'exploitant.

Les valeurs ci-dessous sont des lectures graphiques ; les lettres sont les groupes statistiques de la source.

| Essai | Comparaison | Résultat |
|---|---|---|
| Mildiou 2017, feuilles, notation 7/07 | Turb vs Turb AD, programme tout folpel ou tout cuivre | Fréquence : Turb Folp ≈ 46 (b), Turb AD Folp ≈ 72 (ab), Turb Cu ≈ 63 (b), Turb AD Cu ≈ 81 (ab), témoin 100 (a). Intensité : ≈ 5 / 13 / 8 / 14 / 47. Plus de symptômes avec AD. |
| Mildiou 2017, grappes, notation 20/07 | idem | Intensité ≈ 21 (c) / 23 (c) / 49 (b) / 51 (b) / 80 (a). Effet produit (folpel > cuivre), aucun effet buse. |
| Oïdium 2018, pinot noir, tout soufre | Turb AD vs Turb | 3/07 : fréquence 99 vs 79, intensité 52 vs 16. 18/07 : fréquence 99 vs 95, intensité 55 vs 28. Nettement plus de dégâts avec AD. |
| Oïdium 2019, inoculé, tout soufre | Fente LD 0067 vs Turb 0005 | 16/07 : écart faible mais significatif en faveur de Turb (intensité ≈ 5 vs 4). 30/07 : aucune différence (≈ 28 vs 26). |
| Botrytis 2017, grandes parcelles, 2 applications (stades A et B) | TVI vs TXA | Fréquence ≈ 54 vs 36, intensité ≈ 7,5 vs 4. Texte de la source : attaque « deux fois plus » forte avec anti-dérive, jugé non satisfaisant. |
| Botrytis 2018 et essai fente 0067 en 2019, grandes parcelles | — | Pas de pression de maladie, aucune conclusion. |

Justification de la source pour le choix folpel / cuivre : le cuivre se redistribue après humectation, alors que le folpel n'agit qu'au point d'impact.

**Mise en œuvre chez le viticulteur** (B20-2)
- Retour des utilisateurs : les buses à turbulence anti-dérive semblent un peu plus sensibles au bouchage.
- Les buses à fente de calibre inférieur à 01 (orange), comme 0050 et 0067 (kaki), sont très sensibles au bouchage. Elles sont quasiment inutilisables avec du matériel de viticulteur, même bien entretenu et filtré.

**Conclusions de la source** (B20-2)
- **Turbulence anti-dérive** : à 150–180 L/ha, pas de protection satisfaisante et pas de réduction d'intrants possible. En année à forte pression, il faudrait traiter plus souvent, avec un bilan environnemental défavorable.
- **Fente à dérive limitée** : efficacité équivalente ou supérieure à la référence. Mais à 150–180 L/ha, elle impose les calibres 0050 et 0067, qui se bouchent. Le calibre 01 (orange) est envisageable si l'on accepte 220–250 L/ha.
- **Perspective annoncée en 2020** : essai par le Comité Champagne d'une régulation par impulsion à la buse, pour garder la granulométrie tout en conservant les volumes/ha habituels. Aucun résultat dans le corpus.

---

## 3. Pulvérisation — réglages par matériel

Domaine de validité commun à toutes les fiches : vignes à écartement 1 m – 1,10 m, taillées selon la réglementation champenoise. Vitesses de cellule « à titre indicatif » ; la vitesse d'air se mesure au tube de Pitot.

### 3.1 Tableau des consignes chiffrées

| Matériel | Stade | Vitesse | Volume/ha | Rotation cellule 7 rangs / 9 rangs (tr/min) |
|---|---|---|---|---|
| **CG Expert** (F-CGE) | Début végétation (≤ 80 cm) | 5 km/h | 100–150 L | Speedair 3 300 / 3 500 ; Supair 2 500 / 2 700 |
| | Pleine végétation | 5 km/h | 150 L | Speedair 3 600 / 3 800 ; Supair 2 800 / 3 000 |
| | Ciblé grappes | 5 km/h | 100 L | Speedair 3 600 / 3 800 ; Supair 2 800 / 3 000 |
| **CG Airmist** (F-CGA) | Début végétation | 5 km/h | 150 L | Speedair 3 100 / 3 300 ; Supair 2 500 / 2 700 |
| | Pleine végétation | 5 km/h | 150 L | Speedair 3 500 / 3 700 ; Supair 2 800 / 3 000 |
| | Ciblé grappes | 5 km/h | 150 L | Speedair 3 500 / 3 700 ; Supair 2 800 / 3 000 |
| **Jet 5000/6000 Bobard** (F-JET) | Début / pleine / ciblé | 5 km/h | 150 L | 3 300 / 3 500 (début) ; 3 600 / 3 800 (pleine, ciblé) |
| **Precijet Tecnoma** (F-PRE) | Début végétation | 5 km/h | 100–120 L | Turbine 7 rangs : 3 500 avec obturateur, 4 000 sans |
| | Pleine végétation | 5 km/h | 150–180 L | 3 000–3 400 (pression maladie faible) ; 3 800–4 000 (forte) |
| | Ciblé grappes | 5 km/h | 100–120 L | 3 500 avec obturateur, 4 000 sans |
| **Idéal jets portés** (F-IDE) | Début végétation | 5 km/h | 100–120 L | 4 000 |
| | Pleine végétation | 5 km/h | 150–180 L | 3 000–3 400 (faible) ; 3 800–4 000 (forte) |
| | Ciblé grappes | 5 km/h | 100–120 L | 4 000 |
| **Grégoire Dynadiff / FlexiSpray** (F-GRE, source constructeur) | Début végétation | 5 km/h | 120 L | CPJ Optima Ultima : 3 700–4 000 (7 et 9 rangs) |
| | Pleine végétation | 5 km/h | 160–180 L | 4 000–4 200 |
| | Ciblé grappes | 5 km/h | 120 L | 3 700–4 000 |

### 3.2 Consignes qualitatives par matériel

**Pneumatiques face par face par le dessus (CG Expert, CG Airmist, Jet 5000/6000)**
- Début de végétation : baisser la rampe au maximum (rallonges judicieuses) ; couper le diffuseur du haut (mains à double diffuseur) ; orienter le diffuseur du bas vers la végétation ; légère orientation avant/arrière pour ne pas opposer les flux ; les mains de deux descentes ne doivent pas se faire face (A-LVC, F-CGA, F-JET).
- CG Expert : buse ATR **blanche** diffuseur haut (flèche vers le haut), ATR **marron** diffuseur bas ; « 0 » de la main face au rang ; repères d'orientation : début = repère sur 0 ; pleine végétation = mains ≈ 10 cm au-dessus du feuillage, main entre 3 et 4 vers l'arrière, diffuseurs entre 0 et 1 ; ciblé = repère sur 1 vers l'arrière, diffuseur bas vers les grappes ; pige pour reproduire les réglages (F-CGE, A-LVC). Astuce utilisateur : ouvrir la buse du haut au rinçage.
- CG Airmist : « H » gravé de l'éclateur en haut de la main (sinon joint torique en haut) ; même chiffre de pastille sur toutes les mains, recontrôler les débits après changement ; ne pas trop serrer la molette bleue (F-CGA).
- Jet 5000/6000 : début = angle horizontal 10° par rapport au rang ; pleine végétation = mains 10–15 cm au-dessus du feuillage, 40° à 50° ; nettoyer les diffuseurs après chaque traitement (bouchon + goupillon) sinon caillot (F-JET).
- Kit anti-botrytis / descentes dans le rang : option début de saison et ciblé grappes. Enquête 2013 : 43 % des propriétaires de pneumatiques n'en utilisent pas, 51 % pour le localisé, 6 % pour tous traitements ; recommandation source : les utiliser jusqu'à fermeture de la grappe (D-ENQ).

**Jets portés (Precijet, Idéal)**
- Base de l'élément à 20–35 cm du sol ; espacements indiqués entre porte-jets 25–35 / 35–38 / 40 cm selon stade (F-IDE, F-PRE) ; 2 hauteurs de buses en début et ciblé, 3 en pleine végétation.
- Vitesse d'air recherchée au niveau de la végétation : 30–50 km/h.
- Début de végétation : décaler les descentes (une vers l'avant, la suivante vers l'arrière, molette du cylinblock/silent-bloc) pour ne pas opposer les flux.
- Fin de saison, grappes fermées, rognage > 1,30 m : remonter la rampe de 10 cm (F-IDE ; F-PRE sans la condition de hauteur).
- Croisement des jets au niveau des inflorescences (A-LVC).

**Grégoire Dynadiff sur pendillard souple FlexiSpray** : vitesse d'air cible en sortie 280 km/h (source constructeur) ; début et ciblé = débrancher l'arrivée de bouillie des diffuseurs hauts (connecteur), pas d'obturateur d'air ; pleine végétation = rebrancher.

**Jets projetés (pendillards)** (A-LVC) : 2 hauteurs de buses par descente suffisent ; 1er porte-jet à 30–40 cm du sol, 2e à 50–60 cm ; orientation ≈ 10° vers le haut.

### 3.3 Contrôle de la couverture

Au printemps, réorienter 2 à 4 fois ; vérifier à chaque modification avec plaque de fer rouillée, piquet rouillé, carton ou ardoise ; protéger les brins de pied (départs mildiou/oïdium) (A-LVC). Papiers hydrosensibles ou traceurs fluorescents de nuit pour visualiser la couverture des rangs indirects (D-IDR).

---

## 4. Pulvérisation — entretien, remise en route, équipements

### 4.1 Remise en route de saison (A-WEB)

Après remontage pompe et rampes :
- état de tous les filtres (aspiration, refoulement, rampe, buse) ;
- propreté et état des anti-gouttes, buses, diffuseurs ;
- pression de la cloche à air de la pompe ≈ 1/3 de la pression de travail ;
- niveaux d'huile.

Cuve remplie modérément d'eau claire, pulvérisation enclenchée :
- traquer les fuites (cuves, tuyaux) ;
- contrôler tous les débits (buse défectueuse, caillot) ;
- si ventilation : état des conduites d'air (pas de pincement, ni de fuite) ;
- remplir le bidon lave-mains d'eau claire ;
- tracteur à cabine : joints des ouvertures, filtre remplacé 1 fois/an ou toutes les 500 h ;
- EPI renouvelés : gants nitrile ou fluoro-élastomère EN 374 CE, filtres A2P3 (≥ 2 fois/an), combinaison.

Puis réglage volume/ha (vitesse, débits) et orientation pour la végétation basse.

### 4.1 bis Usure et nettoyage des buses (B20-1)

- **Signe d'usure** : le débit augmente, puis la distribution se dégrade.
- **Test** : comparer le débit de la buse à celui d'une buse neuve de même type et de même taille. Il faut donc contrôler régulièrement les débits.
- **Durée de vie** : 2 à 5 ans en moyenne, selon le produit, la pression et la fréquence d'utilisation.
- **Nettoyage** : sans instrument abrasif, à la brosse à poils souples ou au nettoyeur à ultrasons (faible coût, plus rapide et plus efficace).

### 4.2 Équipements du parc (D-ENQ 2013)

- **Tronçons** : majorité à 3 tronçons, jugé « très insuffisant » ; 5 à 7 tronçons en progression depuis la communication de 2010. Conception « rang entier » (deux demi-faces d'un même rang) préférée à « diffuseur entier ».
- **Cuves** : 69 % une cuve (préférable : un seul fond de cuve, dose mieux ajustée) ; cuve de rinçage sur 96 %. Bidon lave-mains ≥ 15 L indépendant du circuit obligatoire (normes EN 907 et EN 1553, citées par la source).
- **DPA(E)** : 33 % équipés. Intérêt : précision, confort, traçabilité. Limites : masque un bouchage ; en forte pente, réduction de débit pouvant déclencher les anti-gouttes → passer en manuel sur les hauts de parcelle.

### 4.3 Profil du parc (D-ENQ 2013, 690 questionnaires, 1 050 connexions)

- Répondant moyen : 88 % ont accès à du conseil ; 9 ha par pulvérisateur ; connaît mal son matériel et le vocabulaire (confusions cellule / régime moteur / prise de force, « main », « tronçon »).
- Porteur : 93 % tracteur (70 % < 10 ans ; 50 % > 100 CV, 40 % entre 75 et 100 CV), 7 % chenillard (87 % < 10 ans ; 88 % hydrostatique).
- Chenillard : 45 appareils, 93 ha ; 80 % jets portés turbine solo (66 %) ; passage toutes les 3 routes à 57 % ; 2,58 ha traités en moyenne.
- Tracteur : 560 appareils, 4 442 ha ; 84 % face par face ; 9,2 ha en moyenne (majorité 4–8 ha) ; surfaces : pneumatiques 77 %, jets portés et jets projetés 11–12 % chacun (pendillards sous-représentés, biais de profil).
- Pendillards : près de ¾ équipés de buses anti-dérive.
- ≈ 80 % déclarent régler ; la moitié des pendillards non adaptés ni en début de saison ni en ciblé grappes.
- Volumes/ha déclarés conformes aux conseils mais « empiriques » pour les pneumatiques.
- Demandes exprimées (126 commentaires) : formation et aide aux réglages, coût des pièces, retard technologique vs matériel agricole.

---

## 5. Poudrage du soufre (D-POU, enquête juin 2014 : 302 réponses, 218 poudrent ≈ 2 600 ha, 143 propriétaires)

**Produit** : soufre sublimé 5–15 µm (poudrage) ; trituré ventilé 15–100 µm ; micronisé < 5 µm et atomisé 1–6 µm (pulvérisation). Action par contact et vapeur, multi-sites. Pas de dose homologuée en 2014 ; dose firme (UPL, Fluidosoufre) 20–30 kg/ha ; demande d'homologation à 25 kg/ha déposée.

**Conditions d'efficacité** : dépôt au plus près des grappes ; activité dès 5 °C, optimum 20–25 °C ; pas de vent ; luminosité ; pas de pluie 48 h (plus lessivable que le mouillable) ; végétation sèche. Risque de brûlure > 28 °C (à 2 m sous abri).

**Pratique** : 1 à 2 poudrages, en intercalaire, sur parcelles sensibles ; pleine ou fin floraison (1 passage), début et fin floraison (2 passages) ; 66 % le matin.

**Sécurité** : risques perçus santé 38 %, phytotoxicité 36 %, incendie 20 % (nuage de poussière inflammable au contact d'une flamme ou d'électricité statique, mention FDS uniquement). Délai de rentrée 48 h (classement R43), non respecté dans 30 % des cas. EPI recommandés : gants nitrile, combinaison Tyvek cat. III type 5/6, masque FFP2 ou FFP3, protection oculaire étanche (ou demi-masque A2P3 étanche).

**Matériels** (parts utilisateurs) : Berthoud 40 %, Calvet 14 %, Hervé 12 %, Chabas/Teyme-Chabas 11 %, Blanchard 8 %. 85 % diffusent dans le rang au niveau des grappes. Largeur : 80 % indépendante des passages pulvé ; toutes les 4 (28 %), 6 (22 %), 5 (18 %), 7 (13 %), 9 (13 %) routes. Capteurs scotch : quasi rien au-delà d'une ou deux routes traversées ; recommandation source : 4 à 6 rangs.

**Réglage de dose** : difficile dans 50 % des cas, impossible dans 4 % ; manette graduée non linéaire (exemple notice : position 1 = 18 kg/h ; 1,5 = 54 kg/h ; 2 = 96 kg/h) ; dose ajustée par tâtonnement puis par la vitesse d'avancement. Vitesse de turbine réglable sur 70 % des matériels ; elle agit sur la pénétration, pas (ou peu) sur le débit (écoulement gravitaire dominant ; « venturi » = abus de langage). Colmatage : jamais 55 %, parfois 42 %, souvent 3 % (tassement au transport, humidité).

| Marque | Surfaces poudrées (ha) | Cuve (L) | Rangs traités | Écart dose réelle/visée | Note /5 |
|---|---|---|---|---|---|
| Berthoud | 167 | 50/80/120 | 4–5 | 1,5 | 3,5 |
| Teyme-Chabas | 184 | 50/100/250 | 5–6 | 3 | 3,3 |
| Calvet | 418 | 150/300/700 | 8–9 | 0,5 | 4,0 |
| Hervé | 128 | 80/200/500 | 5–6 | 2,75 | 4,2 |
| Blanchard | 41 | 50 | 5–6 | 0,5 | 3,7 |

(101 réponses ; déclarations d'utilisateurs, aucune donnée constructeur ; unité de l'écart non précisée dans la source.)

---

## 6. Travail du sol

### 6.1 Interceps — réglages communs (F-BOI, F-BRA)

- Profondeur de lame pour désherbage : **3 à 6 cm**, à adapter (couvert dense, sol compact).
- Palpeur **5 cm en avant de la lame** sur toute sa longueur ; le plus bas possible pour déclencher l'effacement sur la tête de souche ; il doit suivre le sol ; sensibilité à ajuster selon l'âge de la vigne.
- Hydraulique (Boisselet, Braun) : 6 à 15 L/min par moteur ; ≈ 90 bar utile.
- Palpeurs coudés préférables en Champagne (sous conditions).
- Outil d'ouverture devant la lame nécessaire : limite la contrainte sur le pivot et l'usure.
- Attention aux fils au sol en début de saison (lames courbes, accessoires).

**Boisselet Cutmatic** (F-BOI) : régler avec porte-outil horizontal (un côté sur vérin, l'autre sur chaîne de terrage) ; profondeur et angle d'attaque par 4 boulons ; lame sur support cranté, perpendiculaire au rang en position de travail ; vis papillon arrière = distance palpeur/lame, vis papillon avant = sensibilité d'effacement, lumière = hauteur du palpeur. Longueur de lame : 40 cm pour 1,10 m d'écartement, 35 cm pour 1 m ; largeurs 6 et 10 cm ; accessoires « queues de cochon », peignes, maillons de chaîne. Moteur polyvalent (outils rotatifs, brosses, tondeuses). Montage décalé : évite la consommation d'huile simultanée, complique entrées/sorties de rang.

**Braun** (F-BRA) : une seule dimension de lame en vigne étroite (plate, légèrement courbée, fortement courbée) ; pointe avant et couteau d'ouverture améliorent la pénétration ; profondeur réglée sur le porte-outil (vérins ou chaîne), inclinaison de lame fixe ; boîtier hydraulique fourni = réactivité à l'effacement et au retour ; moyeu cranté = rapprochement palpeur/lame ; deux boulons = inclinaison du palpeur.

**Dérot, charrue sans palpeur, mécanique, parallélogramme** (F-DER) : lame ≈ 45° vers l'arrière, effacement par appui sur le cep → réglages selon l'âge de la vigne. Réduire l'angle d'attaque (moins agressif) en vérifiant le recouvrement des deux lames sous le rang. Modèle années 1960 : barre à trous (amplitude du retour), boulon de tension du ressort. Modèle années 1970 : boulon excentrique (angle), tige filetée (prétension au repos), deux boulons arrière (tension initiale), réglage plus fin.

### 6.2 Outils d'ouverture (F-OUV)

| Outil | Largeur | Déplacement de terre | Commentaire source |
|---|---|---|---|
| Griffe droite | 4 et 8 cm | Faible | Bonne pénétration, entretien courant |
| Couteau Braun | ≈ 1 cm, pointe avant | Très faible | Efficace même en sol assez dur |
| Cœur | 12–20 cm | Moyen | Désherbage complémentaire ; pénètre mal en sol compact |
| Rasette à plante | 20–35 cm | Très important | Complément ; lames vers l'intérieur pour travailler une partie de l'inter-rang, limiter une bande enherbée en période sèche |
| Disque plein | quelques mm | Très faible à moyen selon angle | Découpe la bande d'herbe ; 1 à 2 passages/an ; étançon à moyeu orientable |
| Disque cranté | quelques mm | Très faible à moyen selon angle | Mottes plus petites que le disque plein |

### 6.3 Évaluation comparée des interceps (D-SOL, avril 2017)

Code couleur de la source : vert / orange / rouge, **sans légende**. Interprétation retenue (inférence) : vert = favorable (faible demande hydraulique, peu de blessures, réglage facile).

| Outil | Demande hydraulique | Désherbage parcelles sales | Nettoyage autour des pieds | Blessures des pieds | Facilité des réglages |
|---|---|---|---|---|---|
| Disques crénelés | vert | vert | orange | vert | rouge |
| Boisselet outils rotatifs | rouge | vert | rouge | vert | rouge |
| Belhomme avec palpeurs | orange | orange | orange | vert | orange |
| Belhomme sans palpeurs | vert | orange | vert | orange | orange |
| Ecocep | vert | vert | vert | rouge | orange |
| Dérot lames | vert | rouge | vert | orange | orange |
| Interceps couteaux | vert | rouge | vert | orange | orange |
| Boisselet avec lames | orange | rouge | rouge | vert | rouge |
| Braun avec palpeurs | orange | rouge | rouge | vert | orange |
| Braun sans palpeurs | vert | orange | vert | orange | orange |
| Étoile Kress | vert | rouge | orange | vert | orange |

Itinéraires (D-SOL) : mixtes (vibroculteur, charrue et covercrop Boisselet, Vitimeca avec cure-ceps, Mécavallée, Humus) ; zéro herbicide (disques crénelés de semi-buttage, rotatifs Petalmatic, lames incurvées Belhomme, Ecocep en reprise de sortie d'hiver ; lames Boisselet 3 rangs et Braun en saison ; brosses Naturagriff et étoiles Kress à l'approche des vendanges).

### 6.4 Traction et sols (D-SOL)

- Engins observés : chenillard > 30 ch ; enjambeur monorang à transmission mécanique (DTF 60) ; gros porteurs (vigilance sur la monte pneumatique).
- Pneu : carcasse diagonale ou radiale ; radiale = +20 % de surface de contact.
- Humidité : sol sec = bonne portance, compaction faible mais très profonde ; humide = portance moyenne, compaction faible en surface ; gorgé = mauvaise portance, compaction forte et profonde.
- Pratiques : sol non travaillé (bonne portance, mauvais ressuyage, compact en surface) ; travaillé (mauvaise portance, possible compaction sous l'horizon travaillé) ; enherbé (bonne portance, bon ressuyage, compact en surface) ; mulch (bonne portance, effet planche, compaction possible dessous).
- Contrainte au sol (lecture graphique, kPa, AV/AR) : 1096 pulvé ≈ 68/80 ; M55 charrue ≈ 58/58 ; tph100 charrue ≈ 62/67 ; chenillard ≈ 14.
- Largeur de pneu sur 1096 (lecture graphique, kPa, AV/AR) : pneu large 38 cm ≈ 80/84 ; étroit 27 cm ≈ 80/114. Schéma source : pneus larges 100 kg vs étroits 50 kg (contraintes dynamiques, grandeur non explicitée).
- Points de vigilance : fils releveurs au sol (écarteurs pour fils de pied) ; jeunes plants protégés par deux fiches solidement enfoncées devant/derrière ; éviter le travail au contact sans palpeur sur jeunes plants.

---

## 6 bis. Effeuillage

### Enquête 2015 (D-EF15 : 224 questionnaires, 2 125 ha)

- Pratique : 50 % effeuillage vendanges seul, 10 % précoce seul, 18 % les deux. Précoce généralisé chez 20–25 % des praticiens (vendange : 40 %). Précoce surtout sur 1 face (soleil levant). Choix des parcelles : sensibilité pourriture puis oïdium, rarement vigueur.
- Effeuillage vendanges : gain de rendement de cueillette « de l'ordre de 20 % ».
- Efficacité attendue du précoce 1 face : au plus 50 % sur pourriture, ≈ 25 % sur oïdium ; essai Verzy 2015 (chardonnay, grain de grenaille, taux 9 %) : ≈ 30 % en moyenne, variable selon la position dans la parcelle (gradient de surface foliaire 3,5 à 3,9 m²/cep).
- Perte de surface foliaire (Greenseeker, NDVI) : 10 à 15 % pour un précoce 1 face ; effet neutre sur la maturité, aucun échaudage observé.
- Zone effeuillée : plus chaude, moins humide, plus lumineuse (UV) — Fort Chabrol, pinot noir, 2015.
- Parc : pneumatiques 80 % (Collard 62 %, Ecojet 18 %), rouleaux 14 % (Binger 9 %, AWS Stockmayer 3 %, KMS 2 %) ; 61 % propriétaires, 39 % prestation. Collard : 5,3 h/ha en 1 rang, 2,7 h/ha en 2 rangs, ≈ 3 km/h. Encrassement : 57 % pneumatiques, 34 % rouleaux.
- Réserves des non-praticiens : intérêt limité aux vignes vigoureuses ; inutile avec enherbement permanent, travaux en vert maîtrisés et pulvérisation performante ; consommation de carburant ; grêle, échaudage ; difficulté à trouver un prestataire.

### Machines et réglages (F-EPN, F-ERO, D-EF17)

| | Pneumatiques | Rouleaux |
|---|---|---|
| Principe | Surpresseur basse pression, fort volume d'air vers des buses en rotation dans des gamelles ajourées ; double rotor = largeur de bande variable | Feuilles aspirées/happées par 1 ou 2 rouleaux ; arrachées entières (Provitis, Stockmayer) ou broyées (KMS, Binger) |
| Stade | Dès la nouaison, tant que la grappe est souple | Après basculement complet de la grappe |
| Vitesse | 3 à 5 km/h | 2,5 à 5 km/h, levier principal |
| Pression d'air | Double rotor 0,5–0,8 bar (F-EPN) ou 0,4–0,8 bar (D-EF17) ; simple rotor 0,8–1 bar | — |
| Tourniquets | Réduire (≈ 600 tr/min, F-EPN) selon constructeur | — |
| Hauteur | Simple rotor 45 ou 55 cm (longueur des buses) ; double rotor min 40 cm, max 55–60 cm (inclinaison des gamelles ; inclinaison maxi = moins de pression, moins de puissance) | Fixe, 45 cm en général, 26 cm sur certains modèles |
| Montage | Démontage de la pulvérisation ; surpresseur sur prise de force ou moteur auxiliaire ; tourniquets par moteur hydraulique ; vanne 3 voies (1 ou 2 faces) | Châssis de rogneuse, puissance ≈ rogneuse, chenillard envisageable |
| Défaut | Marquages sur grappes (jamais surinfectés, sans entrave à la croissance sauf exception) | Blessures = perte nette de portion de grappe ; conduite fine requise |

Valeurs chiffrées = retours d'expérience 2016. Calage : réglage → essai sur petite longueur → observation → correction. Cible : grappes dégagées, effeuillage modéré (plan de palissage creusé vs face non effeuillée du rang voisin). « Il n'y a pas de réglage type » : résultat variable selon année, parcelle, cépage, heure. Réglage = compromis taux d'effeuillage / blessures / débit de chantier. Stade optimal selon essais : nouaison–grenaille, « le plus tôt est le mieux ».

Adaptation d'une ancienne effeuilleuse vendange simple rotor (D-EF17, ex. Galvit, Tornado Collard) : soupape de sécurité ; bouchon sur une cannelure du rotor (sans vanne 3 voies, travail en tours morts) ; rééquilibrage ; découpe des gamelles pour placer les buses face à la partie ajourée (sinon rallonger les cannelures) ; mesurer la pression aux buses (manomètre) et la rotation des tourniquets (tachymètre).

---

## 7. Divergences, obsolescences, trous

### 7.1 Divergences entre sources

| Point | Source A | Source B | Lecture |
|---|---|---|---|
| Pression double rotor | 0,5–0,8 bar (F-EPN) | 0,4–0,8 bar (D-EF17, 2017) | D-EF17 plus récent ; les deux « indicatifs 2016 » |
| Anti-dérive sur jets portés | Inutile / contre-productif < 300 L/ha (A-LVC, A-WEB) | TVI près des personnes sensibles ou pour réduire les ZNT (F-PRE 2016) | Objectifs différents (dépôt vs contrainte réglementaire) ; à arbitrer par un expert, pas par l'outil |
| Hauteur 1er porte-jet jets portés | 20–35 cm base de l'élément (F-IDE, F-PRE) | 40–45 cm (encadré Precijet dans A-LVC) ; 30–40 cm pour « jets projetés ou portés » (A-LVC) | Référentiels non homogènes (base de l'élément vs porte-jet) |
| Vitesse d'air pneumatique en début de saison | Réduire l'air → gouttes plus grosses (A-LVC) | Tableaux de cellule fixes par stade (F-CGE, F-CGA) | Compatibles si les tableaux sont lus comme plafonds ; non explicite |
| Buses anti-dérive : jets portés vs pendillards | Pendillards : TVI = +40 à +50 % de produit reçu (A-LVC, essais début 2000 et 2010) | Jets portés : TVI = moins de couverture et plus de mildiou, d'oïdium et de botrytis à 150–180 L/ha (B20-1, B20-2) | Pas de contradiction : technologies différentes (sans air / avec air). L'outil doit rattacher toute consigne de buse à une technologie. |
| TVI en jets portés près des zones sensibles | Préconisé pour réduire les ZNT (F-PRE 2016) | Efficacité biologique insuffisante à 150–180 L/ha (B20-2, 2020) | Contrainte réglementaire contre efficacité ; arbitrage humain (§ 8) |
| Buse de référence de l'outil | ATR Blanche, mesures IFV hors corpus (C-MD) | TeeJet TXA 80005 comme référence turbulence en jets portés (B20-1) ; ATR blanche/marron pour le CG Expert (F-CGE) | ATR = pneumatique Berthoud ; TXA = jets portés. Une seule buse de référence ne couvre pas les deux technologies. |
| Effet de la vitesse | Optimum 5 km/h, ralentir = −40 % (D-IDR) | Ralentir possible sur parcelles vigoureuses / sans air (D-ENQ) | D-IDR limité à un jet porté ; ne pas généraliser |

### 7.1 bis Anomalies internes aux articles B20

Ces points sont à corriger ou à écarter avant toute reprise dans l'outil :
- **Comparaison physique à volumes différents** : Fente LD est testée à 220 L/ha, Turb et Turb AD à 150 L/ha (B20-1). L'avantage de Fente LD en zone grappes et en face inférieure ne peut donc pas être attribué à la buse seule.
- **Botrytis 2017 (B20-2, fig. 5)** : le texte compare des buses « à fente à dérive limitée » aux turbulences, alors que la légende porte TVI vs TXA (turbulence anti-dérive vs turbulence). Par ailleurs, le « deux fois plus » du texte correspond à ≈ ×1,5 en fréquence et ≈ ×1,9 en intensité (lecture graphique).
- **Oïdium 2019 (fig. 4)** : la légende indique « Fente E LD 0067 / Turb 0005 », mais la légende sous la figure parle de « turbulence antidérive en vert ». Le texte confirme qu'il s'agit d'une fente.
- **Figure 7 (B20-1)** : elle porte la même légende que la figure 3 (« banc EvaSprayViti, dépôts globaux proches »), alors qu'elle présente des mesures par face (inf/sup/moy) sur deux échelles sans unité (0–250 et 0–0,45). Données non exploitables en l'état.
- **Calibres** : la source écrit « 00050 » dans sa conclusion, contre 80005 / 0050 ailleurs ; c'est probablement une coquille.
- **Dispositif mildiou** : la source parle à la fois de blocs de Fisher et de carré latin.

### 7.2 Éléments probablement périmés (à revérifier au texte primaire avant usage)

- « Contrôle technique pour tous les appareils de plus de 5 ans » (A-WEB) : périodicité du contrôle obligatoire des pulvérisateurs → vérifier la version en vigueur (Code rural, arrêté contrôle des pulvérisateurs, Légifrance).
- Phrases de risque R36/R43 et classement Xi (D-POU) : système antérieur au règlement CLP ; délai de rentrée 48 h déduit de R43 → vérifier l'étiquette et l'arrêté délais de rentrée en vigueur.
- Homologation du soufre poudrage (« demande déposée à 25 kg/ha », 2014) → vérifier E-Phy (Anses).
- Limitation du cuivre « en passe d'être limitée à 4 kg/an » (D-EF15, 2016) → vérifier le règlement d'exécution UE applicable (EUR-Lex).
- ZNT et personnes sensibles (F-PRE) → cadre modifié depuis 2016 ; vérifier arrêté ZNT et chartes en vigueur.
- Normes EN 907 / EN 1553 citées pour le lave-mains (D-ENQ) → vérifier l'état des normes (remplacement possible par la série ISO 4254 / EN ISO 16119, non vérifié ici).
- Parts de marché, âges de parc, parts de technologies : photographie 2013–2015.
- Liens extranet CIVC et contacts nominatifs (2014–2017) : validité non vérifiée.
- Essai de régulation par impulsion à la buse annoncé en 2020 (B20-2) : aucun résultat dans le corpus. À demander au Service vigne avant toute mention.

### 7.3 Trous du corpus au regard de l'outil

- Aucune courbe débit/pression de buse (la buse de référence ATR Blanche repose sur des mesures IFV hors corpus). B20-1 renvoie aux abaques des fabricants pour la taille de gouttes en fonction de la pression et de l'angle, sans les reproduire.
- Aucun essai de buse en pneumatique ou en pendillard postérieur à 2010.
- Aucune tolérance ni périodicité d'entretien chiffrée hors : durée de vie des buses 2–5 ans (B20-1), écart débit > 10 %, filtre cabine 1 fois/an ou 500 h, filtres A2P3 ≥ 2 fois/an, cloche à air ≈ 1/3 de la pression.
- Aucune fiche réglage pour : pneumatiques autres que Berthoud/Bobard, turbines chenillard, confiné, canon oscillant.
- Travail du sol : aucune vitesse d'avancement, aucune consigne d'entretien (usure des lames, pivots), aucune légende pour l'évaluation colorée.
- Effeuillage : aucun réglage type (explicitement refusé par les sources).
- Poudreuses : aucune méthode d'étalonnage de débit décrite.

### 7.4 Contenu directement exploitable pour quiz déduits des formules

Formules présentes dans le corpus : volume/ha (600), vitesse (3,6), largeur traitée (rangs × écartement ; multiples chenillard), règle de trois sur les hauteurs de buses, écart débit > 10 %, conversion mesh ↔ maille (table). Toute autre question = contenu à statut « brouillon » tant qu'aucun valideur n'est désigné.

---

## 8. Décisions qui relèvent d'une personne

1. **Réutilisation des contenus sous CC BY-NC-ND 3.0.** Réorganiser, extraire des valeurs ou adapter des schémas dans l'outil peut constituer une « modification ». CIVC étant auteur ou coauteur, la question est interne mais les fiches sont cosignées (CA 51, Magister, GDV 51, CV-CNF).
   - À solliciter : service juridique / direction de la communication du Comité Champagne ; pour les fiches cosignées, la Chambre d'agriculture de la Marne et les autres co-auteurs.
   - Question : « L'outil de formation peut-il reprendre, reformater et combiner les valeurs et schémas des fiches du Groupe Machinisme Champenois publiées sous CC BY-NC-ND 3.0, et sous quelle mention ? »
   - Pièces : liste § 0 avec co-auteurs, captures des écrans prévus, mention de licence envisagée.
2. **Validation des valeurs 2014–2016 pour un usage en 2026** (tableaux § 3.1, pressions § 6 bis).
   - À solliciter : référent machinisme / pulvérisation du Service vigne du Comité Champagne (contacts cités dans le corpus : M. Liébart pour les matériels, M.-L. Panon pour l'effeuillage — à confirmer en poste).
   - Question : « Ces consignes (liste jointe) sont-elles toujours valides pour les matériels actuels, lesquelles faut-il retirer ou mettre à jour ? »
   - Pièces : tableau § 3.1, divergences § 7.1, capture du champ `valideur` de `OAD.CONTENU`.
3. **Consigne sur les buses anti-dérive en jets portés.** L'outil ne peut pas trancher seul entre la préconisation TVI de 2016 pour les ZNT (F-PRE) et le constat de 2020 d'une efficacité insuffisante (B20-2). Une consigne erronée diffusée aux viticulteurs serait difficile à retirer.
   - À solliciter : responsable pulvérisation du Pôle Technique & Environnement du Comité Champagne (auteurs B20 : M. Liébart, S. Debuisson, A. Descôtes — à confirmer en poste).
   - Question : « Pour un jet porté en Champagne en 2026, quelle consigne de buse l'outil doit-il afficher en zone à distance réduite et hors zone ? Quels résultats a donné l'essai de régulation par impulsion annoncé en 2020 ? »
   - Pièces : § 2.8, divergences § 7.1, anomalies § 7.1 bis, arrêté ZNT en vigueur et liste des moyens de réduction de dérive (à extraire de Légifrance et du BO Agri).
4. **Droits sur les articles B20** : aucune licence n'est indiquée. Même interlocuteur que la question 1 (communication du Comité Champagne, éditeur de la revue), en ajoutant la question des figures.
5. **Points réglementaires § 7.2** : vérification sur Légifrance / E-Phy / EUR-Lex avant toute mention dans l'outil ; à défaut, les exclure.
