(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-reglage-volume',
  titre: 'Régler le volume par hectare',
  domaine: 'pulverisation',
  // Brouillon : rédaction initiale du 23/09/2026, corrigée le 23/09/2026 sur
  // la synthèse du corpus (lot B, B7). Non relue par un valideur (porte G2) ;
  // reprise des valeurs soumise à la porte G1.
  statut: 'brouillon',
  valideur: null,
  resume: 'Mesurer la vitesse réelle et le débit de l\'appareil, contrôler chaque diffuseur, puis calculer et ajuster le volume de bouillie épandu.',
  public: 'Chauffeurs et chefs de culture',
  // Réévaluée en proportion du nombre de sections (9 → 16).
  dureeMin: 50,
  sources: [
    { code: 'F-VHA', reference: 'Fiche Volume/hectare, CIVC', date: 'février 2014' },
    { code: 'A-LVC', reference: 'Article du Vigneron Champenois, M.-P. Vacavant', date: 'avril 2014' },
    { code: 'B20-1', reference: 'Choisir la bonne buse, partie 1, Le Vigneron Champenois (M. Liébart, S. Debuisson, A. Descôtes)', date: 'avril 2020', page: '26–38' },
    { code: 'F-PRE', reference: 'Fiche de réglage Tecnoma Precijet, Comité Champagne', date: 'mai 2016' }
  ],
  sections: [
    {
      id: 'principes',
      type: 'fiche',
      titre: 'Trois grandeurs font le volume',
      blocs: [
        { type: 'paragraphe', texte: 'Le volume épandu par hectare dépend de trois grandeurs mesurables : le débit total de l\'appareil, la vitesse réelle d\'avancement et la largeur traitée.' },
        { type: 'formule', texte: 'Volume/ha (L) = Débit total (L/min) × 600 / [Vitesse (km/h) × Largeur traitée (m)]', source: 'F-VHA' },
        { type: 'liste', source: 'F-VHA', items: [
          'À débit égal, plus la vitesse augmente, plus le volume par hectare diminue.',
          'Enjambeur : largeur traitée = nombre de rangs traités × écartement (exemple : 7 × 1,10 m = 7,7 m).',
          'Turbine sur chenillard : 1, 2 ou 3 fois l\'écartement, selon que l\'on passe toutes les routes, toutes les 2 ou toutes les 3 routes.'
        ] },
        { type: 'paragraphe', texte: 'Pourquoi le volume mesuré s\'écarte du volume théorique :' },
        { type: 'liste', source: 'F-VHA', items: [
          'Surface pulvérisée différente de la surface plantée : tronçons, coupures, pointes, chemins.',
          'Volume embarqué mal connu (épalage de la cuve).',
          'Débit réel différent du débit estimé : buses ou pastilles usées, filtres bouchés, fuites, densité du produit, manomètre ou débitmètre défaillant, pompe irrégulière.',
          'Vitesse fausse : capteurs, entrées et sorties de rang.',
          'Écartements hétérogènes.'
        ] },
        { type: 'alerte', texte: 'Une vitesse fausse fausse le volume : mesurez la vitesse réelle avant tout calcul.', source: 'F-VHA' }
      ]
    },
    {
      id: 'calc-largeur',
      type: 'calculateur',
      titre: 'Calculer la largeur traitée',
      calculateur: 'largeurTraitee'
    },
    {
      id: 'mesure-vitesse',
      type: 'procedure',
      titre: 'Mesurer la vitesse réelle',
      intro: 'Mesure « départ lancé » sur une distance balisée.',
      source: 'F-VHA',
      etapes: [
        { id: 'baliser', texte: 'Baliser 50 m entre deux jalons.', source: 'F-VHA' },
        { id: 'elan', texte: 'Partir lancé : passer le premier jalon déjà à la vitesse de travail.', source: 'F-VHA' },
        { id: 'chrono', texte: 'Chronométrer le passage entre les deux jalons.', source: 'F-VHA' },
        { id: 'calcul', texte: 'Calculer la vitesse : distance (m) × 3,6 / temps (s), ou avec le calculateur « Vitesse réelle mesurée ».', source: 'F-VHA' }
      ]
    },
    {
      id: 'table-vitesse',
      type: 'fiche',
      titre: 'Table des temps et des vitesses',
      blocs: [
        { type: 'paragraphe', texte: 'Vitesse correspondant au temps mis pour parcourir 50 m.', source: 'F-VHA' },
        { type: 'tableau', source: 'F-VHA',
          entetes: ['Temps sur 50 m', 'Vitesse (km/h)'],
          lignes: [
            ['27,5 s', '6,5'], ['30 s', '6'], ['32,5 s', '5,5'], ['35 s', '5,1'],
            ['37 s', '4,8'], ['40 s', '4,5'], ['45 s', '4'], ['60 s', '3']
          ] }
      ]
    },
    {
      id: 'calc-vitesse',
      type: 'calculateur',
      titre: 'Calculer la vitesse réelle',
      calculateur: 'vitesseMesuree'
    },
    {
      id: 'exo-vitesse',
      type: 'exercice',
      titre: 'Exercice : calculer une vitesse',
      enonce: 'Vous parcourez les 50 m entre les deux jalons en 35 s. Quelle est votre vitesse, en km/h, arrondie au dixième ?',
      calculateur: 'vitesseMesuree',
      valeurs: { d: 50, t: 35 },
      resultat: 0,
      source: 'F-VHA'
    },
    {
      id: 'mesure-debit',
      type: 'procedure',
      titre: 'Mesurer le débit total au niveau de la cuve',
      intro: 'Le débit total de l\'appareil se mesure par le volume qu\'il faut remettre dans la cuve après une durée de pulvérisation connue.',
      etapes: [
        { id: 'epi', texte: 'Porter les équipements de protection prévus pour la manipulation du pulvérisateur.' },
        { id: 'circuit', texte: 'Remplir le circuit et pulvériser quelques secondes.', source: 'F-VHA' },
        { id: 'ras-bord', texte: 'Remplir la ou les cuves à ras bord.', source: 'F-VHA' },
        { id: 'pulveriser', texte: 'Pulvériser pendant 2 min (jets projetés, pendillards) ou 5 min (pneumatiques, jets portés).', source: 'F-VHA' },
        { id: 'niveau', texte: 'Refaire le niveau en mesurant le volume ajouté.', source: 'F-VHA' },
        { id: 'diviser', texte: 'Diviser ce volume par la durée (2 ou 5 min) : c\'est le débit total, en L/min.', source: 'F-VHA' }
      ]
    },
    {
      id: 'calc-debit-cuve',
      type: 'calculateur',
      titre: 'Calculer le débit total',
      calculateur: 'debitCuve'
    },
    {
      id: 'controle-diffuseurs',
      type: 'procedure',
      titre: 'Contrôler chaque diffuseur',
      etapes: [
        { id: 'mesurer', texte: 'Mesurer le débit de chaque diffuseur.', source: 'F-VHA' },
        { id: 'ecart', texte: 'Calculer l\'écart de chaque diffuseur à la moyenne, avec le calculateur « Écart entre diffuseurs ».', source: 'F-VHA' },
        { id: 'intervenir', texte: 'Au-delà de 10 % d\'écart à la moyenne, intervenir : nettoyage, changement de buse ou de pastille, vérification des anti-gouttes.', source: 'F-VHA' },
        { id: 'buse-neuve', texte: 'Une buse usée débite plus : comparer son débit à celui d\'une buse neuve de même type et de même taille.', source: 'B20-1' }
      ]
    },
    {
      id: 'calc-ecart',
      type: 'calculateur',
      titre: 'Calculer l\'écart entre diffuseurs',
      calculateur: 'ecartDiffuseurs'
    },
    {
      id: 'calc-volume',
      type: 'calculateur',
      titre: 'Calculer le volume par hectare',
      calculateur: 'volHa'
    },
    {
      id: 'exo-volume',
      type: 'exercice',
      titre: 'Exercice : calculer un volume par hectare',
      enonce: 'Le débit total mesuré au niveau de la cuve est de 9,6 L/min. Vous traitez à 5 km/h avec un enjambeur qui traite 7 rangs à 1,10 m, soit 7,7 m. Quel volume épandez-vous par hectare, en L/ha, arrondi à l\'unité ?',
      calculateur: 'volHa',
      valeurs: { Q: 9.6, v: 5, L: 7.7 },
      resultat: 0,
      source: 'F-VHA'
    },
    {
      id: 'calc-debit-buse',
      type: 'calculateur',
      titre: 'Viser un volume : débit par buse',
      calculateur: 'debitBuse'
    },
    {
      id: 'calc-pression',
      type: 'calculateur',
      titre: 'Ajuster le volume par la pression',
      calculateur: 'pressionPourVolume'
    },
    {
      id: 'quiz-volume',
      type: 'quiz',
      titre: 'Vérifier ses acquis',
      questions: [
        {
          id: 'q-vitesse',
          enonce: 'À débit égal, que devient le volume par hectare si la vitesse augmente ?',
          choix: ['Il augmente', 'Il diminue', 'Il ne change pas'],
          bonnes: [1],
          explication: 'La vitesse est au dénominateur : plus on avance vite, moins on dépose de bouillie par hectare.',
          source: 'F-VHA'
        },
        {
          id: 'q-mesures',
          enonce: 'Quelles grandeurs faut-il mesurer pour calculer le volume par hectare ? (plusieurs réponses)',
          choix: ['Le débit total de l\'appareil', 'La vitesse réelle', 'La largeur traitée', 'La contenance de la cuve'],
          bonnes: [0, 1, 2],
          explication: 'La contenance de la cuve sert à l\'autonomie, pas au volume par hectare.',
          source: 'F-VHA'
        },
        {
          id: 'q-pression',
          enonce: 'Pour augmenter nettement le volume, que vaut-il mieux faire en premier lieu ?',
          choix: ['Doubler la pression', 'Revoir le calibre des buses ou la vitesse'],
          bonnes: [1],
          explication: 'Augmenter le volume par la pression affine les gouttes, et les gouttes fines sont sensibles à la dérive. Hors de la plage de pression recommandée, l\'angle du cône et la taille des gouttes se dégradent : il faut le bon calibre à la bonne pression.',
          source: 'B20-1'
        }
      ]
    },
    {
      id: 'cas-vitesse',
      type: 'cas',
      titre: 'Cas pratique : changement de rapport',
      situation: 'Vous traitiez à 6 km/h pour 150 L/ha. Vous passez à 7 km/h sans rien changer d\'autre. Que se passe-t-il ?',
      // Les nombres des options sont recalculés par les tests (CAS_CHIFFRES).
      source: 'F-VHA',
      options: [
        { texte: 'Le volume reste à 150 L/ha.', correct: false, retour: 'Non : à débit constant, le volume varie en sens inverse de la vitesse.', source: 'F-VHA' },
        { texte: 'Le volume baisse, vers 129 L/ha.', correct: true, retour: 'Oui : 150 × 6 / 7 ≈ 129 L/ha. Il faut recalculer le débit par buse pour revenir au volume visé.', source: 'F-VHA' },
        { texte: 'Le volume monte, vers 175 L/ha.', correct: false, retour: 'Non : ce serait le cas si la vitesse baissait.', source: 'F-VHA' }
      ]
    }
  ]
});
