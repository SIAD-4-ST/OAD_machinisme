(function (m) {
  if (typeof module !== 'undefined' && module.exports) module.exports = m;
  else (window.OAD_CONTENU = window.OAD_CONTENU || []).push(m);
})({
  id: 'glossaire',
  titre: 'Glossaire',
  domaine: 'transversal',
  // Brouillon : rédaction du 23/09/2026 sur la synthèse du corpus (lot B,
  // B10). Seuls les termes définis dans la synthèse ; les termes confus
  // relevés par l'enquête de 2013 sont à rédiger par le valideur.
  statut: 'brouillon',
  valideur: null,
  resume: 'Les termes techniques utilisés dans les modules, chacun avec sa source.',
  public: 'Chauffeurs et chefs de culture',
  dureeMin: 5,
  sources: [
    { code: 'F-VHA', reference: 'Fiche Volume/hectare, CIVC', date: 'février 2014' },
    { code: 'F-FIL', reference: 'Fiche Filtration, CIVC', date: 'février 2014' },
    { code: 'A-LVC', reference: 'Article du Vigneron Champenois, M.-P. Vacavant', date: 'avril 2014' },
    { code: 'D-ENQ', reference: 'Diaporama Résultats de l\'enquête pulvérisation 2013 (M. Morlet, M.-P. Vacavant, S. Debuisson)', date: '2013' },
    { code: 'F-BOI', reference: 'Fiche intercep Boisselet Cutmatic, Comité Champagne – CA 51', date: 'octobre 2015' },
    { code: 'B20-1', reference: 'Choisir la bonne buse, partie 1, Le Vigneron Champenois (M. Liébart, S. Debuisson, A. Descôtes)', date: 'avril 2020', page: '26–38' }
  ],
  sections: [
    {
      id: 'termes',
      type: 'definitions',
      titre: 'Termes techniques',
      entrees: [
        { id: 'largeur-traitee', terme: 'Largeur traitée', definition: 'Largeur réellement traitée à chaque passage. Enjambeur : nombre de rangs traités × écartement. Turbine sur chenillard : 1, 2 ou 3 fois l\'écartement, selon que l\'on passe toutes les routes, toutes les 2 ou toutes les 3 routes.', source: 'F-VHA' },
        { id: 'mesh', terme: 'Mesh', definition: 'Nombre de fils par pouce d\'un filtre, mesure inverse de la maille : plus le mesh est élevé, plus la maille est fine.', source: 'F-FIL' },
        { id: 'jets-projetes', terme: 'Jets projetés (pendillards)', definition: 'Pulvérisation par buses sans assistance d\'air ; les descentes portant les buses sont appelées pendillards.', source: 'A-LVC' },
        { id: 'goutte-pneumatique', terme: 'Goutte en pneumatique', definition: 'Dans un pulvérisateur pneumatique, la goutte se forme à la rencontre du flux d\'air et de la veine liquide : c\'est ce qui rend le réglage délicat.', source: 'D-ENQ' },
        { id: 'vmd', terme: 'VMD', definition: 'Diamètre médian en volume : la moitié du volume pulvérisé est en gouttes plus grosses, l\'autre moitié en gouttes plus petites.', source: 'B20-1' },
        { id: 'nmd', terme: 'NMD', definition: 'Diamètre médian en nombre : même définition que le VMD, mais sur le nombre de gouttes.', source: 'B20-1' },
        { id: 'smd', terme: 'SMD', definition: 'Diamètre moyen de Sauter : rapport entre le volume et la surface de l\'ensemble des gouttes.', source: 'B20-1' },
        { id: 'palpeur', terme: 'Palpeur', definition: 'Organe placé en avant de la lame d\'un intercep : au contact du cep, il déclenche l\'effacement de la lame. Il se place le plus bas possible et suit le sol.', source: 'F-BOI' }
      ]
    }
  ]
});
