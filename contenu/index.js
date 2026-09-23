// Node seulement (tests). L'ordre de ce tableau est l'ordre du catalogue ;
// il doit être identique à l'ordre des <script src="contenu/…"> de <helmet>
// dans index.html (vérifié par tests/parite.test.js).
module.exports = ['pulve-reglage-volume.js', 'pulve-entretien.js', 'pulve-filtration.js',
  'pulve-remise-en-route.js', 'pulve-couverture.js', 'sol-outil-interceps.js', 'glossaire.js'].map(f => require('./' + f));
