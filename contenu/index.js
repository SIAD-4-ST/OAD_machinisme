// Node seulement (tests). L'ordre de ce tableau est l'ordre du catalogue ;
// il doit être identique à l'ordre des <script src="contenu/…"> de <helmet>
// dans index.html (vérifié par tests/parite.test.js).
module.exports = ['pulve-reglage-volume.js', 'pulve-entretien.js', 'sol-outil-interceps.js'].map(f => require('./' + f));
