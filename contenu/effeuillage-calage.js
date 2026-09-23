(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'effeuillage-calage',
  titre: 'Caler une effeuilleuse',
  domaine: 'effeuillage',
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B,
  // B11). Aucune valeur de réglage (pression, vitesse, régime, hauteur, temps
  // de chantier) : les sources refusent un « réglage type » (D-B11-2).
  statut: 'brouillon',
  valideur: null,
  resume: 'Effeuillage précoce : principes des machines pneumatiques et à rouleaux, stade, et méthode de calage sur la parcelle.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 15,
  sources: [
    { code: 'F-EPN', reference: 'Fiche Effeuillage précoce, effeuilleuses pneumatiques, Comité Champagne', date: 'sans date (retours d\'expérience 2016)' },
    { code: 'F-ERO', reference: 'Fiche Effeuillage précoce, effeuilleuses à rouleaux, Comité Champagne', date: 'sans date (retours d\'expérience 2016)' },
    { code: 'D-EF17', reference: 'Diaporama Effeuilleuses pour l\'effeuillage précoce, Service vigne du Comité Champagne', date: 'mai 2017' }
  ],
  sections: [
    {
      id: 'principes',
      type: 'fiche',
      titre: 'Deux familles de machines',
      blocs: [
        { type: 'tableau', source: 'D-EF17',
          entetes: ['Famille', 'Principe', 'Stade', 'Défaut type'],
          lignes: [
            ['Pneumatique', 'Un surpresseur basse pression envoie un fort volume d\'air vers des buses en rotation dans des gamelles ajourées ; le double rotor permet de faire varier la largeur de bande.', 'Dès la nouaison, tant que la grappe est souple.', 'Marquages sur les grappes, jamais surinfectés et sans entrave à la croissance, sauf exception.'],
            ['Rouleaux', 'Les feuilles sont aspirées ou happées par un ou deux rouleaux, puis arrachées entières ou broyées selon le modèle.', 'Après le basculement complet de la grappe.', 'Blessures : perte nette d\'une portion de grappe ; la conduite doit être fine.']
          ] }
      ]
    },
    {
      id: 'stade',
      type: 'fiche',
      titre: 'Choisir le stade',
      blocs: [
        { type: 'liste', items: [
          { texte: 'Pneumatique : dès la nouaison, tant que la grappe est souple.', source: 'F-EPN' },
          { texte: 'Rouleaux : après le basculement complet de la grappe.', source: 'F-ERO' },
          { texte: 'Selon les essais, le meilleur stade va de la nouaison au grain de grenaille : « le plus tôt est le mieux ».', source: 'F-EPN' }
        ] }
      ]
    },
    {
      id: 'calage',
      type: 'procedure',
      titre: 'Caler la machine sur la parcelle',
      intro: '« Il n\'y a pas de réglage type » : le résultat varie selon l\'année, la parcelle, le cépage et l\'heure. Le réglage se cale sur place.',
      source: 'F-EPN',
      etapes: [
        { id: 'regler', texte: 'Faire un premier réglage, selon la notice du constructeur.', source: 'F-EPN' },
        { id: 'essai', texte: 'Faire un essai sur une petite longueur de rang.', source: 'F-EPN' },
        { id: 'observer', texte: 'Observer : grappes dégagées, effeuillage modéré ; comparer avec la face non effeuillée du rang voisin.', source: 'F-EPN' },
        { id: 'corriger', texte: 'Corriger le réglage, puis refaire un essai.', source: 'F-EPN' }
      ]
    },
    {
      id: 'compromis',
      type: 'fiche',
      titre: 'Un réglage est un compromis',
      blocs: [
        { type: 'paragraphe', texte: 'Tout réglage est un compromis entre le taux d\'effeuillage, les blessures et le débit de chantier.', source: 'F-EPN' },
        { type: 'paragraphe', texte: 'La cible : des grappes dégagées et un effeuillage modéré, jugés par comparaison avec la face non effeuillée du rang voisin.', source: 'F-EPN' }
      ]
    },
    {
      id: 'cas-marques',
      type: 'cas',
      titre: 'Cas pratique : des marques sur les grappes',
      situation: 'Après un passage d\'effeuilleuse pneumatique, vous observez des marques sur les grappes. Que faites-vous ?',
      options: [
        { texte: 'J\'arrête l\'effeuillage : les grappes marquées vont pourrir.', correct: false, retour: 'Non : selon la fiche, ces marquages ne sont jamais surinfectés et n\'entravent pas la croissance, sauf exception.', source: 'F-EPN' },
        { texte: 'J\'ajuste le réglage par la méthode de calage : essai sur une petite longueur, observation, correction.', correct: true, retour: 'Oui : les marquages ne sont jamais surinfectés et n\'entravent pas la croissance, sauf exception. Il n\'y a pas de réglage type : on cale sur place.', source: 'F-EPN' },
        { texte: 'J\'applique le réglage type de la machine.', correct: false, retour: 'Il n\'y a pas de réglage type : le résultat varie selon l\'année, la parcelle, le cépage et l\'heure.', source: 'F-EPN' }
      ]
    },
    {
      id: 'quiz-effeuillage',
      type: 'quiz',
      titre: 'Vérifier ses acquis',
      questions: [
        {
          id: 'q-stade-effeuillage',
          enonce: 'À partir de quand peut-on effeuiller avec une machine pneumatique ?',
          choix: ['Dès la nouaison, tant que la grappe est souple', 'Seulement après la véraison', 'Avant la floraison'],
          bonnes: [0],
          explication: 'Pneumatique : dès la nouaison, tant que la grappe est souple. Rouleaux : après le basculement complet de la grappe.',
          source: 'F-EPN'
        },
        {
          id: 'q-principe-rouleaux',
          enonce: 'Comment une effeuilleuse à rouleaux enlève-t-elle les feuilles ?',
          choix: ['Elle les aspire ou les happe entre un ou deux rouleaux', 'Elle les souffle avec de l\'air sous pression', 'Elle les coupe avec une lame'],
          bonnes: [0],
          explication: 'Les feuilles sont aspirées ou happées par les rouleaux, puis arrachées entières ou broyées selon le modèle.',
          source: 'F-ERO'
        },
        {
          id: 'q-compromis',
          enonce: 'Qu\'est-ce qu\'un bon réglage d\'effeuilleuse ?',
          choix: ['Un compromis entre taux d\'effeuillage, blessures et débit de chantier', 'Le réglage type donné pour la machine', 'Le taux d\'effeuillage le plus élevé possible'],
          bonnes: [0],
          explication: 'Il n\'y a pas de réglage type : on cherche des grappes dégagées et un effeuillage modéré, au prix de blessures et d\'un débit de chantier acceptables.',
          source: 'F-EPN'
        }
      ]
    }
  ]
});
