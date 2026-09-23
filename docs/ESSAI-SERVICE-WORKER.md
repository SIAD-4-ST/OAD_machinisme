# Essai de cache hors ligne (service worker) — B13

**Conclusion : compatible.** Dans Chrome (bureau, Windows), servi en http,
l'outil fonctionne hors ligne après une première visite, avec un service
worker et sans modifier `support.js` ; ouvert en `file://`, rien ne change.

Cet essai **n'est pas un déploiement** (porte G3). La branche `essai-sw` n'est
jamais fusionnée (D-B13-1) ; seul ce rapport est rapporté dans `lot-b`.

## Montage

- Branche `essai-sw`, créée depuis `lot-b` (commit `92b1151`), le 23/09/2026.
- `sw.js` à la racine :
  - `install` met en cache la liste explicite des 15 fichiers (`./`,
    `index.html`, `support.js`, `moteur-oad.js`, `vendor/*`, `contenu/*`) ;
  - `fetch` sert le cache d'abord, pour les requêtes GET de la même origine
    seulement (D-B13-3) ;
  - `activate` supprime les caches d'une autre édition.
  - Nom du cache : `formation-machines-2026-09-23`. L'édition y est **recopiée
    en dur** : `moteur-oad.js` ne s'exporte pas dans un service worker (ni
    `window` ni `module`), donc `EDITION_CONTENU` n'y est pas lisible.
- `index.html`, dans `<head>` et hors du composant : enregistrement de
  `./sw.js` seulement si `location.protocol` commence par `http`, dans un
  `try/catch` (D-B13-2).
- `node tests/parite.test.js` sur `essai-sw` : **150 ok, 0 FAIL**. Le test
  statique « aucun appel réseau » reste vert : `navigator.serviceWorker.register`
  ne correspond à aucun motif interdit, et le test de protocole est écrit
  `indexOf('http') === 0`, sans « http: ».
- Serveur : `python -m http.server 8765` (Python 3.14.2) à la racine du dépôt.
- Navigateur : Chrome 154.0.8037.57, sans interface (`--headless=new`),
  profil vierge, piloté par le protocole DevTools. Le script d'essai et son
  journal brut sont sur la branche `essai-sw`, dossier `essai/`.
- Hors ligne = **serveur arrêté** (l'origine ne répond plus) **et** réseau
  coupé par `Network.emulateNetworkConditions` (équivalent de la case
  « Hors ligne » des outils de développement).

## Observations

| Étape | Observé | Erreurs de console | Verdict |
|---|---|---|---|
| (a) Première visite en ligne, `#/` | Catalogue affiché. Le service worker contrôle la page. Un cache `formation-machines-2026-09-23` de 15 entrées. Le serveur a servi les 14 fichiers de la page, puis `sw.js` et `/`. | `favicon.ico` introuvable (404), sans effet | Conforme |
| (b) Passage hors ligne | Serveur arrêté ; réseau coupé ; une requête de contrôle vers le serveur échoue. | — | Hors ligne effectif |
| (c) Rechargement | Catalogue affiché, 8 cartes de module. | Aucune | Conforme |
| (d) Parcours d'acceptation | « Volume par hectare », Q = 12 → **187 L/ha**. Quiz `quiz-volume` validé : « Score : 3 / 3 (100 %) ». Progression écrite dans `localStorage`. Après un nouveau rechargement, la page Progression affiche « Vérifier ses acquis : 3 / 3, 100 %, le 23/09/2026 ». | Aucune | Conforme |
| (e) Lien profond `#/outils/volHa`, nouvelle navigation hors ligne | Calculateur « Volume par hectare » affiché, résultat par défaut 150 L/ha. | Aucune | Conforme |
| 4. Même dossier en `file://` | Catalogue affiché ; calculateur 150 L/ha. Aucun service worker ne contrôle la page ; `getRegistrations()` est refusé (`SecurityError`) : pas d'enregistrement possible en `file://`, et le code ne le tente pas. | Blocage CORS de `fetch(location.href)` par `support.js` : comportement **antérieur** à l'essai, intercepté par le runtime (voir `docs/ARCHITECTURE.md`, chargement, point 5) | Inchangé |

Point à noter : `support.js` relit la page par `fetch(location.href)`. En http,
cette requête est servie par le cache du service worker (le fragment `#/…`
n'est pas envoyé) : c'était le point non vérifié, il fonctionne.

## Limites de l'essai

- Un seul navigateur : Chrome de bureau sous Windows, sans interface. **Non
  observé** : Safari (iOS), Chrome Android, la tablette cible, Edge.
- Mise à jour : en « cache d'abord », une nouvelle édition du contenu n'est
  prise que si `sw.js` change (nouvelle valeur d'`EDITION`). Oublier de
  changer `EDITION` dans `sw.js` laisserait les apprenants sur l'ancienne
  édition. En cas de déploiement, il faudrait dériver cette valeur
  d'`EDITION_CONTENU`, par un test statique ou par un autre mécanisme.
- Pas d'essai de première visite interrompue, de quota de stockage, ni de
  navigation privée.
- La politique de mise à jour (cache d'abord) reste révisable si la DSI en
  impose une autre (point de révision de D-B13-2).
