# Provenance de `support.js`

- Copié tel quel depuis `SIAD-4-ST/OAD_renouvellement`, branche `main`,
  commit `8e9de3ff9f0b0603c264db30931e375a0dde3b35` (11/09/2026).
- SHA-256 : `e0650b109ec8f78ccc370fa27762b0c485cee4f208156a671f346e8544fc2214`
- Bannière d'origine : `// GENERATED from dc-runtime/src/*.ts — do not edit.`
  Les sources `dc-runtime/src/*.ts` ne sont PAS dans le dépôt : ce fichier est
  une boîte noire, non modifiable et non reconstructible localement.
- Dépendances réseau chargées par ce fichier au démarrage :
  `unpkg.com/react@18.3.1`, `unpkg.com/react-dom@18.3.1`,
  `unpkg.com/@babel/standalone@7.29.0`. Sans accès à unpkg, écran blanc.

`scripts/verifier_maquette.py` compare le `support.js` d'une maquette à ce
hash. Un écart signifie soit une modification interdite, soit une régénération
du runtime côté dépôt de référence : dans le second cas, recopier le nouveau
fichier ici et mettre à jour le hash, dans le même commit.

## Dans ce projet (23/09/2026)

`support.js` est utilisé sans modification. La dépendance réseau à unpkg est
levée en préchargeant React : `vendor/react.production.min.js` et
`vendor/react-dom.production.min.js` (React 18.3.1 UMD, paquets npm `react` et
`react-dom` 18.3.1, tirés le 23/09/2026). Leurs SHA-384 égalent `REACT_SRI` et
`REACT_DOM_SRI` de `support.js` : ce sont les octets que `support.js`
chargerait depuis unpkg. Babel n'est chargé que pour des `x-import` JSX, que
le projet n'utilise pas. Empreintes vérifiées par `tests/parite.test.js` §5.
