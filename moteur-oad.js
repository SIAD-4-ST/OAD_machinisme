if (typeof window === "undefined" || !window.OAD) {
/* =====================================================================
   Formation machines — moteur v1.0

   PUR : aucune lecture du DOM, aucun état, aucun appel réseau, aucune
   lecture d'horloge, aucune mise en forme. Uniquement des fonctions,
   exposées à la fois via `module.exports` (Node, tests) et `window.OAD`
   (navigateur). Toute formule, tout seuil, toute règle de notation ou de
   progression vit ICI et nulle part ailleurs — jamais dans index.html.

   Garde `if (!window.OAD)` : le fichier est chargé depuis <helmet>, que le
   runtime peut réévaluer ; la garde évite une double définition.

   Sections : 1 vocabulaires · 2 formules · 3 registre des calculateurs ·
   4 schéma du contenu · 5 quiz · 6 progression · 7 registre de contenu ·
   8 routes · 9 exports.
   ===================================================================== */

/* --- 1. Vocabulaires ------------------------------------------------
   Vocabulaires fermés du contenu (validés par validerModule) et leurs
   libellés d'écran. */

// `transversal` : modules de référence (glossaire), hors catalogue, hors
// avancement et hors états (D-B10-1, D-B10-4).
// `effeuillage` : méthode de calage, sans valeur de réglage (D-B11, arbitrage A3).
const DOMAINES = ['pulverisation', 'travail-du-sol', 'effeuillage', 'transversal'];
const DOMAINES_LIBELLES = {
  pulverisation: 'Pulvérisation',
  'travail-du-sol': 'Travail du sol',
  effeuillage: 'Effeuillage',
  transversal: 'Glossaire'
};

// Un module « valide » exige un valideur nommé et au moins une source (voir
// validerModule) : le statut n'est jamais déclaratif seul.
const STATUTS = ['brouillon', 'a-valider', 'valide'];
const STATUTS_LIBELLES = {
  brouillon: 'Brouillon',
  'a-valider': 'À valider',
  valide: 'Validé'
};

const TYPES_SECTION = ['fiche', 'procedure', 'entretien', 'calculateur', 'quiz', 'cas', 'exercice', 'definitions'];
const TYPES_SECTION_LIBELLES = {
  fiche: 'Fiche',
  procedure: 'Procédure',
  entretien: 'Entretien',
  calculateur: 'Calculateur',
  quiz: 'Quiz',
  cas: 'Cas pratique',
  exercice: 'Exercice',
  definitions: 'Glossaire'
};
// Sections dont l'id est une clé d'état de l'écran : uniques sur tout le catalogue.
const TYPES_SECTION_EVALUES = ['quiz', 'cas', 'exercice'];

const TYPES_BLOC = ['paragraphe', 'liste', 'alerte', 'formule', 'tableau'];

/* Technologie de pulvérisation à laquelle se rattache une section ou un
   calculateur (D-B4-1, arbitrage A5) : des consignes s'opposent d'une
   technologie à l'autre (synthèse §7.1). Le porteur (tracteur, chenillard)
   n'est pas une technologie. */
const TECHNOLOGIES = ['toutes', 'pneumatique', 'jets-portes', 'jets-projetes', 'confine'];
const TECHNOLOGIES_LIBELLES = {
  toutes: 'Toutes technologies',
  pneumatique: 'Pneumatique',
  'jets-portes': 'Jets portés',
  'jets-projetes': 'Jets projetés',
  confine: 'Confiné'
};

const PERIODICITES = ['chaque-utilisation', 'quotidienne', 'hebdomadaire',
  'semestrielle', 'debut-campagne', 'fin-campagne', 'annuelle'];
const PERIODICITES_LIBELLES = {
  'chaque-utilisation': 'Après chaque utilisation',
  quotidienne: 'Chaque jour',
  hebdomadaire: 'Chaque semaine',
  semestrielle: 'Au moins deux fois par an',
  'debut-campagne': 'En début de campagne',
  'fin-campagne': 'En fin de campagne',
  annuelle: 'Chaque année'
};

// État calculé, jamais stocké (D-B6-1) : « consulté » = toutes les sections
// ouvertes ; « maîtrisé » = en plus, tous les quiz et exercices réussis.
const ETATS_MODULE = ['non-commence', 'en-cours', 'consulte', 'maitrise'];
const ETATS_MODULE_LIBELLES = {
  'non-commence': 'Non commencé',
  'en-cours': 'En cours',
  consulte: 'Consulté',
  maitrise: 'Maîtrisé'
};

/* --- 2. Formules -----------------------------------------------------
   Grandeurs physiques en unités de chantier. Les facteurs numériques (600,
   3,6, 10) sont des conversions d'unités, démontrées en commentaire — pas
   des valeurs à sourcer. Une saisie absente, nulle ou négative donne NaN :
   aucune formule ne lève. */

// Nombre strictement positif, sinon NaN.
function positif(x) {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : NaN;
}
function fini(x) { return Number.isFinite(x) ? x : NaN; }

/* Volume épandu V (L/ha) à partir du débit total Q (L/min), de la vitesse
   v (km/h) et de la largeur traitée L (m).
   Surface par minute : v × 1000 / 60 (m/min) × L (m) / 10 000 (m²/ha)
   = v × L / 600 (ha/min) ⇒ V = Q / (v × L / 600) = 600 × Q / (v × L). */
function volumeHectare(Q, v, L) {
  return fini(600 * positif(Q) / (positif(v) * positif(L)));
}

/* Débit total Q (L/min) nécessaire pour épandre V (L/ha) à v (km/h) sur
   L (m) : inverse de volumeHectare, Q = V × v × L / 600. */
function debitTotalPourVolume(V, v, L) {
  return fini(positif(V) * positif(v) * positif(L) / 600);
}

/* Débit par buse q (L/min) : débit total réparti sur n buses identiques.
   n est un effectif : arrondi à l'entier, au moins 1. */
function debitParBuse(V, v, L, n) {
  const nb = Math.round(Number(n));
  if (!(nb >= 1)) return NaN;
  return fini(debitTotalPourVolume(V, v, L) / nb);
}

/* Ajustement en loi puissance : x2 = x1 × rapport^exposant. Brique commune
   des changements de réglage (débit ∝ pression^b). */
function ajustementPuissance(x1, rapport, exposant) {
  const e = Number(exposant);
  if (!Number.isFinite(e)) return NaN;
  return fini(positif(x1) * Math.pow(positif(rapport), e));
}

/* Pression P2 (bar) pour passer de V1 à V2 (L/ha) sans changer de buse ni
   de vitesse. Le débit d'une buse hydraulique suit q ∝ P^b ; le volume est
   proportionnel au débit ⇒ P2 = P1 × (V2 / V1)^(1 / b). */
function pressionPourVolume(P1, V1, V2, b) {
  const bb = positif(b);
  return ajustementPuissance(P1, positif(V2) / positif(V1), 1 / bb);
}

/* Vitesse réelle v (km/h) mesurée sur une distance d (m) parcourue en t (s).
   m/s → km/h : × 3600 / 1000 = × 3,6. */
function vitesseMesuree(d, t) {
  return fini(3.6 * positif(d) / positif(t));
}

/* Débit de chantier théorique S (ha/h), sans temps morts ni demi-tours :
   v (km/h) × 1000 × L (m) / 10 000 = v × L / 10. */
function debitChantierTheorique(v, L) {
  return fini(positif(v) * positif(L) / 10);
}

/* Largeur traitée L (m) : n écartements de e (m). Enjambeur : n = rangs
   traités par passage. Chenillard : n = 1, 2 ou 3 selon que l'on passe
   toutes les routes, toutes les 2 ou toutes les 3 (D-B2-1). */
function largeurTraitee(n, e) {
  return fini(positif(n) * positif(e));
}

/* Débit total Q (L/min) mesuré au niveau de la cuve : volume refait (L)
   après avoir pulvérisé pendant la durée (min). Q = volume / durée. */
function debitParNiveauCuve(volume, duree) {
  return fini(positif(volume) / positif(duree));
}

/* Volume V2 (L/ha) après changement du nombre de hauteurs de buses par
   descente, à même débit par hauteur, vitesse et largeur inchangées : le
   débit total est proportionnel au nombre de hauteurs ⇒ V2 = V1 × h2 / h1.
   h1, h2 sont des effectifs : arrondis à l'entier, au moins 1 (D-B2-3). */
function volumeSelonHauteurs(V1, h1, h2) {
  const a = Math.round(Number(h1)), b = Math.round(Number(h2));
  if (!(a >= 1) || !(b >= 1)) return NaN;
  return fini(positif(V1) * b / a);
}

/* Volume V2 (L/ha) après passage de la vitesse v1 à v2 (km/h), débit et
   largeur inchangés : V = 600 × Q / (v × L) ⇒ V2 = V1 × v1 / v2 (D-B2-4). */
function volumeApresChangementVitesse(V1, v1, v2) {
  return fini(positif(V1) * positif(v1) / positif(v2));
}

// Seuil d'écart d'un diffuseur à la moyenne : F-VHA, CIVC, février 2014
// (« intervention si écart > 10 % à la moyenne », synthèse §2.1).
const ECART_DIFFUSEUR_MAX = 0.10;
// Tolérance de calcul flottant : 1,1 contre une moyenne de 1,0 donne
// 0,10000000000000009, qui n'est pas « supérieur à 10 % » (D-B3-2).
const TOLERANCE_FLOTTANTE = 1e-9;

// Débit lisible : nombre fini, positif ou nul (0 = diffuseur bouché, à signaler).
function debitLisible(x) { return typeof x === 'number' && Number.isFinite(x) && x >= 0; }

/* Écart de chaque débit mesuré q à la moyenne m des débits utiles (lisibles
   et non nuls) : m = Σ q / n ; e = (q − m) / m (fraction, pas pourcentage).
   rang = position dans la liste saisie (à partir de 1) ; les valeurs
   illisibles sont ignorées mais gardent leur rang. Signalé si |e| > seuil
   (strict). Chaque écart porte bouche (booléen).
   D-C1-1 : un débit nul = diffuseur bouché, exclu de la moyenne (sinon il
   fait signaler les diffuseurs sains), toujours signalé : ecart null,
   horsSeuil true, bouche true.
   D-C1-2 : moins de 2 débits utiles → moyenne NaN ; ecarts = les seuls nuls,
   qui restent signalés. */
function ecartsALaMoyenne(debits, seuil) {
  const s = Number(seuil);
  const lus = (Array.isArray(debits) ? debits : [])
    .map((d, i) => ({ rang: i + 1, debit: d }))
    .filter(x => debitLisible(x.debit));
  const utiles = lus.filter(x => x.debit > 0);
  const somme = utiles.reduce((a, x) => a + x.debit, 0);
  const moyenne = utiles.length >= 2 ? somme / utiles.length : NaN;
  const ok = Number.isFinite(moyenne);
  const ecarts = lus.filter(x => ok || x.debit === 0).map(x => {
    if (x.debit === 0) return { rang: x.rang, debit: 0, ecart: null, horsSeuil: true, bouche: true };
    const ecart = (x.debit - moyenne) / moyenne;
    return { rang: x.rang, debit: x.debit, ecart, horsSeuil: Number.isFinite(s) && Math.abs(ecart) > s + TOLERANCE_FLOTTANTE, bouche: false };
  });
  return { moyenne: ok ? moyenne : NaN, ecarts, horsSeuil: ecarts.filter(x => x.horsSeuil).map(x => x.rang) };
}

/* --- 3. Registre des calculateurs ------------------------------------
   Chaque calculateur : entrées (avec l'origine de leur valeur par défaut)
   et compute(valeurs numériques) → { etapes, resultats, alertes }.
   Sorties BRUTES : la vue formate une seule fois, en fr-FR.
     alerte   = chaîne, ou { gabarit, operandes } si elle cite des nombres
     etape    = { titre, formule, gabarit, operandes, resultat }
     gabarit  = substitution à marqueurs positionnels {0}, {1}…
     operande = { valeur, decimales }
     resultat = { valeur, unite, decimales }
   Une valeur non calculable vaut null (jamais NaN en sortie). */

// ASSUMÉ par défaut : valeur d'exemple sans source. Liste au README, section 5.
const ORIGINE_ASSUME = 'Valeur d\'exemple, sans source : à confirmer par le référent';
const ORIGINE_B_IFV = 'Valeur fixe de l\'outil IFV Mon réglage pulvé (code lu le 22/09/2026)';

/* Origines reprises de la synthèse du corpus (source secondaire, D-B0-4) :
   chaque valeur figure au README, section 13, jusqu'au contrôle au document
   primaire. Porte G1 (droits) avant fusion dans main. */
// F-VHA : Fiche volume/hectare, CIVC, février 2014 (synthèse §2.1).
const ORIGINE_LARGEUR_FVHA = 'Enjambeur 7 rangs à 1,10 m (fiche Volume/hectare, CIVC, février 2014)';
// F-CGE, F-CGA, F-JET, F-PRE, F-IDE, F-GRE : fiches de réglage 2014–2016, vitesse 5 km/h.
const ORIGINE_VITESSE_FICHES = 'Vitesse des fiches de réglage du Comité Champagne (2014–2016)';
// F-CGE, F-CGA, F-JET : 150 L/ha en pleine végétation.
const ORIGINE_VOLUME_FICHES = 'Volume de pleine végétation des fiches de réglage (2014–2016)';
// F-PRE, F-IDE : 150–180 L/ha en pleine végétation, jets portés.
const ORIGINE_VOLUME_180 = 'Haut de la plage de pleine végétation, jets portés (fiches Precijet et Idéal, 2014–2016)';
// F-VHA : table temps → vitesse, 50 m en 30 s = 6 km/h.
const ORIGINE_MESURE_FVHA = 'Mesure sur 50 m (fiche Volume/hectare, CIVC, février 2014)';
// F-PRE, F-IDE : TXA80 0050, pression de travail 3,0–4,5 bar.
const ORIGINE_PLAGE_BUSE = 'Exemple : plage d\'une buse TXA80 0050 en jets portés (fiche Precijet, Comité Champagne, mai 2016). Reportez la plage de votre buse (notice du fabricant)';
// F-PRE (mai 2016) : 3 bar à 150 L/ha, exemple placé à la borne basse de la
// plage 3,0–4,5 bar de la TXA80 0050.
const ORIGINE_PLAGE_EXEMPLE = 'Exemple dans la plage de travail de la buse de référence';
// D-B1-1 : Q déduit de V = 150 L/ha, v = 5 km/h, L = 7,7 m (Q exact = 9,625),
// arrondi pour une saisie lisible.
const ORIGINE_Q_DEDUIT = 'Exemple déduit de 150 L/ha à 5 km/h sur 7,7 m';
// D-B2-2 : 48 L = 9,6 L/min × 5 min, cohérent avec volHa.
const ORIGINE_VOLUME_CUVE = 'Exemple déduit de 9,6 L/min pendant 5 min';
// F-VHA (février 2014) : 2 min en jets projetés, 5 min en pneumatiques et jets portés.
const ORIGINE_DUREE_CUVE = 'Durée pour pneumatiques et jets portés ; 2 min pour les jets projetés (fiche Volume/hectare, CIVC, février 2014)';
// A-LVC : article Le Vigneron Champenois, M.-P. Vacavant, avril 2014 — 180 L/ha
// avec 3 hauteurs de buses par descente → 120 L/ha avec 2 (synthèse §2.1).
const ORIGINE_HAUTEURS_ALVC = 'Exemple de l\'article Le Vigneron Champenois, avril 2014';
// D-B3-5 : liste inventée pour montrer un diffuseur signalé (−10,26 %) et un
// autre juste sous le seuil (+9,13 %). Aucune mesure réelle.
const ORIGINE_EXERCICE = 'Exemple fabriqué pour l\'exercice';

// C2 (point laissé au rédacteur en C1) : « non nuls », exact aussi pour [0 ; 0 ; 1,4].
const ALERTE_LISTE_COURTE = 'Calcul impossible : saisissez au moins deux débits non nuls, séparés par un point-virgule.';

const ALERTE_SAISIE = 'Calcul impossible : chaque valeur doit être un nombre strictement positif.';

function sortie(x) { return Number.isFinite(x) ? x : null; }
function operande(valeur, decimales) { return { valeur: sortie(valeur), decimales }; }
function etape(titre, formule, gabarit, operandes, valeur, unite, decimales) {
  return { titre, formule, gabarit, operandes, resultat: { valeur: sortie(valeur), unite, decimales } };
}
function resultat(label, valeur, unite, decimales) {
  return { label, valeur: sortie(valeur), unite, decimales };
}
/* Alerte chiffrée : gabarit à marqueurs + opérandes bruts, mis en forme par
   la vue comme une étape (le moteur ne formate pas). Une alerte sans nombre
   reste une chaîne. */
function alerteChiffree(gabarit, operandes) { return { gabarit, operandes }; }
function alertesSaisie(resultats) {
  return resultats.some(r => r.valeur === null) ? [ALERTE_SAISIE] : [];
}

/* Fabrique commune (D-C2-1) : un calculateur scalaire se DÉCRIT, il ne se
   programme plus. Chaque étape lit la portée (entrées + valeurs des étapes
   précédentes, par leur clé) ; chaque résultat pointe une clé de la portée.
   Opérande : [clé, décimales] ou [fonction(portée), décimales].
   Contrat de sortie inchangé : { etapes, resultats, alertes }. L'alerte de
   saisie est commune ; `alertes(portee, resultats)` ajoute les alertes
   propres, après elle. */
function lireOperande(portee, o) {
  return operande(typeof o[0] === 'function' ? o[0](portee) : portee[o[0]], o[1]);
}
function calculateurSimple(def) {
  const c = Object.assign({}, def);
  delete c.etapes; delete c.resultats; delete c.alertes;
  c.compute = function (e) {
    const s = Object.assign({}, e);
    const etapes = def.etapes.map(et => {
      const valeur = et.f(s);
      s[et.cle] = valeur;
      return etape(et.titre, et.formule, et.gabarit, et.operandes.map(o => lireOperande(s, o)),
        valeur, et.unite, et.decimales);
    });
    const resultats = def.resultats.map(r => resultat(r[0], s[r[1]], r[2], r[3]));
    const alertes = alertesSaisie(resultats).concat(def.alertes ? def.alertes(s, resultats) : []);
    return { etapes, resultats, alertes };
  };
  return c;
}
const effectif = x => Math.round(Number(x));

/* Vitesse v (km/h) à tenir pour épandre V (L/ha) avec un débit total Q
   (L/min) sur L (m) : V = 600 × Q / (v × L) résolu en v (D-C2-4). */
function vitessePourVolume(V, Q, L) {
  return fini(600 * positif(Q) / (positif(V) * positif(L)));
}

const CALCULATEURS = {
  volHa: calculateurSimple({
    id: 'volHa',
    technologies: ['toutes'],
    titre: 'Volume par hectare',
    titreCourt: 'Volume par hectare',
    description: 'Volume de bouillie épandu à partir du débit mesuré, de la vitesse et de la largeur traitée.',
    entrees: [
      { id: 'Q', label: 'Débit total de la rampe', unite: 'L/min', defaut: 9.6, origineDefaut: ORIGINE_Q_DEDUIT, mesure: 'debitCuve' },
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 5, origineDefaut: ORIGINE_VITESSE_FICHES, mesure: 'vitesseMesuree' },
      { id: 'L', label: 'Largeur traitée', unite: 'm', defaut: 7.7, origineDefaut: ORIGINE_LARGEUR_FVHA, mesure: 'largeurTraitee' }
    ],
    etapes: [{ cle: 'V', titre: 'Volume épandu', formule: 'V = 600 × Q / (v × L)', gabarit: '600 × {0} / ({1} × {2})',
      operandes: [['Q', 2], ['v', 1], ['L', 2]], f: s => volumeHectare(s.Q, s.v, s.L), unite: 'L/ha', decimales: 0 }],
    resultats: [['Volume par hectare', 'V', 'L/ha', 0]]
  }),

  debitBuse: calculateurSimple({
    id: 'debitBuse',
    technologies: ['toutes'],
    titre: 'Débit par buse pour un volume visé',
    titreCourt: 'Débit par buse',
    description: 'Débit que chaque buse doit fournir pour épandre le volume visé à la vitesse et la largeur données.',
    entrees: [
      { id: 'V', label: 'Volume visé', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_VOLUME_FICHES },
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 5, origineDefaut: ORIGINE_VITESSE_FICHES, mesure: 'vitesseMesuree' },
      { id: 'L', label: 'Largeur traitée', unite: 'm', defaut: 7.7, origineDefaut: ORIGINE_LARGEUR_FVHA, mesure: 'largeurTraitee' },
      // ASSUMÉ (D-B1-3) : le corpus ne donne pas de nombre de buses par matériel.
      { id: 'n', label: 'Nombre de buses ouvertes', unite: 'buses', defaut: 12, origineDefaut: ORIGINE_ASSUME }
    ],
    etapes: [
      { cle: 'Q', titre: 'Débit total', formule: 'Q = V × v × L / 600', gabarit: '{0} × {1} × {2} / 600',
        operandes: [['V', 0], ['v', 1], ['L', 2]], f: s => debitTotalPourVolume(s.V, s.v, s.L), unite: 'L/min', decimales: 2 },
      { cle: 'q', titre: 'Débit par buse', formule: 'q = Q / n', gabarit: '{0} / {1}',
        operandes: [['Q', 2], [s => effectif(s.n), 0]], f: s => debitParBuse(s.V, s.v, s.L, s.n), unite: 'L/min', decimales: 2 }
    ],
    resultats: [['Débit total de la rampe', 'Q', 'L/min', 2], ['Débit par buse', 'q', 'L/min', 2]]
  }),

  // D-C2-4 : troisième résolution de la même relation, pour la famille « volume ».
  vitesseVisee: calculateurSimple({
    id: 'vitesseVisee',
    technologies: ['toutes'],
    titre: 'Vitesse à tenir pour un volume visé',
    titreCourt: 'Vitesse à tenir',
    description: 'Vitesse d\'avancement qui donne le volume visé avec le débit total et la largeur traitée actuels, sans changer de buse ni de pression.',
    entrees: [
      { id: 'V', label: 'Volume visé', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_VOLUME_FICHES },
      { id: 'Q', label: 'Débit total de la rampe', unite: 'L/min', defaut: 9.6, origineDefaut: ORIGINE_Q_DEDUIT, mesure: 'debitCuve' },
      { id: 'L', label: 'Largeur traitée', unite: 'm', defaut: 7.7, origineDefaut: ORIGINE_LARGEUR_FVHA, mesure: 'largeurTraitee' }
    ],
    etapes: [{ cle: 'v', titre: 'Vitesse à tenir', formule: 'v = 600 × Q / (V × L)', gabarit: '600 × {0} / ({1} × {2})',
      operandes: [['Q', 2], ['V', 0], ['L', 2]], f: s => vitessePourVolume(s.V, s.Q, s.L), unite: 'km/h', decimales: 1 }],
    resultats: [['Vitesse à tenir', 'v', 'km/h', 1]]
  }),

  pressionPourVolume: calculateurSimple({
    id: 'pressionPourVolume',
    titre: 'Pression pour un nouveau volume',
    titreCourt: 'Par la pression',
    description: 'Pression à régler pour passer d\'un volume à un autre sans changer de buse ni de vitesse.',
    // Buses hydrauliques : ne s'applique pas aux diffuseurs pneumatiques (D-B4-1).
    technologies: ['jets-portes', 'jets-projetes'],
    entrees: [
      { id: 'P1', label: 'Pression actuelle', unite: 'bar', defaut: 3, origineDefaut: ORIGINE_PLAGE_EXEMPLE },
      { id: 'V1', label: 'Volume actuel', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_PLAGE_EXEMPLE },
      { id: 'V2', label: 'Volume visé', unite: 'L/ha', defaut: 180, origineDefaut: ORIGINE_VOLUME_180 },
      { id: 'b', label: 'Exposant débit–pression de la buse (b)', unite: '', defaut: 0.5, origineDefaut: ORIGINE_B_IFV },
      // D-B1-2 : la plage dépend de la buse ; elle est saisie, pas fixée.
      { id: 'pMin', label: 'Pression minimale de la buse', unite: 'bar', defaut: 3, origineDefaut: ORIGINE_PLAGE_BUSE },
      { id: 'pMax', label: 'Pression maximale de la buse', unite: 'bar', defaut: 4.5, origineDefaut: ORIGINE_PLAGE_BUSE }
    ],
    etapes: [
      { cle: 'r', titre: 'Rapport des volumes', formule: 'r = V2 / V1', gabarit: '{0} / {1}',
        operandes: [['V2', 0], ['V1', 0]], f: s => positif(s.V2) / positif(s.V1), unite: '', decimales: 3 },
      { cle: 'P2', titre: 'Pression à régler', formule: 'P2 = P1 × r^(1 / b)', gabarit: '{0} × {1}^(1 / {2})',
        operandes: [['P1', 2], ['r', 3], ['b', 2]], f: s => pressionPourVolume(s.P1, s.V1, s.V2, s.b), unite: 'bar', decimales: 1 }
    ],
    resultats: [['Pression à régler', 'P2', 'bar', 1]],
    alertes(s, resultats) {
      const alertes = [];
      const pMin = positif(s.pMin), pMax = positif(s.pMax);
      if (!(pMin < pMax)) {
        alertes.push('Plage de pression de la buse invalide : la pression minimale doit être inférieure à la maximale.');
      } else if (resultats[0].valeur !== null && (s.P2 < pMin || s.P2 > pMax)) {
        alertes.push(alerteChiffree('Pression calculée hors de la plage de la buse ({0} à {1} bar) : ' +
          'changez de calibre de buse ou de vitesse plutôt que de forcer la pression.',
          [operande(pMin, 2), operande(pMax, 2)]));
      }
      // D-C1-3 : alerte P1 après l'alerte P2, pour ne pas décaler les indices.
      const P1 = positif(s.P1);
      if (pMin < pMax && (P1 < pMin || P1 > pMax)) {
        alertes.push(alerteChiffree('Pression actuelle hors de la plage de la buse ({0} à {1} bar) : ' +
          'vérifiez la saisie ou la buse montée.', [operande(pMin, 2), operande(pMax, 2)]));
      }
      return alertes;
    }
  }),

  hauteursBuses: calculateurSimple({
    id: 'hauteursBuses',
    technologies: ['toutes'],
    titre: 'Volume selon le nombre de hauteurs de buses',
    titreCourt: 'Par les hauteurs de buses',
    description: 'Volume obtenu en changeant le nombre de hauteurs de buses par descente, à vitesse égale et avec le même débit à chaque hauteur de buse.',
    entrees: [
      { id: 'V1', label: 'Volume actuel', unite: 'L/ha', defaut: 180, origineDefaut: ORIGINE_HAUTEURS_ALVC },
      { id: 'h1', label: 'Hauteurs de buses actuelles', unite: 'hauteurs', defaut: 3, origineDefaut: ORIGINE_HAUTEURS_ALVC },
      { id: 'h2', label: 'Hauteurs de buses après changement', unite: 'hauteurs', defaut: 2, origineDefaut: ORIGINE_HAUTEURS_ALVC }
    ],
    etapes: [{ cle: 'V2', titre: 'Volume après changement', formule: 'V2 = V1 × h2 / h1', gabarit: '{0} × {1} / {2}',
      operandes: [['V1', 0], [s => effectif(s.h2), 0], [s => effectif(s.h1), 0]],
      f: s => volumeSelonHauteurs(s.V1, s.h1, s.h2), unite: 'L/ha', decimales: 0 }],
    resultats: [['Volume après changement', 'V2', 'L/ha', 0]]
  }),

  // D-C2-4 : expose volumeApresChangementVitesse (D-B2-4), jusqu'ici sans écran.
  changementVitesse: calculateurSimple({
    id: 'changementVitesse',
    technologies: ['toutes'],
    titre: 'Volume après un changement de vitesse',
    titreCourt: 'Par la vitesse',
    description: 'Volume obtenu en changeant de vitesse sans toucher au débit ni à la largeur : aller plus vite diminue le volume par hectare.',
    entrees: [
      { id: 'V1', label: 'Volume actuel', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_VOLUME_FICHES },
      { id: 'v1', label: 'Vitesse actuelle', unite: 'km/h', defaut: 5, origineDefaut: ORIGINE_VITESSE_FICHES, mesure: 'vitesseMesuree' },
      { id: 'v2', label: 'Nouvelle vitesse', unite: 'km/h', defaut: 6, origineDefaut: ORIGINE_MESURE_FVHA }
    ],
    etapes: [{ cle: 'V2', titre: 'Volume après changement', formule: 'V2 = V1 × v1 / v2', gabarit: '{0} × {1} / {2}',
      operandes: [['V1', 0], ['v1', 1], ['v2', 1]], f: s => volumeApresChangementVitesse(s.V1, s.v1, s.v2), unite: 'L/ha', decimales: 0 }],
    resultats: [['Volume après changement', 'V2', 'L/ha', 0]]
  }),

  vitesseMesuree: calculateurSimple({
    id: 'vitesseMesuree',
    technologies: ['toutes'],
    titre: 'Vitesse réelle mesurée',
    titreCourt: 'Vitesse réelle',
    description: 'Vitesse d\'avancement mesurée sur une distance balisée, en conditions de travail.',
    entrees: [
      { id: 'd', label: 'Distance parcourue', unite: 'm', defaut: 50, origineDefaut: ORIGINE_MESURE_FVHA },
      { id: 't', label: 'Temps mesuré', unite: 's', defaut: 30, origineDefaut: ORIGINE_MESURE_FVHA }
    ],
    etapes: [{ cle: 'v', titre: 'Vitesse', formule: 'v = 3,6 × d / t', gabarit: '3,6 × {0} / {1}',
      operandes: [['d', 1], ['t', 1]], f: s => vitesseMesuree(s.d, s.t), unite: 'km/h', decimales: 1 }],
    resultats: [['Vitesse réelle', 'v', 'km/h', 1]]
  }),

  largeurTraitee: calculateurSimple({
    id: 'largeurTraitee',
    technologies: ['toutes'],
    titre: 'Largeur traitée',
    titreCourt: 'Largeur traitée',
    description: 'Enjambeur : nombre de rangs traités par passage × écartement. Chenillard : 1, 2 ou 3 écartements selon que l\'on passe toutes les routes, toutes les 2 ou toutes les 3 routes.',
    entrees: [
      { id: 'n', label: 'Nombre d\'écartements traités par passage', unite: 'rangs', defaut: 7, origineDefaut: ORIGINE_LARGEUR_FVHA },
      { id: 'e', label: 'Écartement entre rangs', unite: 'm', defaut: 1.1, origineDefaut: ORIGINE_LARGEUR_FVHA }
    ],
    etapes: [{ cle: 'L', titre: 'Largeur traitée', formule: 'L = n × e', gabarit: '{0} × {1}',
      operandes: [['n', 0], ['e', 2]], f: s => largeurTraitee(s.n, s.e), unite: 'm', decimales: 2 }],
    resultats: [['Largeur traitée', 'L', 'm', 2]]
  }),

  debitCuve: calculateurSimple({
    id: 'debitCuve',
    technologies: ['toutes'],
    titre: 'Débit total par le niveau de la cuve',
    titreCourt: 'Débit à la cuve',
    description: 'Remplir la ou les cuves à ras bord, pulvériser pendant la durée choisie, puis refaire le niveau en mesurant le volume ajouté : le débit total est ce volume divisé par la durée.',
    entrees: [
      { id: 'volume', label: 'Volume refait', unite: 'L', defaut: 48, origineDefaut: ORIGINE_VOLUME_CUVE },
      { id: 'duree', label: 'Durée de pulvérisation', unite: 'min', defaut: 5, origineDefaut: ORIGINE_DUREE_CUVE }
    ],
    etapes: [{ cle: 'Q', titre: 'Débit total', formule: 'Q = volume refait / durée', gabarit: '{0} / {1}',
      operandes: [['volume', 2], ['duree', 2]], f: s => debitParNiveauCuve(s.volume, s.duree), unite: 'L/min', decimales: 2 }],
    resultats: [['Débit total', 'Q', 'L/min', 2]]
  }),

  ecartDiffuseurs: {
    id: 'ecartDiffuseurs',
    technologies: ['toutes'],
    titre: 'Écart entre diffuseurs',
    titreCourt: 'Écart entre diffuseurs',
    description: 'Débit mesuré diffuseur par diffuseur : écart de chacun à la moyenne. Au-delà de 10 %, intervenir : nettoyage, changement de buse ou de pastille, vérification des anti-gouttes.',
    entrees: [
      { id: 'debits', type: 'liste', label: 'Débits mesurés par diffuseur', unite: 'L/min',
        defaut: [1.40, 1.38, 1.52, 1.41, 1.25, 1.39, 1.40], origineDefaut: ORIGINE_EXERCICE }
    ],
    // Seul calculateur à entrée liste et à détail tabulé : programmé, pas décrit.
    compute(e) {
      const liste = Array.isArray(e.debits) ? e.debits : [];
      const r = ecartsALaMoyenne(liste, ECART_DIFFUSEUR_MAX);
      // D-C1-1 : la moyenne ne porte que sur les débits utiles (non nuls).
      const lisibles = r.ecarts.filter(x => !x.bouche).map(x => x.debit);
      const ok = Number.isFinite(r.moyenne);
      const bouches = r.ecarts.some(x => x.bouche);
      const resultats = [
        resultat('Débit moyen', r.moyenne, 'L/min', 2),
        // D-C1-2 : un débit nul se compte même sans moyenne calculable.
        resultat('Diffuseurs à contrôler', ok || bouches ? r.horsSeuil.length : NaN, '', 0)
      ];
      const alertes = [];
      liste.forEach((d, i) => {
        if (!debitLisible(d)) alertes.push(alerteChiffree('Valeur n° {0} illisible : elle est ignorée.', [operande(i + 1, 0)]));
      });
      if (!ok) alertes.push(ALERTE_LISTE_COURTE);
      r.ecarts.filter(x => x.horsSeuil).forEach(x => alertes.push(x.bouche
        ? alerteChiffree('Diffuseur n° {0} : débit nul, diffuseur bouché : à contrôler.', [operande(x.rang, 0)])
        : alerteChiffree('Diffuseur n° {0} : écart de {1} % à la moyenne, au-delà de {2} % : à contrôler.',
          [operande(x.rang, 0), operande(x.ecart * 100, 2), operande(ECART_DIFFUSEUR_MAX * 100, 0)])));
      // Exemple d'écart : le diffuseur non bouché le plus éloigné de la moyenne.
      const loin = r.ecarts.filter(x => !x.bouche)
        .reduce((a, x) => (!a || Math.abs(x.ecart) > Math.abs(a.ecart)) ? x : a, null);
      return {
        etapes: [
          etape('Moyenne', 'm = Σ q / n',
            '(' + (lisibles.length ? lisibles.map((_, i) => '{' + i + '}').join(' + ') : '—') + ') / {' + lisibles.length + '}',
            lisibles.map(q => operande(q, 2)).concat([operande(ok ? lisibles.length : NaN, 0)]),
            r.moyenne, 'L/min', 2),
          etape('Écart du diffuseur le plus éloigné de la moyenne', 'e = (q − m) / m × 100', '({0} − {1}) / {1} × 100',
            [operande(loin ? loin.debit : NaN, 2), operande(r.moyenne, 2)],
            loin ? loin.ecart * 100 : NaN, '%', 2)
        ],
        resultats,
        alertes,
        detail: r.ecarts
      };
    }
  },

  debitChantier: calculateurSimple({
    id: 'debitChantier',
    technologies: ['toutes'],
    titre: 'Débit de chantier théorique',
    titreCourt: 'Débit de chantier',
    description: 'Surface travaillée par heure, sans temps morts ni demi-tours : un plafond, jamais atteint au champ.',
    entrees: [
      // ASSUMÉ (D-B1-4) : le corpus ne donne ni vitesse ni largeur d'interceps.
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 6, origineDefaut: ORIGINE_ASSUME },
      { id: 'L', label: 'Largeur travaillée', unite: 'm', defaut: 2.5, origineDefaut: ORIGINE_ASSUME }
    ],
    etapes: [{ cle: 'S', titre: 'Débit de chantier', formule: 'S = v × L / 10', gabarit: '{0} × {1} / 10',
      operandes: [['v', 1], ['L', 2]], f: s => debitChantierTheorique(s.v, s.L), unite: 'ha/h', decimales: 2 }],
    resultats: [['Débit de chantier théorique', 'S', 'ha/h', 2]]
  })
};

/* Familles (D-C2-2) : regroupement de l'écran et, si `partage`, saisies
   communes. Dans une famille partagée, une même clé d'entrée désigne la même
   grandeur, dans la même unité (vérifié par erreursRegistre) : un volume
   actuel saisi pour la pression se retrouve dans « par la vitesse ». Les
   mesures ne partagent pas : `n` y désigne des rangs, pas des buses. */
const FAMILLES_CALCULATEURS = [
  { id: 'volume', titre: 'Volume, débit et vitesse', partage: true,
    calculateurs: ['volHa', 'debitBuse', 'vitesseVisee'] },
  { id: 'changement', titre: 'Changer le volume : un levier à la fois', partage: true,
    calculateurs: ['pressionPourVolume', 'hauteursBuses', 'changementVitesse'] },
  { id: 'mesures', titre: 'Mesures au champ', partage: false,
    calculateurs: ['vitesseMesuree', 'largeurTraitee', 'debitCuve', 'ecartDiffuseurs'] },
  { id: 'chantier', titre: 'Travail du sol', partage: false,
    calculateurs: ['debitChantier'] }
];

function familleDe(calcId) {
  return FAMILLES_CALCULATEURS.find(f => f.calculateurs.includes(calcId)) || null;
}
/* Clé sous laquelle l'écran range les saisies d'un calculateur : la famille
   si elle partage, sinon le calculateur. Une mesure garde sa propre clé :
   la saisir dans « Volume par hectare » ou sur sa page, c'est la même. */
function cleSaisie(calcId) {
  const f = familleDe(calcId);
  return f && f.partage ? 'famille-' + f.id : calcId;
}

/* Calcul avec mesures (D-C2-3). `mesures` = { idEntree: valeurs du
   calculateur de mesure } pour les seules entrées que l'utilisateur mesure.
   Le premier résultat de la mesure devient la valeur de l'entrée ; ses
   étapes précèdent celles du calcul, ses alertes sont préfixées du libellé
   de l'entrée. Sans mesure, identique à compute. */
function prefixerAlerte(prefixe, a) {
  return typeof a === 'string' ? prefixe + a : alerteChiffree(prefixe + a.gabarit, a.operandes);
}
function calculer(calcId, valeurs, mesures) {
  const C = CALCULATEURS[calcId];
  if (!C) return null;
  const e = Object.assign({}, valeurs), m = mesures || {};
  const avant = [], alertesMesure = [], mesurees = {};
  C.entrees.forEach(en => {
    if (!en.mesure || !(en.id in m) || !CALCULATEURS[en.mesure]) return;
    const r = CALCULATEURS[en.mesure].compute(m[en.id] || {});
    const v = r.resultats[0].valeur;
    e[en.id] = v === null ? NaN : v;
    mesurees[en.id] = r.resultats[0];
    avant.push(...r.etapes);
    r.alertes.forEach(a => alertesMesure.push(prefixerAlerte(en.label + ' — ', a)));
  });
  const r = C.compute(e);
  // Mesure impossible et saisies directes correctes : l'alerte de saisie du
  // calcul principal redirait la même chose, moins précisément.
  const mesureEchouee = Object.keys(mesurees).some(id => mesurees[id].valeur === null);
  const directesOk = C.entrees.every(en => en.id in mesurees || en.type === 'liste' || positif(e[en.id]) > 0);
  const alertes = mesureEchouee && directesOk ? r.alertes.filter(a => a !== ALERTE_SAISIE) : r.alertes;
  return Object.assign({}, r, {
    etapes: avant.concat(r.etapes),
    alertes: alertesMesure.concat(alertes),
    mesurees
  });
}

/* Garde de schéma du registre : erreurs (chaînes), vide = conforme. Une
   entrée de type liste a un défaut tableau ; toute autre, un défaut nombre. */
function erreursRegistre(calculateurs) {
  const err = [];
  Object.keys(calculateurs || {}).forEach(k => {
    const c = calculateurs[k];
    if (!c || c.id !== k) { err.push(k + ' : id différent de la clé'); return; }
    (c.entrees || []).forEach(en => {
      const ou = k + '.' + (en && en.id);
      if (!en || !estTexte(en.id) || !estTexte(en.label)) err.push(ou + ' : id et libellé attendus');
      else if (en.type === 'liste') {
        if (!Array.isArray(en.defaut) || !en.defaut.every(x => typeof x === 'number' && Number.isFinite(x)))
          err.push(ou + ' : entrée liste sans défaut tableau de nombres');
      } else if (en.type !== undefined) err.push(ou + ' : type d\'entrée inconnu « ' + en.type + ' »');
      else if (typeof en.defaut !== 'number' || !Number.isFinite(en.defaut)) err.push(ou + ' : défaut numérique attendu');
      if (en && !estTexte(en.origineDefaut)) err.push(ou + ' : origine du défaut manquante');
      // D-C2-3 : une mesure existe, ne se mesure pas elle-même (pas de chaîne)
      // et fournit la grandeur de l'entrée, dans son unité.
      if (en && en.mesure !== undefined) {
        const M = calculateurs[en.mesure];
        if (!M) err.push(ou + ' : mesure inconnue « ' + en.mesure + ' »');
        else if ((M.entrees || []).some(x => x.mesure)) err.push(ou + ' : une mesure ne peut pas elle-même se mesurer');
        else if (en.type === 'liste') err.push(ou + ' : une entrée liste ne se mesure pas');
        else {
          const d = {}; M.entrees.forEach(x => { d[x.id] = x.defaut; });
          const r0 = M.compute(d).resultats[0];
          if (!r0 || r0.unite !== en.unite) err.push(ou + ' : unité de la mesure différente de celle de l\'entrée');
        }
      }
    });
    if (!estTexte(c.titreCourt)) err.push(k + ' : titre court manquant');
    if (!Array.isArray(c.technologies) || c.technologies.length === 0 ||
      !c.technologies.every(t => TECHNOLOGIES.includes(t)))
      err.push(k + ' : technologies hors du vocabulaire');
  });
  return err;
}

/* Garde des familles (D-C2-2) : chaque calculateur dans une et une seule
   famille ; dans une famille partagée, une même clé d'entrée a la même
   unité partout (sinon le partage mélangerait deux grandeurs). */
function erreursFamilles(familles, calculateurs) {
  const err = [], vus = {};
  (familles || []).forEach(f => {
    if (!f || !estTexte(f.id) || !estTexte(f.titre)) { err.push('famille sans id ni titre'); return; }
    const unites = {};
    (f.calculateurs || []).forEach(id => {
      const c = calculateurs[id];
      if (!c) { err.push(f.id + ' : calculateur inconnu « ' + id + ' »'); return; }
      if (vus[id]) err.push(id + ' : dans deux familles (' + vus[id] + ', ' + f.id + ')');
      vus[id] = f.id;
      if (f.partage) c.entrees.forEach(en => {
        if (en.id in unites && unites[en.id] !== en.unite)
          err.push(f.id + '.' + en.id + ' : unités différentes dans une famille partagée');
        unites[en.id] = en.unite;
      });
    });
  });
  Object.keys(calculateurs || {}).forEach(id => { if (!vus[id]) err.push(id + ' : dans aucune famille'); });
  return err;
}

/* Remplace chaque marqueur {i} du gabarit par textes[i]. Un marqueur sans
   texte correspondant reste tel quel (garde : ne lève pas). La vue passe
   des opérandes déjà formatés : le moteur ne formate toujours pas. */
function substituer(gabarit, textes) {
  const t = Array.isArray(textes) ? textes : [];
  return String(gabarit == null ? '' : gabarit).replace(/\{(\d+)\}/g, (m, i) =>
    (t[i] === undefined || t[i] === null) ? m : String(t[i]));
}

/* --- 4. Schéma du contenu ---------------------------------------------
   validerModule(m) → liste d'erreurs (chaînes) ; vide = module conforme.
   Ne lève jamais, quel que soit l'objet reçu. */

function estTexte(x) { return typeof x === 'string' && x.trim() !== ''; }
function doublons(ids) {
  const vus = new Set(), d = new Set();
  ids.forEach(id => { if (vus.has(id)) d.add(id); vus.add(id); });
  return [...d];
}

// Code de source : majuscules, chiffres, tirets (F-VHA, B20-1…) — D-B4-2.
const FORMAT_CODE_SOURCE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
// Un élément dont le texte visible contient un chiffre doit citer sa source
// pour qu'un module passe en « valide » (D-B4-3).
const CHIFFRE = /[0-9]/;

// Ligne de liste : chaîne, ou { texte, source?, lectureGraphique? } (D-B4-5).
function texteItem(it) { return (it && typeof it === 'object') ? it.texte : it; }

function validerSection(s, i, err, codes) {
  const ou = 'section ' + (s && s.id ? '« ' + s.id + ' »' : '#' + (i + 1));
  if (!s || typeof s !== 'object') { err.push(ou + ' : objet attendu'); return; }
  const connus = codes instanceof Set ? codes : new Set();
  // Toute référence `source` d'un élément doit exister dans les sources du module.
  const verifSource = (el, ici) => {
    if (el && typeof el === 'object' && el.source !== undefined && !(estTexte(el.source) && connus.has(el.source)))
      err.push(ici + ' : source inconnue « ' + el.source + ' »');
  };
  if (!estTexte(s.id)) err.push(ou + ' : id manquant');
  if (!estTexte(s.titre)) err.push(ou + ' : titre manquant');
  if (!TYPES_SECTION.includes(s.type)) { err.push(ou + ' : type inconnu « ' + s.type + ' »'); return; }
  if (s.technologie !== undefined && !TECHNOLOGIES.includes(s.technologie))
    err.push(ou + ' : technologie inconnue « ' + s.technologie + ' »');
  verifSource(s, ou);

  if (s.type === 'fiche') {
    if (!Array.isArray(s.blocs) || s.blocs.length === 0) { err.push(ou + ' : blocs manquants'); return; }
    s.blocs.forEach((b, j) => {
      const bo = ou + ' : bloc ' + (j + 1);
      if (!b || !TYPES_BLOC.includes(b.type)) { err.push(bo + ' de type inconnu'); return; }
      verifSource(b, bo);
      if (b.type === 'liste') {
        if (!(Array.isArray(b.items) && b.items.length && b.items.every(it => estTexte(texteItem(it))))) err.push(bo + ' vide');
        else b.items.forEach((it, k) => verifSource(it, bo + ', ligne ' + (k + 1)));
      } else if (b.type === 'tableau') {
        // D-B4-4 : en-têtes non vides, chaque ligne de la longueur des en-têtes.
        if (!(Array.isArray(b.entetes) && b.entetes.length && b.entetes.every(estTexte))) err.push(bo + ' : en-têtes manquants');
        else if (!(Array.isArray(b.lignes) && b.lignes.length)) err.push(bo + ' : lignes manquantes');
        else b.lignes.forEach((l, k) => {
          if (!Array.isArray(l) || l.length !== b.entetes.length)
            err.push(bo + ', ligne ' + (k + 1) + ' : ' + b.entetes.length + ' cellules attendues');
          else if (!l.every(c => typeof c === 'string')) err.push(bo + ', ligne ' + (k + 1) + ' : cellules texte attendues');
        });
      } else if (!estTexte(b.texte)) err.push(bo + ' vide');
    });
  } else if (s.type === 'procedure') {
    if (!Array.isArray(s.etapes) || s.etapes.length === 0) { err.push(ou + ' : étapes manquantes'); return; }
    s.etapes.forEach((e, j) => {
      if (!e || !estTexte(e.id) || !estTexte(e.texte)) err.push(ou + ' : étape ' + (j + 1) + ' incomplète');
      else verifSource(e, ou + ' : étape « ' + e.id + ' »');
    });
    doublons(s.etapes.map(e => e && e.id)).forEach(d => err.push(ou + ' : étape en double « ' + d + ' »'));
  } else if (s.type === 'entretien') {
    if (!Array.isArray(s.taches) || s.taches.length === 0) { err.push(ou + ' : tâches manquantes'); return; }
    s.taches.forEach((t, j) => {
      if (!t || !estTexte(t.id) || !estTexte(t.texte)) { err.push(ou + ' : tâche ' + (j + 1) + ' incomplète'); return; }
      if (!PERIODICITES.includes(t.periodicite)) err.push(ou + ' : périodicité inconnue « ' + t.periodicite + ' »');
      if (t.detail !== undefined && !estTexte(t.detail)) err.push(ou + ' : tâche « ' + t.id + ' » : détail vide');
      verifSource(t, ou + ' : tâche « ' + t.id + ' »');
    });
    doublons(s.taches.map(t => t && t.id)).forEach(d => err.push(ou + ' : tâche en double « ' + d + ' »'));
  } else if (s.type === 'calculateur') {
    if (!Object.prototype.hasOwnProperty.call(CALCULATEURS, s.calculateur))
      err.push(ou + ' : calculateur inconnu « ' + s.calculateur + ' »');
  } else if (s.type === 'quiz') {
    if (!Array.isArray(s.questions) || s.questions.length === 0) { err.push(ou + ' : questions manquantes'); return; }
    s.questions.forEach((q, j) => {
      const qu = ou + ' : question ' + (j + 1);
      if (!q || !estTexte(q.id) || !estTexte(q.enonce)) { err.push(qu + ' incomplète'); return; }
      if (!Array.isArray(q.choix) || q.choix.length < 2 || !q.choix.every(estTexte)) err.push(qu + ' : au moins 2 choix');
      else if (!Array.isArray(q.bonnes) || q.bonnes.length === 0 ||
        !q.bonnes.every(k => Number.isInteger(k) && k >= 0 && k < q.choix.length))
        err.push(qu + ' : bonnes réponses invalides');
      verifSource(q, qu);
    });
    doublons(s.questions.map(q => q && q.id)).forEach(d => err.push(ou + ' : question en double « ' + d + ' »'));
  } else if (s.type === 'cas') {
    if (!estTexte(s.situation)) err.push(ou + ' : situation manquante');
    if (!Array.isArray(s.options) || s.options.length < 2) { err.push(ou + ' : au moins 2 options'); return; }
    s.options.forEach((o, j) => {
      if (!o || !estTexte(o.texte) || !estTexte(o.retour) || typeof o.correct !== 'boolean')
        err.push(ou + ' : option ' + (j + 1) + ' incomplète');
      else verifSource(o, ou + ' : option ' + (j + 1));
    });
    if (!s.options.some(o => o && o.correct === true)) err.push(ou + ' : aucune option correcte');
  } else if (s.type === 'definitions') {
    // D-B10-1 : termes non vides et uniques, chaque définition sourcée.
    if (!Array.isArray(s.entrees) || s.entrees.length === 0) { err.push(ou + ' : entrées manquantes'); return; }
    s.entrees.forEach((d, j) => {
      const du = ou + ' : entrée ' + (j + 1);
      if (!d || !estTexte(d.id) || !estTexte(d.terme) || !estTexte(d.definition)) { err.push(du + ' incomplète'); return; }
      if (!estTexte(d.source)) err.push(du + ' (« ' + d.terme + ' ») : source obligatoire');
      else verifSource(d, du);
    });
    doublons(s.entrees.map(d => d && d.id)).forEach(d => err.push(ou + ' : entrée en double « ' + d + ' »'));
    doublons(s.entrees.map(d => d && typeof d.terme === 'string' ? d.terme.trim().toLowerCase() : d))
      .forEach(d => err.push(ou + ' : terme en double « ' + d + ' »'));
  } else if (s.type === 'exercice') {
    // D-B5-1 : la réponse attendue est calculée par un calculateur du moteur.
    if (!estTexte(s.enonce)) err.push(ou + ' : énoncé manquant');
    const C = Object.prototype.hasOwnProperty.call(CALCULATEURS, s.calculateur) ? CALCULATEURS[s.calculateur] : null;
    if (!C) { err.push(ou + ' : calculateur inconnu « ' + s.calculateur + ' »'); return; }
    const v = (s.valeurs && typeof s.valeurs === 'object') ? s.valeurs : {};
    const manquantes = C.entrees.filter(en => !Object.prototype.hasOwnProperty.call(v, en.id)).map(en => en.id);
    if (manquantes.length) err.push(ou + ' : valeurs manquantes (' + manquantes.join(', ') + ')');
    else {
      const n = C.compute(v).resultats.length;
      if (!Number.isInteger(s.resultat) || s.resultat < 0 || s.resultat >= n)
        err.push(ou + ' : indice de résultat invalide « ' + s.resultat + ' » (' + n + ' résultat' + (n > 1 ? 's' : '') + ')');
    }
  }
}

/* Éléments dont le texte visible contient un chiffre sans `source` (D-B4-3) :
   → [{ sectionId, element }]. Éléments : bloc (une liste sourcée couvre ses
   lignes, sinon chaque ligne compte), étape, tâche, question, option de cas,
   section (situation d'un cas, énoncé d'un exercice, introduction). Ne lève
   jamais. Erreur seulement pour un module « valide » ; sinon compté à
   l'écran. */
function elementsChiffresSansSource(m) {
  const res = [];
  if (!m || typeof m !== 'object' || !Array.isArray(m.sections)) return res;
  const chiffre = t => typeof t === 'string' && CHIFFRE.test(t);
  const noter = (sid, el, textes) => {
    const src = el && typeof el === 'object' ? el.source : undefined;
    if (!estTexte(src) && textes.some(chiffre)) res.push({ sectionId: sid, element: el });
  };
  m.sections.forEach(s => {
    if (!s || typeof s !== 'object') return;
    const sid = s.id;
    noter(sid, s, [s.intro, s.situation, s.enonce]);
    const liste = (x) => Array.isArray(x) ? x : [];
    if (s.type === 'fiche') liste(s.blocs).forEach(b => {
      if (!b || typeof b !== 'object') return;
      if (b.type === 'liste') {
        if (estTexte(b.source)) return;
        liste(b.items).forEach(it => noter(sid, it, [texteItem(it)]));
      } else if (b.type === 'tableau') {
        noter(sid, b, liste(b.entetes).concat(...liste(b.lignes).map(liste)));
      } else noter(sid, b, [b.texte]);
    });
    else if (s.type === 'procedure') liste(s.etapes).forEach(e => e && noter(sid, e, [e.texte, e.detail]));
    else if (s.type === 'entretien') liste(s.taches).forEach(t => t && noter(sid, t, [t.texte, t.detail]));
    else if (s.type === 'quiz') liste(s.questions).forEach(q => q && noter(sid, q, [q.enonce, q.explication].concat(liste(q.choix))));
    else if (s.type === 'cas') liste(s.options).forEach(o => o && noter(sid, o, [o.texte, o.retour]));
    else if (s.type === 'definitions') liste(s.entrees).forEach(d => d && noter(sid, d, [d.terme, d.definition]));
  });
  return res;
}

function validerModule(m) {
  const err = [];
  if (!m || typeof m !== 'object') return ['module : objet attendu'];
  if (!estTexte(m.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) err.push('id absent ou non conforme (minuscules, chiffres, tirets)');
  if (!estTexte(m.titre)) err.push('titre manquant');
  if (!estTexte(m.resume)) err.push('résumé manquant');
  if (!DOMAINES.includes(m.domaine)) err.push('domaine inconnu « ' + m.domaine + ' »');
  if (!STATUTS.includes(m.statut)) err.push('statut inconnu « ' + m.statut + ' »');
  const codes = new Set();
  if (!Array.isArray(m.sources)) err.push('sources : tableau attendu (vide autorisé hors statut validé)');
  else {
    m.sources.forEach((s, j) => {
      if (!s || !estTexte(s.reference) || !estTexte(s.date)) err.push('source ' + (j + 1) + ' : référence et date attendues');
      if (!s || !estTexte(s.code)) err.push('source ' + (j + 1) + ' : code manquant');
      else if (!FORMAT_CODE_SOURCE.test(s.code)) err.push('source ' + (j + 1) + ' : code « ' + s.code + ' » non conforme (majuscules, chiffres, tirets)');
      else codes.add(s.code);
    });
    doublons(m.sources.map(s => s && s.code).filter(estTexte)).forEach(d => err.push('source en double « ' + d + ' »'));
  }
  if (m.statut === 'valide') {
    if (!estTexte(m.valideur)) err.push('statut validé sans valideur nommé');
    if (!Array.isArray(m.sources) || m.sources.length === 0) err.push('statut validé sans source');
  }
  if (!Array.isArray(m.sections) || m.sections.length === 0) { err.push('sections manquantes'); return err; }
  m.sections.forEach((s, i) => validerSection(s, i, err, codes));
  doublons(m.sections.map(s => s && s.id)).forEach(d => err.push('section en double « ' + d + ' »'));
  if (m.statut === 'valide') {
    elementsChiffresSansSource(m).forEach(x => err.push('section « ' + x.sectionId + ' » : élément chiffré sans source (« ' +
      String(texteItem(x.element) || x.element.texte || x.element.enonce || x.element.situation || x.element.intro || '').slice(0, 40) + ' »)'));
  }
  return err;
}

/* --- 5. Quiz et exercices --------------------------------------------
   Une question est juste si l'ensemble des choix cochés égale exactement
   l'ensemble des bonnes réponses (ni oubli, ni choix en trop). */

function noterQuestion(question, reponses) {
  const bonnes = new Set((question && question.bonnes) || []);
  const rep = new Set(Array.isArray(reponses) ? reponses : []);
  if (bonnes.size === 0 || rep.size !== bonnes.size) return false;
  for (const k of rep) if (!bonnes.has(k)) return false;
  return true;
}

// reponses : { [questionId]: number[] } → { bonnes, total, taux, details }
function noterQuiz(section, reponses) {
  const qs = (section && Array.isArray(section.questions)) ? section.questions : [];
  const rep = reponses || {};
  const details = qs.map(q => ({ qid: q.id, juste: noterQuestion(q, rep[q.id]) }));
  const bonnes = details.filter(d => d.juste).length;
  return { bonnes, total: qs.length, taux: qs.length ? bonnes / qs.length : 0, details };
}

/* Réponse attendue d'un exercice : résultat n° `resultat` du calculateur
   appliqué aux `valeurs` de la section → { valeur, unite, decimales, etapes }
   (valeur null si non calculable). Ne lève jamais. */
function attenduExercice(section) {
  const vide = { valeur: null, unite: '', decimales: 0, etapes: [] };
  const C = section && Object.prototype.hasOwnProperty.call(CALCULATEURS, section.calculateur)
    ? CALCULATEURS[section.calculateur] : null;
  if (!C) return vide;
  const r = C.compute((section.valeurs && typeof section.valeurs === 'object') ? section.valeurs : {});
  const x = r.resultats[section.resultat];
  if (!x) return vide;
  return { valeur: x.valeur, unite: x.unite, decimales: x.decimales, etapes: r.etapes };
}

/* Correction (D-B5-2) : juste si la réponse, arrondie au nombre de
   décimales du résultat, égale l'attendu arrondi de même. Aucune tolérance
   arbitraire. Réponse non numérique ou non finie → faux. Ne lève jamais. */
function arrondi(x, d) { const f = Math.pow(10, d); return Math.round(x * f); }
function corrigerExercice(section, reponse) {
  const attendu = attenduExercice(section);
  const ok = typeof reponse === 'number' && Number.isFinite(reponse) && attendu.valeur !== null;
  return { juste: ok && arrondi(reponse, attendu.decimales) === arrondi(attendu.valeur, attendu.decimales), attendu };
}

/* --- 6. Progression -------------------------------------------------
   Réducteurs purs : ils renvoient un NOUVEL objet, ou l'objet reçu tel quel
   quand rien ne change (la vue peut comparer par référence).
   Forme : { version: 1, modules: { [moduleId]: { vues: [sectionId],
     etapes: { [sectionId]: [etapeId] }, taches: { [sectionId]: [tacheId] },
     quiz: { [sectionId]: { taux, bonnes, total, date } } } } } */

const VERSION_PROGRESSION = 1;

function progressionVide() { return { version: VERSION_PROGRESSION, modules: {} }; }

function lireModuleProg(p, moduleId) {
  const m = (p && p.modules && p.modules[moduleId]) || {};
  return {
    vues: Array.isArray(m.vues) ? m.vues : [],
    etapes: (m.etapes && typeof m.etapes === 'object') ? m.etapes : {},
    taches: (m.taches && typeof m.taches === 'object') ? m.taches : {},
    quiz: (m.quiz && typeof m.quiz === 'object') ? m.quiz : {}
  };
}
function avecModuleProg(p, moduleId, m) {
  return { version: VERSION_PROGRESSION, modules: { ...((p && p.modules) || {}), [moduleId]: m } };
}
function basculerDans(liste, id) {
  const l = Array.isArray(liste) ? liste : [];
  return l.includes(id) ? l.filter(x => x !== id) : [...l, id];
}

function marquerVue(p, moduleId, sectionId) {
  const m = lireModuleProg(p, moduleId);
  if (m.vues.includes(sectionId)) return p;
  return avecModuleProg(p, moduleId, { ...m, vues: [...m.vues, sectionId] });
}

function basculerEtape(p, moduleId, sectionId, etapeId) {
  const m = lireModuleProg(p, moduleId);
  return avecModuleProg(p, moduleId,
    { ...m, etapes: { ...m.etapes, [sectionId]: basculerDans(m.etapes[sectionId], etapeId) } });
}

function basculerTache(p, moduleId, sectionId, tacheId) {
  const m = lireModuleProg(p, moduleId);
  return avecModuleProg(p, moduleId,
    { ...m, taches: { ...m.taches, [sectionId]: basculerDans(m.taches[sectionId], tacheId) } });
}

/* Dernier score du quiz. dateISO est fourni par l'appelant (le moteur ne
   lit pas l'horloge) ; absent ou non-chaîne → null, sans lever. */
function enregistrerQuiz(p, moduleId, sectionId, score, dateISO) {
  const m = lireModuleProg(p, moduleId);
  const sc = score || {};
  const entree = {
    taux: Number.isFinite(sc.taux) ? sc.taux : 0,
    bonnes: Number.isFinite(sc.bonnes) ? sc.bonnes : null,
    total: Number.isFinite(sc.total) ? sc.total : null,
    date: typeof dateISO === 'string' ? dateISO : null
  };
  return avecModuleProg(p, moduleId, { ...m, quiz: { ...m.quiz, [sectionId]: entree } });
}

/* Lecture de la progression d'une section, toujours de même forme :
   { vue, etapes: [id], taches: [id], quiz: { taux, bonnes, total, date } | null }. */
function progressionSection(p, moduleId, sectionId) {
  const m = lireModuleProg(p, moduleId);
  return {
    vue: m.vues.includes(sectionId),
    etapes: Array.isArray(m.etapes[sectionId]) ? m.etapes[sectionId] : [],
    taches: Array.isArray(m.taches[sectionId]) ? m.taches[sectionId] : [],
    quiz: m.quiz[sectionId] || null
  };
}

// Sections consultées du module, parmi ses sections actuelles.
function avancement(p, module) {
  const sections = (module && Array.isArray(module.sections)) ? module.sections : [];
  const vues = lireModuleProg(p, module && module.id).vues;
  const n = sections.filter(s => vues.includes(s.id)).length;
  return { vues: n, total: sections.length, taux: sections.length ? n / sections.length : 0 };
}

// Module de référence (glossaire) : ni avancement, ni état, ni catalogue.
function estModuleReference(m) { return !!m && m.domaine === 'transversal'; }

/* ASSUMÉ — formation, pas certification : tentatives illimitées, toutes les
   réponses justes (dernier taux ≥ 1). À trancher par le référent
   pédagogique si un usage certifiant apparaît (D-B6-2, arbitrage A4). */
const SEUIL_MAITRISE = 1;

// Sections qui se réussissent : quiz et exercices.
function sectionsEvaluees(module) {
  const sections = (module && Array.isArray(module.sections)) ? module.sections : [];
  return sections.filter(s => s && (s.type === 'quiz' || s.type === 'exercice'));
}

// { reussies, total } : sections évaluées dont le dernier taux atteint SEUIL_MAITRISE.
function bilanEvaluation(p, module) {
  const ev = sectionsEvaluees(module);
  const quiz = lireModuleProg(p, module && module.id).quiz;
  const reussies = ev.filter(s => {
    const q = quiz[s.id];
    return !!q && Number.isFinite(q.taux) && q.taux >= SEUIL_MAITRISE;
  }).length;
  return { reussies, total: ev.length };
}

/* non-commence → en-cours → consulte (toutes les sections ouvertes) →
   maitrise (en plus, toutes les sections évaluées réussies). Un module sans
   quiz ni exercice plafonne à « consulte » (D-B6-3). */
function etatModule(p, module) {
  const a = avancement(p, module);
  if (a.vues === 0) return 'non-commence';
  if (a.vues < a.total) return 'en-cours';
  const b = bilanEvaluation(p, module);
  return b.total > 0 && b.reussies >= b.total ? 'maitrise' : 'consulte';
}

/* Où reprendre le parcours (bloc « Reprendre » du catalogue, révision v3) :
   a) premier module non maîtrisé ayant au moins une section vue ; sinon
   b) premier module non maîtrisé ; section = première non vue, sinon la
   première. Modules de référence et modules sans section exclus.
   → { moduleId, sectionId, entame } ou null si tout est maîtrisé. */
function prochaineReprise(p, liste) {
  const candidats = (Array.isArray(liste) ? liste : []).filter(m =>
    m && !estModuleReference(m) && Array.isArray(m.sections) && m.sections.length > 0 &&
    etatModule(p, m) !== 'maitrise');
  const entame = candidats.find(m => avancement(p, m).vues > 0);
  const m = entame || candidats[0];
  if (!m) return null;
  const vues = lireModuleProg(p, m.id).vues;
  const s = m.sections.find(x => !vues.includes(x.id)) || m.sections[0];
  return { moduleId: m.id, sectionId: s.id, entame: !!entame };
}

/* --- 7. Registre de contenu ------------------------------------------
   Le contenu vit hors du moteur (contenu/<id>.js), pour que des experts le
   rédigent sans toucher au code. */

/* Date d'édition du contenu (ISO), affichée en pied de page (D-B6-4) : à
   changer à CHAQUE modification de contenu/, et à reporter dans la section
   « Édition du contenu » du README (test statique). */
const EDITION_CONTENU = '2026-09-23';

/* SEUL ACCÈS GLOBAL DU MOTEUR. Lu au moment de l'appel, jamais à la
   définition : l'ordre de chargement des scripts de <helmet> n'est pas
   garanti. Node : contenu/index.js ; navigateur : window.OAD_CONTENU,
   rempli par chaque fichier de contenu.
   Dans le navigateur, chaque script de <helmet> s'exécute deux fois (à la
   lecture de la page, puis réinjecté par le runtime) : un même module arrive
   donc deux fois. On garde la première occurrence de chaque id. Sous Node,
   aucun dédoublonnage : un id en double reste visible d'erreursContenu. */
function modules() {
  if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {
    return require('./contenu/index.js');
  }
  const w = (typeof window !== 'undefined') ? window : {};
  const brut = Array.isArray(w.OAD_CONTENU) ? w.OAD_CONTENU : [];
  const vus = new Set();
  return brut.filter(m => {
    const id = m && m.id;
    if (vus.has(id)) return false;
    vus.add(id);
    return true;
  });
}

/* Remet les modules dans l'ordre du catalogue (liste d'ids). Dans le
   navigateur, les fichiers de contenu arrivent dans l'ordre de fin de
   chargement ; la vue fournit l'ordre déclaré dans <helmet>. Ids inconnus :
   en fin de liste, ordre d'arrivée conservé. */
function ordonnerModules(liste, ordre) {
  const ids = Array.isArray(ordre) ? ordre : [];
  const rang = m => { const i = ids.indexOf(m && m.id); return i < 0 ? ids.length : i; };
  return (Array.isArray(liste) ? liste : [])
    .map((m, i) => ({ m, i }))
    .sort((a, b) => (rang(a.m) - rang(b.m)) || (a.i - b.i))
    .map(x => x.m);
}

// Erreurs de tout le contenu, préfixées par le module ; ids en double inclus.
function erreursContenu(liste) {
  const mods = Array.isArray(liste) ? liste : [];
  const err = [];
  mods.forEach((m, i) => {
    const nom = (m && estTexte(m.id)) ? m.id : 'module #' + (i + 1);
    validerModule(m).forEach(e => err.push(nom + ' : ' + e));
  });
  doublons(mods.map(m => m && m.id)).forEach(d => err.push('module en double « ' + d + ' »'));
  // Quiz, cas, exercices : l'id de section est une clé d'état de l'écran.
  const evalues = [];
  mods.forEach(m => (m && Array.isArray(m.sections) ? m.sections : []).forEach(s => {
    if (s && TYPES_SECTION_EVALUES.includes(s.type)) evalues.push(s.id);
  }));
  doublons(evalues).forEach(d => err.push('section « ' + d + ' » en double sur le catalogue (quiz, cas ou exercice)'));
  return err;
}

// filtre : { domaine?, statut? } ; absent = tous.
function listerModules(liste, filtre) {
  const f = filtre || {};
  return (Array.isArray(liste) ? liste : []).filter(m => m &&
    (!f.domaine || m.domaine === f.domaine) && (!f.statut || m.statut === f.statut));
}

function trouverModule(liste, id) {
  return (Array.isArray(liste) ? liste : []).find(m => m && m.id === id) || null;
}

function trouverSection(liste, moduleId, sectionId) {
  const m = trouverModule(liste, moduleId);
  if (!m || !Array.isArray(m.sections)) return null;
  return m.sections.find(s => s && s.id === sectionId) || null;
}

/* --- 8. Routes -------------------------------------------------------
   Navigation par hash : #/ · #/module/<id>[/<section>] · #/outils[/<calc>]
   · #/progression. Le hash ne porte que des identifiants, jamais une
   saisie. Paramètre obligatoire : le moteur ne lit pas location. */

function lireRoute(hash) {
  const brut = String(hash == null ? '' : hash).replace(/^#\/?/, '');
  const seg = brut.split('/').filter(Boolean).map(s => {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  });
  if (seg[0] === 'module' && seg[1]) {
    return { vue: 'module', moduleId: seg[1], sectionId: seg[2] || null };
  }
  if (seg[0] === 'outils') return { vue: 'outils', calcId: seg[1] || null };
  if (seg[0] === 'progression') return { vue: 'progression' };
  return { vue: 'catalogue' };
}

function lien(...segments) {
  return '#/' + segments.filter(s => s !== null && s !== undefined && s !== '')
    .map(s => encodeURIComponent(String(s))).join('/');
}

/* --- 9. Exports ------------------------------------------------------- */

const OAD = {
  // vocabulaires
  DOMAINES, DOMAINES_LIBELLES, STATUTS, STATUTS_LIBELLES,
  TYPES_SECTION, TYPES_SECTION_LIBELLES, TYPES_BLOC, TECHNOLOGIES, TECHNOLOGIES_LIBELLES,
  PERIODICITES, PERIODICITES_LIBELLES, ETATS_MODULE, ETATS_MODULE_LIBELLES,
  // formules
  volumeHectare, debitTotalPourVolume, debitParBuse, ajustementPuissance,
  pressionPourVolume, vitesseMesuree, debitChantierTheorique,
  largeurTraitee, debitParNiveauCuve, volumeSelonHauteurs, volumeApresChangementVitesse,
  vitessePourVolume, ECART_DIFFUSEUR_MAX, ecartsALaMoyenne,
  // calculateurs
  CALCULATEURS, FAMILLES_CALCULATEURS, familleDe, cleSaisie, calculer,
  erreursRegistre, erreursFamilles, substituer,
  // schéma, quiz, progression
  TYPES_SECTION_EVALUES,
  validerModule, elementsChiffresSansSource, noterQuestion, noterQuiz, attenduExercice, corrigerExercice,
  VERSION_PROGRESSION, progressionVide, marquerVue, basculerEtape, basculerTache,
  enregistrerQuiz, progressionSection, avancement, etatModule, prochaineReprise,
  SEUIL_MAITRISE, sectionsEvaluees, bilanEvaluation, estModuleReference, EDITION_CONTENU,
  // registre de contenu, routes
  modules, ordonnerModules, erreursContenu, listerModules, trouverModule, trouverSection,
  lireRoute, lien
};

if (typeof module !== 'undefined' && module.exports) module.exports = OAD;
if (typeof window !== 'undefined') window.OAD = OAD;

}
