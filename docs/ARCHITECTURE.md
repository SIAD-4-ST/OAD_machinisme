# Architecture

## Couches

```
contenu/<id>.js  ──►  moteur-oad.js  ──►  index.html (<x-dc> + composant)
 (données, experts)    (logique pure)      (vue : convertit, appelle, formate)
                                      ▲
                     support.js + vendor/ (runtime figé, React 18.3.1 embarqué)
```

| Couche | Rôle | Interdits |
|---|---|---|
| `contenu/` | Un module par fichier, objet littéral dans une enveloppe qui l'expose à Node (`module.exports`) ou au navigateur (`window.OAD_CONTENU`). `contenu/index.js` fixe l'ordre du catalogue (Node). | Code, calcul. |
| `moteur-oad.js` | Vocabulaires, 11 formules, registre de 8 calculateurs (sorties brutes), schéma (`validerModule`), quiz, réducteurs de progression, registre de contenu, routes. | DOM, état, réseau, horloge, mise en forme. |
| `index.html` | Gabarit `<x-dc>`, feuille de style, composant `DCLogic` : état d'écran, persistance, conversion des saisies, mise en forme fr-FR. | Formule, seuil, règle de notation. |
| `support.js`, `vendor/` | Runtime `<x-dc>` et React. | Toute modification. |

## Chargement dans le navigateur

1. `<head>` : React, ReactDOM (`vendor/`), puis `support.js`. React étant
   présent, `support.js` ne télécharge rien ; il attend `DOMContentLoaded`.
2. Lecture du corps : les `<script>` de `<helmet>` (contenu puis moteur)
   s'exécutent une première fois, dans l'ordre.
3. Démarrage du runtime : premier rendu, `<helmet>` réinjecte ses scripts
   (le moteur est protégé par sa garde `!window.OAD` ; les modules arrivent
   deux fois dans `window.OAD_CONTENU`, `OAD.modules()` garde la première
   occurrence de chaque id).
4. Le composant attend que le moteur et autant de modules que de scripts
   `contenu/` déclarés soient présents (10 s au plus), puis rend.
5. En `file://`, la relecture de la page par `fetch(location.href)` échoue
   (erreur interceptée par le runtime) : le gabarit est celui du parseur HTML.
   D'où l'interdiction des directives dans `table`/`select`.

## Routes (hash)

| Hash | Écran |
|---|---|
| `#/` (ou vide, ou inconnu) | Catalogue, groupé par domaine |
| `#/module/<id>` | Module, première section |
| `#/module/<id>/<section>` | Module, section donnée (inconnue → première) |
| `#/outils` | Liste des calculateurs |
| `#/outils/<calcId>` | Calculateur |
| `#/progression` | Tableau de progression |

Module inconnu → écran « Module introuvable ». Le hash ne porte que des
identifiants ; `OAD.lireRoute(hash)` et `OAD.lien(...segments)` sont purs.

## Types de section

`fiche` (blocs `paragraphe`, `liste`, `alerte`, `formule`), `procedure`
(étapes à cocher, imprimable), `entretien` (tâches à cocher groupées par
périodicité, imprimable), `calculateur` (renvoie à un calculateur du moteur),
`quiz` (choix simples ou multiples, notation exacte), `cas` (situation et
options commentées).

## Calculateurs et formules ouvertes

`CALCULATEURS[id].compute(valeurs)` renvoie des nombres bruts :
`etapes[{ titre, formule, gabarit, operandes[{valeur, decimales}],
resultat{valeur, unite, decimales} }]`, `resultats`, `alertes`. La vue formate
chaque opérande en fr-FR et appelle `OAD.substituer(gabarit, textes)` pour
afficher la formule avec les valeurs. Une valeur non calculable vaut `null`
(affichée « — ») et produit une alerte.

## État du composant

`{ pret, echec, route, ordre, prog, theme, saisies, quizRep, quizScore,
casChoix }`. Seule `prog` est persistée (`formation-machines:progression:v1`) ;
le thème l'est à part (`formation-machines:theme:v1`). `marquerVue` est appelé
après rendu (`componentDidMount` / `componentDidUpdate`), quand la route
change, jamais dans `renderVals()`.
