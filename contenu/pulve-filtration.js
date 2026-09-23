(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-filtration',
  titre: 'Comprendre la filtration',
  domaine: 'pulverisation',
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B, B9).
  // Non relue par un valideur (porte G2) ; reprise soumise à la porte G1.
  statut: 'brouillon',
  valideur: null,
  resume: 'Du filtre d\'aspiration à la buse : lire un filtre (couleur, mesh, maille), savoir où filtrer et dans quel ordre incorporer les produits.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 15,
  sources: [
    { code: 'F-FIL', reference: 'Fiche Filtration, CIVC', date: 'février 2014' }
  ],
  sections: [
    {
      id: 'principe',
      type: 'fiche',
      titre: 'Principe',
      technologie: 'toutes',
      blocs: [
        { type: 'paragraphe', texte: 'Filtrer grossier en tête de circuit, sur une grande surface, puis de plus en plus fin jusqu\'à la buse. Le bouchage d\'une buse doit rester exceptionnel.', source: 'F-FIL' },
        { type: 'paragraphe', texte: 'Le mesh est le nombre de fils par pouce : c\'est la mesure inverse de la maille. Plus le mesh est élevé, plus la maille est fine.', source: 'F-FIL' },
        { type: 'tableau', source: 'F-FIL',
          entetes: ['Ancienne couleur', 'Couleur ISO 19732', 'Mesh', 'Maille, mm (µm)', 'Usage conseillé'],
          lignes: [
            ['Noir', 'Marron', '16', '1,1 (1 100)', 'Remplissage'],
            ['Blanc', 'Rouge', '32', '0,6 (600)', 'Remplissage, aspiration'],
            ['Bleu clair', 'Bleu foncé', '50', '0,3 (300)', 'Pression'],
            ['Gris', 'Jaune', '80', '0,18 (180)', 'Pression, rampe'],
            ['Rouge', 'Vert', '100', '0,14 (140)', 'Rampe, buse']
          ] }
      ]
    },
    {
      id: 'ou-filtrer',
      type: 'fiche',
      titre: 'Où filtrer',
      technologie: 'toutes',
      blocs: [
        { type: 'liste', source: 'F-FIL', items: [
          'Aspiration : maillage grossier (risque de cavitation) ; nettoyage à chaque remplissage.',
          'Refoulement : maille plus petite que le diamètre des buses, vanne de décompression ; nettoyage après chaque traitement.',
          'Rampe et buse : maille plus petite que le diamètre de la buse, et au plus égale à celle du filtre de pression ; facultatifs si le filtrage en amont est bon.',
          'Pièces en laiton oxydées : filtres tube ou coupole de 80 mesh au niveau des buses.'
        ] }
      ]
    },
    {
      id: 'ordre-incorporation',
      type: 'fiche',
      titre: 'Ordre d\'incorporation',
      technologie: 'toutes',
      blocs: [
        { type: 'liste', source: 'F-FIL', items: [
          'Correcteurs de dureté de l\'eau.',
          'Puis poudres.',
          'Puis liquides : SL, SC, EW, EC.',
          'Puis adjuvants.'
        ] },
        { type: 'alerte', texte: 'Lire l\'étiquette de chaque produit avant de l\'incorporer.', source: 'F-FIL' }
      ]
    },
    {
      id: 'quiz-filtration',
      type: 'quiz',
      titre: 'Vérifier ses acquis',
      questions: [
        {
          id: 'q-mesh',
          enonce: 'Que mesure le mesh d\'un filtre ?',
          choix: ['Le nombre de fils par pouce', 'Le diamètre de la maille en millimètres', 'Le débit maximal du filtre'],
          bonnes: [0],
          explication: 'Le mesh est le nombre de fils par pouce, mesure inverse de la maille.',
          source: 'F-FIL'
        },
        {
          id: 'q-plus-fin',
          enonce: 'Quel filtre a la maille la plus fine ?',
          choix: ['100 mesh', '50 mesh', '16 mesh'],
          bonnes: [0],
          explication: 'Plus le mesh est élevé, plus la maille est fine : 0,14 mm à 100 mesh, 1,1 mm à 16 mesh.',
          source: 'F-FIL'
        },
        {
          id: 'q-grossier',
          enonce: 'Où se place le filtre au maillage le plus grossier ?',
          choix: ['Au remplissage et à l\'aspiration, en tête de circuit', 'Au niveau des buses', 'Sur la rampe'],
          bonnes: [0],
          explication: 'On filtre grossier en tête de circuit, puis de plus en plus fin jusqu\'à la buse.',
          source: 'F-FIL'
        }
      ]
    }
  ]
});
