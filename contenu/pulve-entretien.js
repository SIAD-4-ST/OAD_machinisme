(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-entretien',
  titre: 'Entretenir le pulvérisateur',
  domaine: 'pulverisation',
  // Brouillon : rédaction initiale du 23/09/2026, non relue par un valideur.
  statut: 'brouillon',
  valideur: null,
  resume: 'Les gestes d\'entretien qui gardent un pulvérisateur précis et sûr, de la sortie quotidienne à l\'hivernage.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 20,
  sources: [],
  sections: [
    {
      id: 'pourquoi',
      type: 'fiche',
      titre: 'Pourquoi entretenir',
      blocs: [
        { type: 'paragraphe', texte: 'Un pulvérisateur mal entretenu dérègle le volume sans que le chauffeur s\'en aperçoive : buses usées ou bouchées, filtres encrassés, manomètre faux.' },
        { type: 'liste', items: [
          'Précision : le volume réellement épandu reste celui qui a été calculé.',
          'Sécurité : moins de fuites et de contacts avec la bouillie.',
          'Durée de vie : moins de corrosion et de pannes en pleine campagne.'
        ] },
        { type: 'alerte', texte: 'Le pulvérisateur est soumis à un contrôle technique périodique obligatoire : vérifiez l\'échéance du vôtre en début de campagne.' }
      ]
    },
    {
      id: 'plan-entretien',
      type: 'entretien',
      titre: 'Plan d\'entretien',
      taches: [
        { id: 'rincage', texte: 'Rincer la cuve et le circuit.', periodicite: 'chaque-utilisation' },
        { id: 'filtres', texte: 'Nettoyer les filtres d\'aspiration, de refoulement et de buses.', periodicite: 'chaque-utilisation' },
        { id: 'fuites', texte: 'Contrôler visuellement les fuites, raccords et flexibles.', periodicite: 'quotidienne' },
        { id: 'graissage', texte: 'Graisser les points prévus par la notice du constructeur.', periodicite: 'hebdomadaire' },
        { id: 'manometre', texte: 'Vérifier le manomètre (aiguille à zéro au repos, lecture stable).', periodicite: 'debut-campagne' },
        { id: 'debit-buses', texte: 'Mesurer le débit de chaque buse et remplacer les buses hors tolérance.', periodicite: 'debut-campagne' },
        { id: 'controle', texte: 'Vérifier l\'échéance du contrôle technique obligatoire.', periodicite: 'debut-campagne' },
        { id: 'hivernage', texte: 'Vidanger, nettoyer et protéger le circuit du gel selon la notice.', periodicite: 'fin-campagne' },
        { id: 'revision', texte: 'Faire réviser pompe, régulation et rampe.', periodicite: 'annuelle' }
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
          enonce: 'Quand nettoyer les filtres ?',
          choix: ['Après chaque utilisation', 'Une fois par campagne', 'Seulement en cas de panne'],
          bonnes: [0],
          explication: 'Un filtre encrassé fait baisser le débit dès le traitement suivant.'
        },
        {
          id: 'q-derive',
          enonce: 'Quels défauts faussent le volume épandu sans signe visible ? (plusieurs réponses)',
          choix: ['Buses usées', 'Manomètre faux', 'Peinture écaillée'],
          bonnes: [0, 1],
          explication: 'Une buse usée débite plus ; un manomètre faux fait régler une mauvaise pression.'
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
        { texte: 'J\'arrête, je coupe la pression et je remplace la buse par une buse de rechange identique.', correct: true, retour: 'Oui : la buse bouchée se nettoie ensuite à l\'eau avec une brosse souple, équipements de protection portés.' },
        { texte: 'Je termine la parcelle et je verrai après.', correct: false, retour: 'Non : le rang correspondant n\'est plus protégé et le volume est faussé.' }
      ]
    }
  ]
});
