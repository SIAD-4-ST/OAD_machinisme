# Décisions d'architecture

Registre des décisions structurantes. Une décision n'est jamais effacée :
elle est amendée par un bloc daté placé au-dessus d'elle. Le détail des
arbitrages de chaque étape est dans le *Journal d'arbitrages* du README.

> **Note du 23/09/2026.** Les prompts A1 à A3 décrivaient le portage d'une
> version antérieure (DOM vanilla, esbuild, fichier unique). Cette version
> n'existait pas dans ce dossier : l'outil a été créé directement dans son état
> cible. D1 et D5 sont donc écrites dans leur forme d'origine *supposée* par
> les prompts, suivies de leur amendement, pour garder la trace du choix.

---

> ⚠️ **Modifié le 23/09/2026 — portage x-dc (A3).** L'interface utilise
> React 18.3.1 embarqué (`vendor/`) et le runtime `<x-dc>` figé (`support.js`)
> de la stack OAD Renouvellement, plus de DOM vanilla. Voir README, *Journal
> d'arbitrages — portage x-dc, A3*.

## D1 — Pile technique de l'interface

Interface en JavaScript sans framework (DOM vanilla), pour limiter les
dépendances d'un outil utilisé hors réseau.

## D2 — Contenu séparé du code

Chaque module de formation est un fichier de données (`contenu/<id>.js`),
rédigeable par un expert sans toucher au code. Le moteur le lit par
`OAD.modules()`, au moment de l'appel. Confirmée en A1 (D-A1-2).

## D3 — Moteur pur et testé

Toute formule, tout seuil, toute règle de notation ou de progression vit dans
`moteur-oad.js`, sans DOM, état, réseau, horloge ni mise en forme ; testée par
`node tests/parite.test.js`, sans dépendance.

## D4 — Aucune donnée ne sort de l'appareil

Progression dans `localStorage` seulement ; aucun appel réseau ; le hash de
l'URL ne porte que des identifiants.

---

> ⚠️ **Modifié le 23/09/2026 — portage x-dc (A3).** La distribution est le
> dossier du dépôt, ouvert par `index.html` ; plus de fichier unique ni
> d'étape d'assemblage (ce serait un build). Révisable après la recette
> tablette. Voir README, *Journal d'arbitrages — portage x-dc, A3* (D-A3-4).

## D5 — Distribution hors ligne

L'outil est distribué en un fichier HTML unique, produit par un build, qui
s'ouvre sans réseau.
