(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-couverture',
  titre: 'Contrôler la couverture',
  domaine: 'pulverisation',
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B, B9).
  // Non relue par un valideur (porte G2) ; reprise soumise à la porte G1.
  statut: 'brouillon',
  valideur: null,
  resume: 'Vérifier que la bouillie atteint la cible, comprendre l\'effet de la rosée et de l\'écartement des passages au chenillard, d\'après les essais de 2013.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 20,
  sources: [
    { code: 'A-LVC', reference: 'Article du Vigneron Champenois, M.-P. Vacavant', date: 'avril 2014' },
    { code: 'D-IDR', reference: 'Diaporama « idées reçues » sur la pulvérisation, essais 2013 (M.-P. Vacavant, S. Debuisson)', date: '2014' }
  ],
  sections: [
    {
      id: 'controler',
      type: 'fiche',
      titre: 'Contrôler la couverture',
      technologie: 'toutes',
      blocs: [
        { type: 'liste', source: 'A-LVC', items: [
          'Toutes technologies : au printemps, réorienter 2 à 4 fois.',
          'Vérifier à chaque modification, avec une plaque de fer ou un piquet rouillé, un carton ou une ardoise.',
          'Protéger les brins de pied : c\'est là que partent mildiou et oïdium.'
        ] },
        { type: 'paragraphe', texte: 'Papiers hydrosensibles, ou traceurs fluorescents observés de nuit : ils montrent la couverture des rangs traités indirectement.', source: 'D-IDR' }
      ]
    },
    {
      id: 'rosee',
      type: 'fiche',
      titre: 'Traiter sur la rosée',
      technologie: 'toutes',
      blocs: [
        { type: 'paragraphe', texte: 'Jet porté, 150 L/ha (essais 2013) : dépôt équivalent en zone des grappes sans rosée, avec une rosée moyenne ou avec une rosée très forte. Avec assistance d\'air, la rosée peut être ignorée.', source: 'D-IDR' },
        { type: 'paragraphe', texte: 'Jet projeté, 400 L/ha (essais 2013) : dépôt réduit d\'environ 40 % avec une rosée moyenne et d\'environ 55 % avec une rosée très forte, avec le risque de dépasser le point de ruissellement.', source: 'D-IDR', lectureGraphique: true }
      ]
    },
    {
      id: 'passages',
      type: 'fiche',
      titre: 'Passer tous les combien de rangs ?',
      technologie: 'toutes',
      blocs: [
        { type: 'paragraphe', texte: 'Chenillard, essais 2013 : pleine végétation, vigueur moyenne, 5,1 km/h, réglages non adaptés à l\'écartement des passages. Écart de dépôt mesuré sur le rang traité indirectement.', source: 'D-IDR' },
        { type: 'tableau', source: 'D-IDR',
          entetes: ['Passage', 'Volume', 'Rang indirect : feuilles', 'Rang indirect : grappes'],
          lignes: [
            ['Tous les 2 rangs', '230 L/ha', '−30 %', 'Équivalent'],
            ['Tous les 3 rangs', '150 L/ha', '−50 %', '−60 %'],
            ['Tous les 4 rangs', '117 L/ha', '−65 %', '−70 %']
          ] },
        { type: 'paragraphe', texte: 'Conclusion de la source : au-delà d\'un passage tous les 2 rangs, la protection des rangs intermédiaires est insuffisante.', source: 'D-IDR' }
      ]
    },
    {
      id: 'cas-passage',
      type: 'cas',
      titre: 'Cas pratique : passer toutes les 3 routes',
      technologie: 'toutes',
      situation: 'Avec votre chenillard, vous passez toutes les 3 routes pour gagner du temps. Que vous apprennent les essais de 2013 sur le rang traité indirectement ?',
      source: 'D-IDR',
      // Les nombres des options sont ceux du tableau « passages » (vérifié par les tests).
      options: [
        { texte: 'La protection est la même sur tous les rangs.', correct: false, retour: 'Non : sur le rang traité indirectement, le dépôt baisse nettement.', source: 'D-IDR' },
        { texte: 'Le rang traité indirectement reçoit nettement moins : environ −50 % sur les feuilles et −60 % sur les grappes.', correct: true, retour: 'Oui : selon la source, au-delà d\'un passage tous les 2 rangs, la protection des rangs intermédiaires est insuffisante.', source: 'D-IDR' },
        { texte: 'Il suffit d\'augmenter le volume pour compenser.', correct: false, retour: 'Les essais n\'ont pas testé cette compensation ; leur conclusion porte sur l\'écartement des passages.', source: 'D-IDR' }
      ]
    }
  ]
});
