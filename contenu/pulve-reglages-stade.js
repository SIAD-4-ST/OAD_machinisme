(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-reglages-stade',
  titre: 'Comprendre les réglages selon le stade',
  domaine: 'pulverisation',
  // NE PAS FUSIONNER DANS main avant la réponse du référent sur la validité
  // 2026 de ces valeurs (porte G2), ni avant la levée de la porte G1.
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B,
  // B12). Exercices de raisonnement : aucune table de réglage consultable,
  // aucune bonne réponse qui soit un chiffre à retenir (arbitrage A2).
  statut: 'brouillon',
  valideur: null,
  resume: 'Pourquoi un réglage change entre le début et la pleine végétation : couverture, pénétration, flux opposés. Valeurs citées des fiches de réglage 2014–2016.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 15,
  sources: [
    { code: 'F-CGE', reference: 'Fiche de réglage Berthoud CG Expert, CIVC', date: 'avril 2016' },
    { code: 'F-CGA', reference: 'Fiche de réglage Berthoud CG Airmist, Magister – CIVC', date: 'avril 2016' },
    { code: 'F-JET', reference: 'Fiche de réglage Bobard Jet 5000/6000, GDV 51 – CIVC', date: 'avril 2016' },
    { code: 'F-PRE', reference: 'Fiche de réglage Tecnoma Precijet, Comité Champagne', date: 'mai 2016' },
    { code: 'F-IDE', reference: 'Fiche de réglage Idéal jets portés, CIVC – Magister', date: 'mai 2014' },
    { code: 'A-LVC', reference: 'Article du Vigneron Champenois, M.-P. Vacavant', date: 'avril 2014' }
  ],
  sections: [
    {
      id: 'quiz-stade-pneumatique',
      type: 'quiz',
      titre: 'Pneumatiques : pourquoi le réglage change',
      technologie: 'pneumatique',
      questions: [
        {
          id: 'q-cellule',
          enonce: 'La fiche CG Expert (CIVC, 2016) fait passer la cellule Speedair de 3 300 à 3 600 tr/min en 7 rangs, entre le début et la pleine végétation. Pourquoi augmenter la vitesse d\'air quand la végétation se développe ?',
          choix: ['Pour que l\'air porte les gouttes à travers un feuillage plus épais', 'Pour réduire le volume par hectare', 'Pour moins user la cellule'],
          bonnes: [0],
          explication: 'Principe de pénétration : plus la végétation est développée, plus il faut d\'air pour porter les gouttes jusqu\'au cœur du feuillage. La fiche donne ses vitesses de cellule « à titre indicatif ».',
          source: 'F-CGE'
        },
        {
          id: 'q-diffuseur-haut',
          enonce: 'En début de végétation, les fiches CG Airmist (Magister – CIVC, 2016) et Jet 5000/6000 (GDV 51 – CIVC, 2016) font couper le diffuseur du haut. Pourquoi ?',
          choix: ['Parce qu\'il n\'y a pas encore de végétation à sa hauteur', 'Pour augmenter la pression dans les autres diffuseurs', 'Parce que le diffuseur du haut s\'use plus vite'],
          bonnes: [0],
          explication: 'Principe de couverture : on pulvérise là où se trouve la végétation. Au même stade, les fiches font aussi baisser la rampe au maximum et orienter le diffuseur du bas vers la végétation.',
          source: 'F-CGA'
        }
      ]
    },
    {
      id: 'cas-flux-opposes',
      type: 'cas',
      titre: 'Cas pratique : des mains qui se font face',
      technologie: 'pneumatique',
      situation: 'Début de végétation, pneumatique face par face. La fiche Jet 5000/6000 (GDV 51 – CIVC, 2016) oriente les mains d\'environ 10° par rapport au rang, et les fiches demandent que les mains de deux descentes ne se fassent pas face. Pourquoi ?',
      source: 'F-JET',
      options: [
        { texte: 'Pour que les flux d\'air des deux côtés ne s\'opposent pas au milieu du rang.', correct: true, retour: 'Oui : deux flux qui se font face se contrarient ; une légère orientation vers l\'avant ou vers l\'arrière évite de les opposer.', source: 'A-LVC' },
        { texte: 'Pour pouvoir avancer plus vite.', correct: false, retour: 'Non : l\'orientation ne change pas la vitesse d\'avancement ; elle agit sur la rencontre des flux dans la végétation.' },
        { texte: 'Pour consommer moins de bouillie.', correct: false, retour: 'Non : l\'orientation ne change pas le débit ; elle évite que les flux d\'air s\'opposent.' }
      ]
    },
    {
      id: 'quiz-stade-jets-portes',
      type: 'quiz',
      titre: 'Jets portés : pourquoi le réglage change',
      technologie: 'jets-portes',
      questions: [
        {
          id: 'q-hauteurs-stade',
          enonce: 'Les fiches Precijet (Comité Champagne, 2016) et Idéal (CIVC – Magister, 2014) utilisent 2 hauteurs de buses en début de végétation et 3 en pleine végétation. Pourquoi ajouter une hauteur ?',
          choix: ['Pour couvrir une haie foliaire devenue plus haute', 'Pour augmenter la pression aux buses', 'Pour réduire la taille des gouttes'],
          bonnes: [0],
          explication: 'Principe de couverture : le nombre de hauteurs de buses suit la hauteur de la végétation. À débit égal par buse, ajouter une hauteur augmente aussi le volume par hectare (calculateur « Volume selon le nombre de hauteurs de buses »).',
          source: 'F-PRE'
        },
        {
          id: 'q-remonter-rampe',
          enonce: 'En fin de saison, grappes fermées et rognage au-dessus de 1,30 m, la fiche Idéal jets portés (CIVC – Magister, 2014) fait remonter la rampe de 10 cm. Pourquoi ?',
          choix: ['Pour placer les buses face à une végétation rognée plus haut', 'Pour pouvoir rouler plus vite', 'Pour réduire le volume par hectare'],
          bonnes: [0],
          explication: 'Principe de couverture : la position de la rampe suit la végétation à traiter. La fiche Precijet (2016) donne la même consigne, sans la condition de hauteur de rognage.',
          source: 'F-IDE'
        }
      ]
    },
    {
      id: 'cas-decaler-descentes',
      type: 'cas',
      titre: 'Cas pratique : décaler les descentes',
      technologie: 'jets-portes',
      situation: 'Début de végétation, jets portés. Les fiches Precijet (Comité Champagne, 2016) et Idéal (CIVC – Magister, 2014) font décaler les descentes : une vers l\'avant, la suivante vers l\'arrière. Pourquoi ?',
      source: 'F-PRE',
      options: [
        { texte: 'Pour que les jets de deux descentes qui se font face ne s\'opposent pas.', correct: true, retour: 'Oui : décaler les descentes évite que deux flux se contrarient au milieu du rang.' },
        { texte: 'Pour gagner de la largeur traitée.', correct: false, retour: 'Non : la largeur traitée dépend du nombre de rangs traités et de l\'écartement.' },
        { texte: 'Pour faciliter le demi-tour en bout de rang.', correct: false, retour: 'Non : il s\'agit de la rencontre des flux dans la végétation.' }
      ]
    }
  ]
});
