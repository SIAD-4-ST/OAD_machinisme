(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-reglage-volume',
  titre: 'Régler le volume par hectare',
  domaine: 'pulverisation',
  // Brouillon : rédaction initiale du 23/09/2026, non relue par un valideur.
  statut: 'brouillon',
  valideur: null,
  resume: 'Mesurer la vitesse réelle et le débit des buses, puis calculer et ajuster le volume de bouillie épandu.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 30,
  sources: [],
  sections: [
    {
      id: 'principes',
      type: 'fiche',
      titre: 'Trois grandeurs font le volume',
      blocs: [
        { type: 'paragraphe', texte: 'Le volume épandu par hectare dépend de trois grandeurs mesurables : le débit total des buses ouvertes, la vitesse réelle d\'avancement et la largeur traitée.' },
        { type: 'formule', texte: 'V (L/ha) = 600 × Q (L/min) / (v (km/h) × L (m))' },
        { type: 'liste', items: [
          'Plus la vitesse augmente, plus le volume diminue, à débit égal.',
          'La largeur traitée est celle réellement couverte par passage, pas la largeur de la machine.',
          'Le débit se mesure buse par buse, à la pression de travail, avec de l\'eau claire.'
        ] },
        { type: 'alerte', texte: 'Le compteur de vitesse du tracteur peut s\'écarter de la vitesse réelle : mesurez-la sur la parcelle avant tout calcul.' }
      ]
    },
    {
      id: 'mesure-vitesse',
      type: 'procedure',
      titre: 'Mesurer la vitesse réelle',
      intro: 'À faire sur une parcelle représentative, cuve à moitié pleine, dans le rapport de boîte et au régime utilisés pour traiter.',
      etapes: [
        { id: 'baliser', texte: 'Baliser une distance connue dans le rang (par exemple 100 m).' },
        { id: 'elan', texte: 'Prendre de l\'élan avant le premier repère pour passer à vitesse stabilisée.' },
        { id: 'chrono', texte: 'Chronométrer le passage entre les deux repères.' },
        { id: 'retour', texte: 'Refaire la mesure dans l\'autre sens et retenir la moyenne des deux temps.', detail: 'La pente et l\'état du sol peuvent faire varier la vitesse d\'un sens à l\'autre.' },
        { id: 'calcul', texte: 'Calculer la vitesse avec le calculateur « Vitesse réelle mesurée ».' }
      ]
    },
    {
      id: 'calc-vitesse',
      type: 'calculateur',
      titre: 'Calculer la vitesse réelle',
      calculateur: 'vitesseMesuree'
    },
    {
      id: 'mesure-debit',
      type: 'procedure',
      titre: 'Mesurer le débit des buses',
      intro: 'Pulvérisateur rempli d\'eau claire, à l\'arrêt, pression réglée à la valeur de travail.',
      etapes: [
        { id: 'epi', texte: 'Porter les équipements de protection prévus pour le rinçage et la manipulation du pulvérisateur.' },
        { id: 'pression', texte: 'Mettre en pression et vérifier la lecture du manomètre.' },
        { id: 'collecte', texte: 'Recueillir chaque buse pendant une minute dans un récipient gradué.' },
        { id: 'noter', texte: 'Noter le débit de chaque buse et en faire la somme : c\'est le débit total Q.' },
        { id: 'comparer', texte: 'Comparer chaque buse aux données du fabricant et remplacer celles qui s\'en écartent au-delà de la tolérance indiquée.', detail: 'Remplacer une buse usée par une buse identique (même calibre, même matériau).' }
      ]
    },
    {
      id: 'calc-volume',
      type: 'calculateur',
      titre: 'Calculer le volume par hectare',
      calculateur: 'volHa'
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
          explication: 'La vitesse est au dénominateur : plus on avance vite, moins on dépose de bouillie par hectare.'
        },
        {
          id: 'q-mesures',
          enonce: 'Quelles grandeurs faut-il mesurer pour calculer le volume par hectare ? (plusieurs réponses)',
          choix: ['Le débit total des buses', 'La vitesse réelle', 'La largeur traitée', 'La contenance de la cuve'],
          bonnes: [0, 1, 2],
          explication: 'La contenance de la cuve sert à l\'autonomie, pas au volume par hectare.'
        },
        {
          id: 'q-pression',
          enonce: 'Pour augmenter nettement le volume, que vaut-il mieux faire en premier lieu ?',
          choix: ['Doubler la pression', 'Revoir le calibre des buses ou la vitesse'],
          bonnes: [1],
          explication: 'Le débit ne croît que comme une puissance de la pression (racine carrée pour une buse hydraulique courante) : une forte hausse de volume exige une pression bien plus forte, qui modifie aussi la pulvérisation.'
        }
      ]
    },
    {
      id: 'cas-vitesse',
      type: 'cas',
      titre: 'Cas pratique : changement de rapport',
      situation: 'Vous traitiez à 6 km/h pour 150 L/ha. Vous passez à 7 km/h sans rien changer d\'autre. Que se passe-t-il ?',
      options: [
        { texte: 'Le volume reste à 150 L/ha.', correct: false, retour: 'Non : à débit constant, le volume varie en sens inverse de la vitesse.' },
        { texte: 'Le volume baisse, vers 129 L/ha.', correct: true, retour: 'Oui : 150 × 6 / 7 ≈ 129 L/ha. Il faut recalculer le débit par buse pour revenir au volume visé.' },
        { texte: 'Le volume monte, vers 175 L/ha.', correct: false, retour: 'Non : ce serait le cas si la vitesse baissait.' }
      ]
    }
  ]
});
