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

const DOMAINES = ['pulverisation', 'travail-du-sol'];
const DOMAINES_LIBELLES = {
  pulverisation: 'Pulvérisation',
  'travail-du-sol': 'Travail du sol'
};

// Un module « valide » exige un valideur nommé et au moins une source (voir
// validerModule) : le statut n'est jamais déclaratif seul.
const STATUTS = ['brouillon', 'a-valider', 'valide'];
const STATUTS_LIBELLES = {
  brouillon: 'Brouillon',
  'a-valider': 'À valider',
  valide: 'Validé'
};

const TYPES_SECTION = ['fiche', 'procedure', 'entretien', 'calculateur', 'quiz', 'cas'];
const TYPES_SECTION_LIBELLES = {
  fiche: 'Fiche',
  procedure: 'Procédure',
  entretien: 'Entretien',
  calculateur: 'Calculateur',
  quiz: 'Quiz',
  cas: 'Cas pratique'
};

const TYPES_BLOC = ['paragraphe', 'liste', 'alerte', 'formule'];

const PERIODICITES = ['chaque-utilisation', 'quotidienne', 'hebdomadaire',
  'debut-campagne', 'fin-campagne', 'annuelle'];
const PERIODICITES_LIBELLES = {
  'chaque-utilisation': 'Après chaque utilisation',
  quotidienne: 'Chaque jour',
  hebdomadaire: 'Chaque semaine',
  'debut-campagne': 'En début de campagne',
  'fin-campagne': 'En fin de campagne',
  annuelle: 'Chaque année'
};

const ETATS_MODULE = ['non-commence', 'en-cours', 'termine'];
const ETATS_MODULE_LIBELLES = {
  'non-commence': 'Non commencé',
  'en-cours': 'En cours',
  termine: 'Terminé'
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

/* --- 3. Registre des calculateurs ------------------------------------
   Chaque calculateur : entrées (avec l'origine de leur valeur par défaut)
   et compute(valeurs numériques) → { etapes, resultats, alertes }.
   Sorties BRUTES : la vue formate une seule fois, en fr-FR.
     etape    = { titre, formule, gabarit, operandes, resultat }
     gabarit  = substitution à marqueurs positionnels {0}, {1}…
     operande = { valeur, decimales }
     resultat = { valeur, unite, decimales }
   Une valeur non calculable vaut null (jamais NaN en sortie). */

// ASSUMÉ — plage non documentée ; semble reprendre l'étendue de la courbe
// ATR du test IFV (1 à 25 bar), sans source. À trancher par le valideur
// pulvérisation (O4).
const PLAGE_PRESSION_ALERTE_BAR = [1, 25];

const ORIGINE_ASSUME = 'ASSUMÉ — exemple pédagogique, à confirmer par le valideur (O4)';
const ORIGINE_EXEMPLE = 'Exemple de calcul, sans valeur de réglage';
const ORIGINE_B_IFV = 'Valeur fixe de l\'outil IFV Mon réglage pulvé (code lu le 22/09/2026)';

const ALERTE_SAISIE = 'Calcul impossible : chaque valeur doit être un nombre strictement positif.';

function sortie(x) { return Number.isFinite(x) ? x : null; }
function operande(valeur, decimales) { return { valeur: sortie(valeur), decimales }; }
function etape(titre, formule, gabarit, operandes, valeur, unite, decimales) {
  return { titre, formule, gabarit, operandes, resultat: { valeur: sortie(valeur), unite, decimales } };
}
function resultat(label, valeur, unite, decimales) {
  return { label, valeur: sortie(valeur), unite, decimales };
}
function alertesSaisie(resultats) {
  return resultats.some(r => r.valeur === null) ? [ALERTE_SAISIE] : [];
}

const CALCULATEURS = {
  volHa: {
    id: 'volHa',
    titre: 'Volume par hectare',
    description: 'Volume de bouillie épandu à partir du débit mesuré, de la vitesse et de la largeur traitée.',
    entrees: [
      { id: 'Q', label: 'Débit total de la rampe', unite: 'L/min', defaut: 6, origineDefaut: ORIGINE_ASSUME },
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 6, origineDefaut: ORIGINE_ASSUME },
      { id: 'L', label: 'Largeur traitée', unite: 'm', defaut: 2.5, origineDefaut: ORIGINE_ASSUME }
    ],
    compute(e) {
      const V = volumeHectare(e.Q, e.v, e.L);
      const resultats = [resultat('Volume par hectare', V, 'L/ha', 0)];
      return {
        etapes: [etape('Volume épandu', 'V = 600 × Q / (v × L)', '600 × {0} / ({1} × {2})',
          [operande(e.Q, 2), operande(e.v, 1), operande(e.L, 2)], V, 'L/ha', 0)],
        resultats,
        alertes: alertesSaisie(resultats)
      };
    }
  },

  debitBuse: {
    id: 'debitBuse',
    titre: 'Débit par buse pour un volume visé',
    description: 'Débit que chaque buse doit fournir pour épandre le volume visé à la vitesse et la largeur données.',
    entrees: [
      { id: 'V', label: 'Volume visé', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_ASSUME },
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 6, origineDefaut: ORIGINE_ASSUME },
      { id: 'L', label: 'Largeur traitée', unite: 'm', defaut: 2.5, origineDefaut: ORIGINE_ASSUME },
      { id: 'n', label: 'Nombre de buses ouvertes', unite: 'buses', defaut: 12, origineDefaut: ORIGINE_ASSUME }
    ],
    compute(e) {
      const Q = debitTotalPourVolume(e.V, e.v, e.L);
      const q = debitParBuse(e.V, e.v, e.L, e.n);
      const resultats = [
        resultat('Débit total de la rampe', Q, 'L/min', 2),
        resultat('Débit par buse', q, 'L/min', 2)
      ];
      return {
        etapes: [
          etape('Débit total', 'Q = V × v × L / 600', '{0} × {1} × {2} / 600',
            [operande(e.V, 0), operande(e.v, 1), operande(e.L, 2)], Q, 'L/min', 2),
          etape('Débit par buse', 'q = Q / n', '{0} / {1}',
            [operande(Q, 2), operande(Math.round(Number(e.n)), 0)], q, 'L/min', 2)
        ],
        resultats,
        alertes: alertesSaisie(resultats)
      };
    }
  },

  pressionPourVolume: {
    id: 'pressionPourVolume',
    titre: 'Pression pour un nouveau volume',
    description: 'Pression à régler pour passer d\'un volume à un autre sans changer de buse ni de vitesse.',
    entrees: [
      { id: 'P1', label: 'Pression actuelle', unite: 'bar', defaut: 8, origineDefaut: ORIGINE_ASSUME },
      { id: 'V1', label: 'Volume actuel', unite: 'L/ha', defaut: 150, origineDefaut: ORIGINE_ASSUME },
      { id: 'V2', label: 'Volume visé', unite: 'L/ha', defaut: 180, origineDefaut: ORIGINE_ASSUME },
      { id: 'b', label: 'Exposant débit–pression de la buse (b)', unite: '', defaut: 0.5, origineDefaut: ORIGINE_B_IFV }
    ],
    compute(e) {
      const r = positif(e.V2) / positif(e.V1);
      const P2 = pressionPourVolume(e.P1, e.V1, e.V2, e.b);
      const resultats = [resultat('Pression à régler', P2, 'bar', 1)];
      const alertes = alertesSaisie(resultats);
      const [pMin, pMax] = PLAGE_PRESSION_ALERTE_BAR;
      if (resultats[0].valeur !== null && (P2 < pMin || P2 > pMax)) {
        alertes.push('Pression calculée hors de la plage ' + pMin + ' à ' + pMax +
          ' bar : vérifier la plage d\'utilisation de la buse.');
      }
      return {
        etapes: [
          etape('Rapport des volumes', 'r = V2 / V1', '{0} / {1}',
            [operande(e.V2, 0), operande(e.V1, 0)], r, '', 3),
          etape('Pression à régler', 'P2 = P1 × r^(1 / b)', '{0} × {1}^(1 / {2})',
            [operande(e.P1, 2), operande(r, 3), operande(e.b, 2)], P2, 'bar', 1)
        ],
        resultats,
        alertes
      };
    }
  },

  vitesseMesuree: {
    id: 'vitesseMesuree',
    titre: 'Vitesse réelle mesurée',
    description: 'Vitesse d\'avancement mesurée sur une distance balisée, en conditions de travail.',
    entrees: [
      { id: 'd', label: 'Distance parcourue', unite: 'm', defaut: 100, origineDefaut: ORIGINE_EXEMPLE },
      { id: 't', label: 'Temps mesuré', unite: 's', defaut: 60, origineDefaut: ORIGINE_EXEMPLE }
    ],
    compute(e) {
      const v = vitesseMesuree(e.d, e.t);
      const resultats = [resultat('Vitesse réelle', v, 'km/h', 1)];
      return {
        etapes: [etape('Vitesse', 'v = 3,6 × d / t', '3,6 × {0} / {1}',
          [operande(e.d, 1), operande(e.t, 1)], v, 'km/h', 1)],
        resultats,
        alertes: alertesSaisie(resultats)
      };
    }
  },

  debitChantier: {
    id: 'debitChantier',
    titre: 'Débit de chantier théorique',
    description: 'Surface travaillée par heure, sans temps morts ni demi-tours : un plafond, jamais atteint au champ.',
    entrees: [
      { id: 'v', label: 'Vitesse d\'avancement', unite: 'km/h', defaut: 6, origineDefaut: ORIGINE_ASSUME },
      { id: 'L', label: 'Largeur travaillée', unite: 'm', defaut: 2.5, origineDefaut: ORIGINE_ASSUME }
    ],
    compute(e) {
      const S = debitChantierTheorique(e.v, e.L);
      const resultats = [resultat('Débit de chantier théorique', S, 'ha/h', 2)];
      return {
        etapes: [etape('Débit de chantier', 'S = v × L / 10', '{0} × {1} / 10',
          [operande(e.v, 1), operande(e.L, 2)], S, 'ha/h', 2)],
        resultats,
        alertes: alertesSaisie(resultats)
      };
    }
  }
};

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

function validerSection(s, i, err) {
  const ou = 'section ' + (s && s.id ? '« ' + s.id + ' »' : '#' + (i + 1));
  if (!s || typeof s !== 'object') { err.push(ou + ' : objet attendu'); return; }
  if (!estTexte(s.id)) err.push(ou + ' : id manquant');
  if (!estTexte(s.titre)) err.push(ou + ' : titre manquant');
  if (!TYPES_SECTION.includes(s.type)) { err.push(ou + ' : type inconnu « ' + s.type + ' »'); return; }

  if (s.type === 'fiche') {
    if (!Array.isArray(s.blocs) || s.blocs.length === 0) { err.push(ou + ' : blocs manquants'); return; }
    s.blocs.forEach((b, j) => {
      if (!b || !TYPES_BLOC.includes(b.type)) err.push(ou + ' : bloc ' + (j + 1) + ' de type inconnu');
      else if (b.type === 'liste' ? !(Array.isArray(b.items) && b.items.length && b.items.every(estTexte)) : !estTexte(b.texte))
        err.push(ou + ' : bloc ' + (j + 1) + ' vide');
    });
  } else if (s.type === 'procedure') {
    if (!Array.isArray(s.etapes) || s.etapes.length === 0) { err.push(ou + ' : étapes manquantes'); return; }
    s.etapes.forEach((e, j) => {
      if (!e || !estTexte(e.id) || !estTexte(e.texte)) err.push(ou + ' : étape ' + (j + 1) + ' incomplète');
    });
    doublons(s.etapes.map(e => e && e.id)).forEach(d => err.push(ou + ' : étape en double « ' + d + ' »'));
  } else if (s.type === 'entretien') {
    if (!Array.isArray(s.taches) || s.taches.length === 0) { err.push(ou + ' : tâches manquantes'); return; }
    s.taches.forEach((t, j) => {
      if (!t || !estTexte(t.id) || !estTexte(t.texte)) err.push(ou + ' : tâche ' + (j + 1) + ' incomplète');
      else if (!PERIODICITES.includes(t.periodicite)) err.push(ou + ' : périodicité inconnue « ' + t.periodicite + ' »');
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
    });
    doublons(s.questions.map(q => q && q.id)).forEach(d => err.push(ou + ' : question en double « ' + d + ' »'));
  } else if (s.type === 'cas') {
    if (!estTexte(s.situation)) err.push(ou + ' : situation manquante');
    if (!Array.isArray(s.options) || s.options.length < 2) { err.push(ou + ' : au moins 2 options'); return; }
    s.options.forEach((o, j) => {
      if (!o || !estTexte(o.texte) || !estTexte(o.retour) || typeof o.correct !== 'boolean')
        err.push(ou + ' : option ' + (j + 1) + ' incomplète');
    });
    if (!s.options.some(o => o && o.correct === true)) err.push(ou + ' : aucune option correcte');
  }
}

function validerModule(m) {
  const err = [];
  if (!m || typeof m !== 'object') return ['module : objet attendu'];
  if (!estTexte(m.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) err.push('id absent ou non conforme (minuscules, chiffres, tirets)');
  if (!estTexte(m.titre)) err.push('titre manquant');
  if (!estTexte(m.resume)) err.push('résumé manquant');
  if (!DOMAINES.includes(m.domaine)) err.push('domaine inconnu « ' + m.domaine + ' »');
  if (!STATUTS.includes(m.statut)) err.push('statut inconnu « ' + m.statut + ' »');
  if (!Array.isArray(m.sources)) err.push('sources : tableau attendu (vide autorisé hors statut validé)');
  else m.sources.forEach((s, j) => {
    if (!s || !estTexte(s.reference) || !estTexte(s.date)) err.push('source ' + (j + 1) + ' : référence et date attendues');
  });
  if (m.statut === 'valide') {
    if (!estTexte(m.valideur)) err.push('statut validé sans valideur nommé');
    if (!Array.isArray(m.sources) || m.sources.length === 0) err.push('statut validé sans source');
  }
  if (!Array.isArray(m.sections) || m.sections.length === 0) { err.push('sections manquantes'); return err; }
  m.sections.forEach((s, i) => validerSection(s, i, err));
  doublons(m.sections.map(s => s && s.id)).forEach(d => err.push('section en double « ' + d + ' »'));
  return err;
}

/* --- 5. Quiz ------------------------------------------------------------
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

function etatModule(p, module) {
  const a = avancement(p, module);
  if (a.vues === 0) return 'non-commence';
  return a.vues >= a.total ? 'termine' : 'en-cours';
}

/* --- 7. Registre de contenu ------------------------------------------
   Le contenu vit hors du moteur (contenu/<id>.js), pour que des experts le
   rédigent sans toucher au code. */

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
  TYPES_SECTION, TYPES_SECTION_LIBELLES, TYPES_BLOC,
  PERIODICITES, PERIODICITES_LIBELLES, ETATS_MODULE, ETATS_MODULE_LIBELLES,
  // formules
  volumeHectare, debitTotalPourVolume, debitParBuse, ajustementPuissance,
  pressionPourVolume, vitesseMesuree, debitChantierTheorique,
  // calculateurs
  PLAGE_PRESSION_ALERTE_BAR, CALCULATEURS, substituer,
  // schéma, quiz, progression
  validerModule, noterQuestion, noterQuiz,
  VERSION_PROGRESSION, progressionVide, marquerVue, basculerEtape, basculerTache,
  enregistrerQuiz, progressionSection, avancement, etatModule,
  // registre de contenu, routes
  modules, ordonnerModules, erreursContenu, listerModules, trouverModule, trouverSection,
  lireRoute, lien
};

if (typeof module !== 'undefined' && module.exports) module.exports = OAD;
if (typeof window !== 'undefined') window.OAD = OAD;

}
