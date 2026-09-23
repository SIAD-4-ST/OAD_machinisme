(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'pulve-remise-en-route',
  titre: 'Remettre le pulvérisateur en route',
  domaine: 'pulverisation',
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B, B9).
  // Non relue par un valideur (porte G2) ; consignes de sécurité (EPI) à
  // relire avant publication ; reprise soumise à la porte G1.
  statut: 'brouillon',
  valideur: null,
  resume: 'Les contrôles de début de saison, en deux temps : après remontage, puis cuve remplie d\'eau claire et pulvérisation enclenchée.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 15,
  sources: [
    { code: 'A-WEB', reference: 'Article web du Vigneron Champenois (M. Liébart, M.-P. Tréfouël-Vacavant), mis à jour après 2022', date: '05/04/2014' }
  ],
  sections: [
    {
      id: 'apres-remontage',
      type: 'procedure',
      titre: 'Après remontage de la pompe et des rampes',
      technologie: 'toutes',
      etapes: [
        { id: 'filtres', texte: 'Vérifier l\'état de tous les filtres : aspiration, refoulement, rampe, buse.', source: 'A-WEB' },
        { id: 'anti-gouttes', texte: 'Vérifier la propreté et l\'état des anti-gouttes, des buses et des diffuseurs.', source: 'A-WEB' },
        { id: 'cloche', texte: 'Régler la pression de la cloche à air de la pompe à environ un tiers de la pression de travail.', source: 'A-WEB' },
        { id: 'huile', texte: 'Contrôler les niveaux d\'huile.', source: 'A-WEB' }
      ]
    },
    {
      id: 'eau-claire',
      type: 'procedure',
      titre: 'Cuve remplie d\'eau claire, pulvérisation enclenchée',
      technologie: 'toutes',
      intro: 'Remplir modérément la cuve d\'eau claire, puis enclencher la pulvérisation.',
      source: 'A-WEB',
      etapes: [
        { id: 'fuites', texte: 'Traquer les fuites (cuves, tuyaux).', source: 'A-WEB' },
        { id: 'debits', texte: 'Contrôler tous les débits (buse défectueuse, caillot).', source: 'A-WEB' },
        { id: 'air', texte: 'Appareil ventilé : vérifier l\'état des conduites d\'air, sans pincement ni fuite.', source: 'A-WEB' },
        { id: 'lave-mains', texte: 'Remplir d\'eau claire le bidon lave-mains.', source: 'A-WEB' },
        { id: 'cabine', texte: 'Tracteur à cabine : vérifier les joints des ouvertures ; remplacer le filtre de cabine une fois par an ou toutes les 500 h.', source: 'A-WEB' },
        { id: 'epi', texte: 'Renouveler les équipements de protection : gants en nitrile ou en fluoro-élastomère (norme EN 374), filtres A2P3 du masque au moins deux fois par an, combinaison.', source: 'A-WEB' },
        { id: 'reglage', texte: 'Régler ensuite le volume par hectare (vitesse, débits) et l\'orientation pour la végétation basse.', source: 'A-WEB' }
      ]
    }
  ]
});
