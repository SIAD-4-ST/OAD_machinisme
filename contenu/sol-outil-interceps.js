(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'sol-outil-interceps',
  titre: 'Régler et entretenir un outil interceps',
  domaine: 'travail-du-sol',
  // Brouillon : rédaction initiale du 23/09/2026, corrigée le 23/09/2026 sur
  // la synthèse du corpus (lot B, B8). Non relue par un valideur (porte G2) ;
  // reprise des valeurs soumise à la porte G1.
  statut: 'brouillon',
  valideur: null,
  resume: 'Connaître les familles d\'outils interceps, régler lame, palpeur et outil d\'ouverture, estimer le débit de chantier et suivre l\'entretien.',
  public: 'Chauffeurs et chefs de culture',
  // Réévaluée en proportion du nombre de sections (6 → 7).
  dureeMin: 30,
  sources: [
    { code: 'F-BOI', reference: 'Fiche intercep Boisselet Cutmatic, Comité Champagne – CA 51', date: 'octobre 2015' },
    { code: 'F-BRA', reference: 'Fiche intercep Braun, CA 51 – Comité Champagne', date: 'octobre 2015' },
    { code: 'F-DER', reference: 'Fiche charrue intercep Dérot, Comité Champagne – CA 51', date: 'octobre 2015' },
    { code: 'F-OUV', reference: 'Fiche outils d\'ouverture du sol, CA 51 – Comité Champagne', date: 'octobre 2015' },
    { code: 'D-SOL', reference: 'Diaporama Outils de travail du sol, Service vigne du Comité Champagne', date: 'avril 2017' }
  ],
  sections: [
    {
      id: 'types-outils',
      type: 'fiche',
      titre: 'Les familles d\'outils interceps',
      blocs: [
        { type: 'paragraphe', texte: 'Les outils interceps travaillent le rang, entre les ceps, là où l\'outil d\'interrang ne passe pas. Ils s\'effacent au contact du cep, grâce à un palpeur ou par appui de l\'outil sur le cep.' },
        { type: 'liste', source: 'D-SOL', items: [
          'Lames avec palpeur : le palpeur touche le cep et déclenche l\'effacement de la lame.',
          'Lames sans palpeur : l\'outil s\'efface par appui sur le cep.',
          'Autres familles : disques crénelés, outils rotatifs, brosses et étoiles.'
        ] },
        { type: 'paragraphe', texte: 'Charrue sans palpeur : lame orientée à environ 45° vers l\'arrière ; elle s\'efface par appui sur le cep, d\'où des réglages selon l\'âge de la vigne. Réduire l\'angle d\'attaque la rend moins agressive, à condition de vérifier que les deux lames se recouvrent sous le rang.', source: 'F-DER' },
        { type: 'alerte', texte: 'La sensibilité du palpeur s\'ajuste selon l\'âge de la vigne.', source: 'F-BOI' },
        { type: 'paragraphe', texte: 'Outils d\'ouverture du sol, placés devant la lame :' },
        { type: 'tableau', source: 'F-OUV',
          entetes: ['Outil', 'Largeur', 'Déplacement de terre', 'Commentaire'],
          lignes: [
            ['Griffe droite', '4 et 8 cm', 'Faible', 'Bonne pénétration, entretien courant'],
            ['Couteau Braun', 'Environ 1 cm, pointe avant', 'Très faible', 'Efficace même en sol assez dur'],
            ['Cœur', '12 à 20 cm', 'Moyen', 'Désherbage complémentaire ; pénètre mal en sol compact'],
            ['Rasette à plante', '20 à 35 cm', 'Très important', 'Complément ; lames vers l\'intérieur pour travailler une partie de l\'inter-rang, limiter une bande enherbée en période sèche'],
            ['Disque plein', 'Quelques mm', 'Très faible à moyen selon l\'angle', 'Découpe la bande d\'herbe ; 1 à 2 passages par an ; étançon à moyeu orientable'],
            ['Disque cranté', 'Quelques mm', 'Très faible à moyen selon l\'angle', 'Mottes plus petites qu\'avec le disque plein']
          ] }
      ]
    },
    {
      id: 'reglage-interceps',
      type: 'procedure',
      titre: 'Régler l\'outil en début de chantier',
      intro: 'Réglages communs aux interceps à lame et palpeur. Les réglages propres à chaque modèle sont dans la notice du constructeur.',
      etapes: [
        { id: 'aplomb', texte: 'Régler le porte-outil à l\'horizontale.', source: 'F-BOI' },
        { id: 'profondeur', texte: 'Régler la profondeur de la lame : 3 à 6 cm pour le désherbage, à adapter si le couvert est dense ou le sol compact.', source: 'F-BOI' },
        { id: 'palpeur', texte: 'Placer le palpeur 5 cm en avant de la lame, sur toute sa longueur, le plus bas possible pour déclencher l\'effacement sur la tête de souche : il doit suivre le sol.', source: 'F-BOI' },
        { id: 'sensibilite', texte: 'Ajuster la sensibilité du palpeur selon l\'âge de la vigne.', source: 'F-BOI' },
        { id: 'ouverture', texte: 'Monter un outil d\'ouverture devant la lame : il limite la contrainte sur le pivot et l\'usure.', source: 'F-BOI' },
        { id: 'fils', texte: 'En début de saison, attention aux fils au sol (lames courbes, accessoires).', source: 'F-BOI' }
      ]
    },
    {
      id: 'hydraulique',
      type: 'fiche',
      titre: 'Besoin hydraulique',
      blocs: [
        { type: 'paragraphe', texte: 'Interceps à moteur hydraulique (fiches Boisselet et Braun) : 6 à 15 L/min par moteur, environ 90 bar utiles.', source: 'F-BOI' },
        { type: 'paragraphe', texte: 'Pour votre matériel, reportez-vous à la notice du constructeur.' }
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
      // D-B8-4 : le corpus ne contient aucune consigne d'entretien des outils
      // de sol. Tâches de la rédaction initiale, sans source : à valider.
      intro: 'Plan indicatif, en attente de validation : suivez d\'abord la notice du constructeur.',
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
          enonce: 'Selon quoi ajuste-t-on la sensibilité du palpeur ?',
          choix: ['L\'âge de la vigne', 'La couleur du sol', 'La puissance du tracteur'],
          bonnes: [0],
          explication: 'La sensibilité du palpeur s\'ajuste selon l\'âge de la vigne.',
          source: 'F-BOI'
        },
        {
          id: 'q-profondeur',
          enonce: 'Pour le désherbage, à quelle profondeur travaille la lame ?',
          choix: ['3 à 6 cm, à adapter au couvert et au sol', 'Le plus profond possible', 'Sans pénétrer le sol'],
          bonnes: [0],
          explication: 'De 3 à 6 cm, profondeur à adapter si le couvert est dense ou le sol compact.',
          source: 'F-BOI'
        },
        {
          id: 'q-ouverture',
          enonce: 'Pourquoi monter un outil d\'ouverture devant la lame ?',
          choix: ['Pour limiter la contrainte sur le pivot et l\'usure', 'Pour remplacer le palpeur', 'Pour augmenter la vitesse d\'avancement'],
          bonnes: [0],
          explication: 'L\'outil d\'ouverture prépare le passage de la lame : moins de contrainte sur le pivot, moins d\'usure.',
          source: 'F-BOI'
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
