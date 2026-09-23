(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-entretien',
  titre: 'Entretenir le pulvérisateur',
  domaine: 'pulverisation',
  // Brouillon : rédaction initiale du 23/09/2026, corrigée le 23/09/2026 sur
  // la synthèse du corpus (lot B, B7). Non relue par un valideur (porte G2) ;
  // consignes de sécurité à relire avant publication.
  statut: 'brouillon',
  valideur: null,
  resume: 'Les gestes d\'entretien qui gardent un pulvérisateur précis et sûr, du remplissage à l\'hivernage.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 20,
  sources: [
    { code: 'F-VHA', reference: 'Fiche Volume/hectare, CIVC', date: 'février 2014' },
    { code: 'F-FIL', reference: 'Fiche Filtration, CIVC', date: 'février 2014' },
    { code: 'A-WEB', reference: 'Article web du Vigneron Champenois (M. Liébart, M.-P. Tréfouël-Vacavant), mis à jour après 2022', date: '05/04/2014' },
    { code: 'B20-1', reference: 'Choisir la bonne buse, partie 1, Le Vigneron Champenois (M. Liébart, S. Debuisson, A. Descôtes)', date: 'avril 2020', page: '26–38' }
  ],
  sections: [
    {
      id: 'pourquoi',
      type: 'fiche',
      titre: 'Pourquoi entretenir',
      blocs: [
        { type: 'paragraphe', texte: 'Un pulvérisateur mal entretenu dérègle le volume sans que le chauffeur s\'en aperçoive : buses ou pastilles usées, filtres bouchés, fuites, manomètre ou débitmètre défaillant.', source: 'F-VHA' },
        { type: 'liste', source: 'B20-1', items: [
          'Une buse usée débite plus, puis sa distribution se dégrade : il faut donc contrôler régulièrement les débits.',
          'Durée de vie d\'une buse : 2 à 5 ans en moyenne, selon le produit, la pression et la fréquence d\'utilisation.',
          'Nettoyer une buse sans instrument abrasif : brosse à poils souples ou nettoyeur à ultrasons.'
        ] },
        { type: 'paragraphe', texte: 'Graisser les points et à la fréquence prévus par la notice du constructeur.' },
        { type: 'alerte', texte: 'Le pulvérisateur est soumis à un contrôle technique périodique obligatoire : vérifiez l\'échéance du vôtre selon la réglementation en vigueur.' }
      ]
    },
    {
      id: 'plan-entretien',
      type: 'entretien',
      titre: 'Plan d\'entretien',
      taches: [
        { id: 'rincage', texte: 'Rincer la cuve et le circuit.', periodicite: 'chaque-utilisation' },
        { id: 'filtre-aspiration', texte: 'Nettoyer le filtre d\'aspiration.', periodicite: 'chaque-utilisation', detail: 'à chaque remplissage', source: 'F-FIL' },
        { id: 'filtre-refoulement', texte: 'Nettoyer le filtre de refoulement.', periodicite: 'chaque-utilisation', detail: 'après chaque traitement', source: 'F-FIL' },
        { id: 'filtres-masque', texte: 'Renouveler les filtres A2P3 du masque.', periodicite: 'semestrielle', source: 'A-WEB' },
        { id: 'debits-fuites', texte: 'Cuve remplie d\'eau claire, pulvérisation enclenchée : contrôler tous les débits (buse défectueuse, caillot) et traquer les fuites (cuves, tuyaux).', periodicite: 'debut-campagne', source: 'A-WEB' },
        { id: 'manometre', texte: 'Vérifier le manomètre et le débitmètre.', periodicite: 'debut-campagne', source: 'F-VHA' },
        { id: 'controle', texte: 'Vérifier l\'échéance du contrôle technique obligatoire.', periodicite: 'debut-campagne' },
        { id: 'hivernage', texte: 'Vidanger, nettoyer et protéger le circuit du gel selon la notice.', periodicite: 'fin-campagne' },
        { id: 'filtre-cabine', texte: 'Remplacer le filtre de la cabine du tracteur.', periodicite: 'annuelle', detail: 'ou toutes les 500 h', source: 'A-WEB' }
      ]
    },
    {
      id: 'rincage-fin-traitement',
      type: 'procedure',
      titre: 'Rincer en fin de traitement',
      intro: 'Les effluents de fond de cuve relèvent d\'une réglementation spécifique : suivre les conditions en vigueur et les consignes de l\'exploitation.',
      etapes: [
        { id: 'epi', texte: 'Garder les équipements de protection portés pendant le traitement.' },
        { id: 'diluer', texte: 'Diluer le fond de cuve avec l\'eau claire de la cuve de rinçage.' },
        { id: 'epandre', texte: 'Épandre la dilution sur la parcelle qui vient d\'être traitée, dans les conditions autorisées.' },
        { id: 'circuit', texte: 'Rincer le circuit et la rampe jusqu\'aux buses.' },
        { id: 'exterieur', texte: 'Nettoyer l\'extérieur de la machine sur une aire adaptée.' }
      ]
    },
    {
      id: 'quiz-entretien',
      type: 'quiz',
      titre: 'Vérifier ses acquis',
      questions: [
        {
          id: 'q-filtres',
          enonce: 'Quand nettoyer les filtres d\'aspiration et de refoulement ?',
          choix: ['À chaque remplissage et après chaque traitement', 'Une fois par campagne', 'Seulement en cas de panne'],
          bonnes: [0],
          explication: 'Le filtre d\'aspiration se nettoie à chaque remplissage, celui de refoulement après chaque traitement : le bouchage d\'une buse doit rester exceptionnel.',
          source: 'F-FIL'
        },
        {
          id: 'q-derive',
          enonce: 'Quels défauts faussent le volume épandu sans signe visible ? (plusieurs réponses)',
          choix: ['Buses usées', 'Manomètre faux', 'Peinture écaillée'],
          bonnes: [0, 1],
          explication: 'Une buse usée débite plus ; un manomètre défaillant fait régler une mauvaise pression.',
          source: 'F-VHA'
        }
      ]
    },
    {
      id: 'cas-buse',
      type: 'cas',
      titre: 'Cas pratique : une buse bouchée',
      situation: 'Pendant un traitement, vous constatez qu\'une buse ne pulvérise plus. Que faites-vous ?',
      options: [
        { texte: 'Je souffle dans la buse pour la déboucher.', correct: false, retour: 'Jamais : risque de contact direct avec la bouillie par la bouche.' },
        { texte: 'J\'arrête, je coupe la pression et je remplace la buse par une buse de rechange identique.', correct: true, retour: 'Oui : la buse bouchée se nettoie ensuite sans instrument abrasif, à la brosse à poils souples, équipements de protection portés.', source: 'B20-1' },
        { texte: 'Je termine la parcelle et je verrai après.', correct: false, retour: 'Non : le rang correspondant n\'est plus protégé et le volume est faussé.' }
      ]
    }
  ]
});
