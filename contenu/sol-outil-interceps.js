(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'sol-outil-interceps',
  titre: 'Régler et entretenir un outil interceps',
  domaine: 'travail-du-sol',
  // Brouillon : rédaction initiale du 23/09/2026, non relue par un valideur.
  statut: 'brouillon',
  valideur: null,
  resume: 'Choisir le bon réglage de l\'outil interceps, estimer le débit de chantier et suivre son entretien.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 25,
  sources: [],
  sections: [
    {
      id: 'types-outils',
      type: 'fiche',
      titre: 'Les familles d\'outils interceps',
      blocs: [
        { type: 'paragraphe', texte: 'Les outils interceps travaillent le rang, entre les ceps, là où l\'outil d\'interrang ne passe pas. Ils s\'effacent au contact du cep grâce à un palpeur ou à leur conception.' },
        { type: 'liste', items: [
          'Lames (décavaillonneuses) : travail en profondeur, effacement par palpeur.',
          'Disques : buttage ou débuttage du rang.',
          'Outils rotatifs ou à doigts : travail superficiel, sans palpeur.',
          'Fils ou brosses : entretien de l\'herbe, sans travail du sol.'
        ] },
        { type: 'alerte', texte: 'Un palpeur trop peu sensible blesse les ceps ; trop sensible, il laisse de l\'herbe au pied. Réglez-le sur la parcelle, à la vitesse de travail.' }
      ]
    },
    {
      id: 'reglage-interceps',
      type: 'procedure',
      titre: 'Régler l\'outil en début de chantier',
      etapes: [
        { id: 'aplomb', texte: 'Mettre l\'outil d\'aplomb et régler la hauteur de travail sur sol plat.' },
        { id: 'profondeur', texte: 'Régler la profondeur de travail selon l\'état du sol et l\'objectif.' },
        { id: 'palpeur', texte: 'Régler la sensibilité du palpeur, puis vérifier l\'effacement sur quelques ceps.' },
        { id: 'vitesse', texte: 'Mesurer la vitesse réelle et vérifier que l\'outil suit le rang sans à-coups.' },
        { id: 'controle', texte: 'Contrôler le travail et l\'absence de blessure des ceps après 50 m, puis corriger.' }
      ]
    },
    {
      id: 'calc-vitesse-sol',
      type: 'calculateur',
      titre: 'Calculer la vitesse réelle',
      calculateur: 'vitesseMesuree'
    },
    {
      id: 'calc-debit-chantier',
      type: 'calculateur',
      titre: 'Estimer le débit de chantier',
      calculateur: 'debitChantier'
    },
    {
      id: 'entretien-interceps',
      type: 'entretien',
      titre: 'Entretien de l\'outil',
      taches: [
        { id: 'nettoyage', texte: 'Nettoyer l\'outil (terre, herbe enroulée).', periodicite: 'chaque-utilisation' },
        { id: 'usure', texte: 'Contrôler l\'usure et le serrage des lames, disques ou doigts.', periodicite: 'quotidienne' },
        { id: 'hydraulique', texte: 'Vérifier flexibles et raccords hydrauliques.', periodicite: 'quotidienne' },
        { id: 'graissage', texte: 'Graisser les articulations prévues par la notice.', periodicite: 'hebdomadaire' },
        { id: 'remisage', texte: 'Nettoyer, graisser et protéger avant remisage.', periodicite: 'fin-campagne' }
      ]
    },
    {
      id: 'quiz-interceps',
      type: 'quiz',
      titre: 'Vérifier ses acquis',
      questions: [
        {
          id: 'q-palpeur',
          enonce: 'Que risque-t-on avec un palpeur trop peu sensible ?',
          choix: ['Blesser les ceps', 'Laisser de l\'herbe au pied des ceps'],
          bonnes: [0],
          explication: 'L\'outil s\'efface trop tard et heurte le cep.'
        },
        {
          id: 'q-debit',
          enonce: 'Le débit de chantier théorique est-il atteint au champ ?',
          choix: ['Oui', 'Non, il ne compte ni demi-tours ni arrêts'],
          bonnes: [1],
          explication: 'C\'est un plafond : le débit réel est toujours inférieur.'
        }
      ]
    }
  ]
});
