/* =====================================================================
 * tests/parite.test.js — Formation machines
 *
 * Ces tests FIGENT le comportement observé du moteur et de l'écran à la
 * date où ils sont écrits (23/09/2026), défauts connus compris. Un test qui
 * passe signifie « l'outil calcule la même chose qu'avant », pas « l'outil
 * calcule juste ».
 *
 * Familles :
 *   §1–§4 tests du moteur (require de moteur-oad.js) ;
 *   §5    tests STATIQUES d'index.html et des fichiers figés (lecture du
 *         texte) : contraintes techniques qui, sinon, dérivent en silence ;
 *   §6    rendu à blanc du composant, route par route (DCLogic et React
 *         simulés) : attrape les exceptions et les clés de gabarit absentes.
 *
 * Nommage : « LIMITE ASSUMÉE — … » documente une limite ; « FAIBLESSE
 * CONNUE — … » un défaut non corrigé. Une valeur attendue modifiée
 * volontairement porte un commentaire : pourquoi, et quel prompt l'a
 * décidé. Jamais de mise à jour silencieuse.
 *
 * Exécution : node tests/parite.test.js — aucune dépendance.
 * ===================================================================== */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');
const RACINE = path.join(__dirname, '..');
const OAD = require(path.join(RACINE, 'moteur-oad.js'));

let passed = 0, failed = 0, skipped = 0;
function section(name) { console.log('\n' + name); }
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   - ' + name); }
  catch (err) { failed++; console.log('  FAIL - ' + name + '\n         ' + err.message); }
}
// Test volontairement non exécuté : documente un comportement à corriger.
function skip(name, _fn, reason) {
  skipped++; console.log('  SKIP - ' + name + (reason ? ' (' + reason + ')' : ''));
}
function assertClose(actual, expected, eps, msg) {
  assert.ok(Math.abs(actual - expected) <= eps,
    (msg ? msg + ' — ' : '') + `attendu ≈ ${expected}, obtenu ${actual}`);
}
function defauts(calc) {
  const d = {};
  calc.entrees.forEach(e => { d[e.id] = e.defaut; });
  return d;
}
const MODULES = OAD.modules();

// ----------------------------------------------------------------------
section('§1 Formules');
// Valeurs attendues calculées À LA MAIN et écrites en dur.

test('volumeHectare(6 L/min, 6 km/h, 2,5 m) = 600 × 6 / (6 × 2,5) = 240 L/ha', () => {
  assert.strictEqual(OAD.volumeHectare(6, 6, 2.5), 240);
});
test('volumeHectare(12, 6, 2,5) = 600 × 12 / 15 = 480 L/ha (critère de recette)', () => {
  assert.strictEqual(OAD.volumeHectare(12, 6, 2.5), 480);
});
test('debitTotalPourVolume(150 L/ha, 6, 2,5) = 150 × 6 × 2,5 / 600 = 3,75 L/min', () => {
  assertClose(OAD.debitTotalPourVolume(150, 6, 2.5), 3.75, 1e-12);
});
test('debitParBuse(150, 6, 2,5, 12) = 3,75 / 12 = 0,3125 L/min', () => {
  assertClose(OAD.debitParBuse(150, 6, 2.5, 12), 0.3125, 1e-12);
});
test('aller-retour : volumeHectare(debitTotalPourVolume(V)) = V', () => {
  assertClose(OAD.volumeHectare(OAD.debitTotalPourVolume(173, 5.4, 2.2), 5.4, 2.2), 173, 1e-9);
});
test('ajustementPuissance(8, 1,2, 2) = 8 × 1,44 = 11,52', () => {
  assertClose(OAD.ajustementPuissance(8, 1.2, 2), 11.52, 1e-9);
});
test('pressionPourVolume(8 bar, 150 → 180 L/ha, b = 0,5) = 8 × (180/150)² = 11,52 bar', () => {
  assertClose(OAD.pressionPourVolume(8, 150, 180, 0.5), 11.52, 1e-9);
});
test('pressionPourVolume : volume inchangé ⇒ pression inchangée', () => {
  assertClose(OAD.pressionPourVolume(8, 150, 150, 0.5), 8, 1e-12);
});
test('vitesseMesuree(100 m, 60 s) = 3,6 × 100 / 60 = 6 km/h', () => {
  assertClose(OAD.vitesseMesuree(100, 60), 6, 1e-12);
});
test('debitChantierTheorique(6 km/h, 2,5 m) = 6 × 2,5 / 10 = 1,5 ha/h', () => {
  assertClose(OAD.debitChantierTheorique(6, 2.5), 1.5, 1e-12);
});
test('saisie nulle, négative, vide ou illisible : NaN, jamais d\'exception', () => {
  [[6, 0, 2.5], [6, -6, 2.5], ['', 6, 2.5], ['abc', 6, 2.5], [undefined, 6, 2.5]].forEach(a => {
    assert.ok(Number.isNaN(OAD.volumeHectare(...a)), JSON.stringify(a));
  });
  assert.ok(Number.isNaN(OAD.debitParBuse(150, 6, 2.5, 0)));
  assert.ok(Number.isNaN(OAD.pressionPourVolume(8, 150, 180, 0)));
  assert.ok(Number.isNaN(OAD.vitesseMesuree(100, 0)));
});
test('chaque calculateur du registre calcule avec ses valeurs par défaut', () => {
  Object.values(OAD.CALCULATEURS).forEach(c => {
    const r = c.compute(defauts(c));
    assert.ok(r.etapes.length >= 1 && r.resultats.length >= 1, c.id);
    assert.deepStrictEqual(r.alertes, [], c.id + ' : aucune alerte attendue avec les défauts');
    // A2 : sorties brutes finies (D-A2-1).
    r.etapes.forEach(et => {
      et.operandes.forEach(o => assert.ok(Number.isFinite(o.valeur), c.id + ' opérande'));
      assert.ok(Number.isFinite(et.resultat.valeur), c.id + ' résultat d\'étape');
    });
    r.resultats.forEach(x => assert.ok(Number.isFinite(x.valeur), c.id + ' résultat'));
  });
});
test('saisie invalide dans un calculateur : valeur null et alerte, sans exception', () => {
  const r = OAD.CALCULATEURS.volHa.compute({ Q: 6, v: NaN, L: 2.5 });
  assert.strictEqual(r.resultats[0].valeur, null);
  assert.strictEqual(r.alertes.length, 1);
});
test('LIMITE ASSUMÉE — débit de chantier théorique : ni demi-tours ni temps morts', () => {
  // 1,5 ha/h est un plafond ; aucun coefficient d'efficacité n'est appliqué.
  const r = OAD.CALCULATEURS.debitChantier.compute({ v: 6, L: 2.5 });
  assertClose(r.resultats[0].valeur, 1.5, 1e-12);
});

// ----------------------------------------------------------------------
section('§2 Contenu et schéma');

test('les 3 modules livrés sont conformes au schéma', () => {
  assert.deepStrictEqual(OAD.erreursContenu(MODULES), []);
});
test('chaque fichier contenu/<id>.js porte le module de même id', () => {
  MODULES.forEach(m => {
    assert.ok(fs.existsSync(path.join(RACINE, 'contenu', m.id + '.js')), m.id);
    assert.strictEqual(require(path.join(RACINE, 'contenu', m.id + '.js')).id, m.id);
  });
});
test('les 6 types de section sont utilisés par le contenu', () => {
  const types = new Set();
  MODULES.forEach(m => m.sections.forEach(s => types.add(s.type)));
  assert.deepStrictEqual([...types].sort(), OAD.TYPES_SECTION.slice().sort());
});
test('validerModule détecte les défauts d\'un module fabriqué', () => {
  const faux = {
    id: 'Mauvais Id', titre: '', resume: 'x', domaine: 'viticulture', statut: 'valide', sources: [],
    sections: [
      { id: 'a', type: 'quiz', titre: 'Q', questions: [{ id: 'q', enonce: 'e', choix: ['un'], bonnes: [3] }] },
      { id: 'a', type: 'calculateur', titre: 'C', calculateur: 'inexistant' },
      { id: 'b', type: 'entretien', titre: 'E', taches: [{ id: 't', texte: 'x', periodicite: 'parfois' }] },
      { id: 'c', type: 'cas', titre: 'K', situation: 's', options: [{ texte: 'a', retour: 'r', correct: false }, { texte: 'b', retour: 'r', correct: false }] },
      { id: 'd', type: 'video', titre: 'V' }
    ]
  };
  const e = OAD.validerModule(faux).join('\n');
  ['id absent ou non conforme', 'titre manquant', 'domaine inconnu', 'statut validé sans valideur',
    'statut validé sans source', 'au moins 2 choix', 'calculateur inconnu', 'périodicité inconnue',
    'aucune option correcte', 'type inconnu', 'section en double'].forEach(msg =>
    assert.ok(e.includes(msg), 'erreur attendue : ' + msg));
  assert.doesNotThrow(() => OAD.validerModule(null));
  assert.doesNotThrow(() => OAD.validerModule({ sections: [null, 42] }));
});
test('erreursContenu signale un module en double', () => {
  const e = OAD.erreursContenu([MODULES[0], MODULES[0]]);
  assert.ok(e.some(x => x.includes('module en double')));
});
test('identifiants de section quiz et cas uniques sur tout le catalogue (clés d\'état de l\'écran)', () => {
  const ids = [];
  MODULES.forEach(m => m.sections.filter(s => s.type === 'quiz' || s.type === 'cas').forEach(s => ids.push(s.id)));
  assert.strictEqual(new Set(ids).size, ids.length);
});

// ----------------------------------------------------------------------
section('§3 A1 — ajouts');

test('lireRoute(\'#/module/pulve-reglage-volume/calc-volume\')', () => {
  assert.deepStrictEqual(OAD.lireRoute('#/module/pulve-reglage-volume/calc-volume'),
    { vue: 'module', moduleId: 'pulve-reglage-volume', sectionId: 'calc-volume' });
});
test('lireRoute(\'\') → catalogue', () => {
  assert.deepStrictEqual(OAD.lireRoute(''), { vue: 'catalogue' });
});
test('lireRoute : outils, progression, route inconnue', () => {
  assert.deepStrictEqual(OAD.lireRoute('#/outils/volHa'), { vue: 'outils', calcId: 'volHa' });
  assert.deepStrictEqual(OAD.lireRoute('#/outils'), { vue: 'outils', calcId: null });
  assert.deepStrictEqual(OAD.lireRoute('#/progression'), { vue: 'progression' });
  assert.deepStrictEqual(OAD.lireRoute('#/nimporte'), { vue: 'catalogue' });
  assert.deepStrictEqual(OAD.lireRoute('#/module/x'), { vue: 'module', moduleId: 'x', sectionId: null });
});
test('lien(\'outils\', \'volHa\') → \'#/outils/volHa\'', () => {
  assert.strictEqual(OAD.lien('outils', 'volHa'), '#/outils/volHa');
  assert.strictEqual(OAD.lien(), '#/');
});
test('chaque clé de DOMAINES, PERIODICITES, STATUTS et TYPES_SECTION a un libellé', () => {
  OAD.DOMAINES.forEach(k => assert.ok(OAD.DOMAINES_LIBELLES[k], k));
  OAD.PERIODICITES.forEach(k => assert.ok(OAD.PERIODICITES_LIBELLES[k], k));
  OAD.STATUTS.forEach(k => assert.ok(OAD.STATUTS_LIBELLES[k], k));
  OAD.TYPES_SECTION.forEach(k => assert.ok(OAD.TYPES_SECTION_LIBELLES[k], k));
  OAD.ETATS_MODULE.forEach(k => assert.ok(OAD.ETATS_MODULE_LIBELLES[k], k));
});
test('modules() suit l\'ordre de contenu/index.js', () => {
  assert.deepStrictEqual(MODULES.map(m => m.id),
    ['pulve-reglage-volume', 'pulve-entretien', 'sol-outil-interceps']);
});
test('navigateur : modules() lit window.OAD_CONTENU à l\'appel et dédoublonne par id', () => {
  const src = fs.readFileSync(path.join(RACINE, 'moteur-oad.js'), 'utf8');
  const a = { id: 'a' }, a2 = { id: 'a' }, b = { id: 'b' };
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  // Tableaux d'un autre contexte vm : comparés par contenu (JSON).
  assert.strictEqual(JSON.stringify(ctx.window.OAD.modules()), '[]');   // lu à l'appel, pas à la définition
  ctx.window.OAD_CONTENU = [b, a, a2];                                   // réinjection par le runtime
  assert.strictEqual(JSON.stringify(ctx.window.OAD.modules().map(m => m.id)), '["b","a"]');
  assert.strictEqual(ctx.window.OAD.modules()[1], a);      // première occurrence gardée
});
test('ordonnerModules remet l\'ordre déclaré, inconnus en fin', () => {
  const r = OAD.ordonnerModules([{ id: 'c' }, { id: 'x' }, { id: 'a' }, { id: 'b' }], ['a', 'b', 'c']);
  assert.deepStrictEqual(r.map(m => m.id), ['a', 'b', 'c', 'x']);
});
test('registre : listerModules, trouverModule, trouverSection sur un jeu fabriqué', () => {
  const jeu = [
    { id: 'm1', domaine: 'pulverisation', statut: 'brouillon', sections: [{ id: 's1' }] },
    { id: 'm2', domaine: 'travail-du-sol', statut: 'valide', sections: [] }
  ];
  assert.deepStrictEqual(OAD.listerModules(jeu, { domaine: 'travail-du-sol' }).map(m => m.id), ['m2']);
  assert.strictEqual(OAD.listerModules(jeu).length, 2);
  assert.strictEqual(OAD.trouverModule(jeu, 'm1'), jeu[0]);
  assert.strictEqual(OAD.trouverModule(jeu, 'zz'), null);
  assert.strictEqual(OAD.trouverSection(jeu, 'm1', 's1'), jeu[0].sections[0]);
  assert.strictEqual(OAD.trouverSection(jeu, 'm1', 'zz'), null);
});
test('quiz : notation exacte (ni oubli, ni choix en trop)', () => {
  const sec = { questions: [{ id: 'a', bonnes: [1] }, { id: 'b', bonnes: [0, 2] }, { id: 'c', bonnes: [0] }] };
  const s = OAD.noterQuiz(sec, { a: [1], b: [2, 0], c: [0, 1] });
  assert.strictEqual(s.bonnes, 2);
  assert.strictEqual(s.total, 3);
  assertClose(s.taux, 2 / 3, 1e-12);
  assert.deepStrictEqual(s.details.map(d => d.juste), [true, true, false]);
  assert.strictEqual(OAD.noterQuiz(sec, undefined).bonnes, 0);
});
test('progression : réducteurs purs, avancement et état', () => {
  const p0 = OAD.progressionVide();
  const m = { id: 'm', sections: [{ id: 's1' }, { id: 's2' }] };
  const p1 = OAD.marquerVue(p0, 'm', 's1');
  assert.deepStrictEqual(p0, { version: 1, modules: {} }, 'p0 non modifié');
  assert.strictEqual(OAD.marquerVue(p1, 'm', 's1'), p1, 'aucun changement ⇒ même objet');
  assert.strictEqual(OAD.etatModule(p0, m), 'non-commence');
  assert.strictEqual(OAD.etatModule(p1, m), 'en-cours');
  assert.strictEqual(OAD.etatModule(OAD.marquerVue(p1, 'm', 's2'), m), 'termine');
  assert.deepStrictEqual(OAD.avancement(p1, m), { vues: 1, total: 2, taux: 0.5 });
  const p2 = OAD.basculerEtape(p1, 'm', 's1', 'e1');
  assert.deepStrictEqual(OAD.progressionSection(p2, 'm', 's1').etapes, ['e1']);
  assert.deepStrictEqual(OAD.progressionSection(OAD.basculerEtape(p2, 'm', 's1', 'e1'), 'm', 's1').etapes, []);
  const p3 = OAD.basculerTache(p0, 'm', 's2', 't1');
  assert.deepStrictEqual(OAD.progressionSection(p3, 'm', 's2').taches, ['t1']);
  assert.deepStrictEqual(OAD.progressionSection(null, 'x', 'y'), { vue: false, etapes: [], taches: [], quiz: null });
});

// ----------------------------------------------------------------------
section('§4 A2 — sorties brutes, horloge injectée, défauts sourcés');

test('volHa.compute({Q:6, v:6, L:2.5}) : opérandes bruts et résultat 240', () => {
  const r = OAD.CALCULATEURS.volHa.compute({ Q: 6, v: 6, L: 2.5 });
  assert.deepStrictEqual(r.etapes[0].operandes,
    [{ valeur: 6, decimales: 2 }, { valeur: 6, decimales: 1 }, { valeur: 2.5, decimales: 2 }]);
  assert.strictEqual(r.etapes[0].resultat.valeur, 240);   // 600 × 6 / (6 × 2,5)
  assert.strictEqual(r.etapes[0].gabarit, '600 × {0} / ({1} × {2})');
});
// Pourquoi : défauts recalés sur le corpus, B1 (était 8 bar → 11,52 bar).
test('pressionPourVolume avec les défauts : 3 × (180/150)² = 4,32 bar', () => {
  const c = OAD.CALCULATEURS.pressionPourVolume;
  const r = c.compute(defauts(c));
  assertClose(r.etapes[r.etapes.length - 1].resultat.valeur, 4.32, 1e-9);
  assertClose(r.resultats[0].valeur, 4.32, 1e-9);
});
// Pourquoi : défauts recalés sur le corpus, B1 — PLAGE_PRESSION_ALERTE_BAR
// supprimée, la plage vient des entrées pMin / pMax (D-B1-2).
test('alerte de pression : bornes lues dans les entrées pMin et pMax', () => {
  const r = OAD.CALCULATEURS.pressionPourVolume.compute({ P1: 8, V1: 150, V2: 300, b: 0.5, pMin: 1, pMax: 25 });   // 32 bar
  assert.strictEqual(r.alertes.length, 1);
  assert.deepStrictEqual(r.alertes[0].operandes, [{ valeur: 1, decimales: 2 }, { valeur: 25, decimales: 2 }]);
  assert.ok(OAD.substituer(r.alertes[0].gabarit, ['1', '25'])
    .startsWith('Pression calculée hors de la plage de la buse (1 à 25\u00a0bar) :'));
});
test('substituer(\'600 × {0} / ({1} × {2})\', [\'6\', \'6\', \'2,5\'])', () => {
  assert.strictEqual(OAD.substituer('600 × {0} / ({1} × {2})', ['6', '6', '2,5']), '600 × 6 / (6 × 2,5)');
});
test('substituer(\'{0} + {1}\', [\'1\']) → \'1 + {1}\' (marqueur sans texte conservé)', () => {
  assert.strictEqual(OAD.substituer('{0} + {1}', ['1']), '1 + {1}');
  assert.doesNotThrow(() => OAD.substituer(null, null));
});
// A2 : horloge injectée par l'appelant (D-A2-2)
test('enregistrerQuiz : la date vient de l\'appelant ; absente → null', () => {
  const p0 = OAD.progressionVide();
  const p1 = OAD.enregistrerQuiz(p0, 'm', 'q', { taux: 1 }, '2026-09-23T10:00:00Z');
  assert.strictEqual(OAD.progressionSection(p1, 'm', 'q').quiz.date, '2026-09-23T10:00:00Z');
  const p2 = OAD.enregistrerQuiz(p0, 'm', 'q', { taux: 1 });
  assert.strictEqual(OAD.progressionSection(p2, 'm', 'q').quiz.date, null);
  assert.strictEqual(OAD.progressionSection(OAD.enregistrerQuiz(p0, 'm', 'q', { taux: 1 }, 42), 'm', 'q').quiz.date, null);
});
// Pourquoi : défauts recalés sur le corpus, B1 — +pMin, +pMax (était 15).
test('chaque entrée de chaque calculateur a un origineDefaut non vide (17 entrées)', () => {
  let n = 0;
  Object.values(OAD.CALCULATEURS).forEach(c => c.entrees.forEach(e => {
    n++;
    assert.ok(typeof e.origineDefaut === 'string' && e.origineDefaut.trim(), c.id + '.' + e.id);
  }));
  assert.strictEqual(n, 17);   // 3 + 4 + 6 + 2 + 2
});
// Pourquoi : défauts recalés sur le corpus, B1 — seuls n et debitChantier
// restent sans source (D-B1-3, D-B1-4).
test('origines : b IFV, d et t F-VHA, Q déduit, n et debitChantier sans source', () => {
  const o = (c, e) => OAD.CALCULATEURS[c].entrees.find(x => x.id === e).origineDefaut;
  const SANS_SOURCE = 'Valeur d\'exemple, sans source : à confirmer par le référent';
  assert.ok(o('pressionPourVolume', 'b').startsWith('Valeur fixe de l\'outil IFV'));
  assert.strictEqual(o('vitesseMesuree', 'd'), 'Mesure sur 50 m (fiche Volume/hectare, CIVC, février 2014)');
  assert.strictEqual(o('volHa', 'Q'), 'Exemple déduit de 150 L/ha à 5 km/h sur 7,7 m');
  assert.strictEqual(o('debitBuse', 'n'), SANS_SOURCE);
  assert.strictEqual(o('debitChantier', 'v'), SANS_SOURCE);
  assert.strictEqual(o('debitChantier', 'L'), SANS_SOURCE);
});
const MOTEUR_SANS_COMMENTAIRES = fs.readFileSync(path.join(RACINE, 'moteur-oad.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
test('moteur statique : ni toLocaleString, ni new Date, ni Date.now', () => {
  assert.ok(!/toLocaleString|new Date|Date\.now/.test(MOTEUR_SANS_COMMENTAIRES));
});
test('moteur statique : ni document, ni localStorage, ni fetch(', () => {
  assert.ok(!/\bdocument\b|localStorage|fetch\(/.test(MOTEUR_SANS_COMMENTAIRES));
});

// ----------------------------------------------------------------------
section('§5 A3 — statiques');
const INDEX_HTML = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
// Le CODE seul : les commentaires citent volontairement des éléments retirés.
const CODE_SANS_COMMENTAIRES = INDEX_HTML
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^[ \t]*\/\/.*$/gm, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const SCRIPT = (INDEX_HTML.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/) || [])[1] || '';
const SCRIPT_SANS_COMMENTAIRES = SCRIPT.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ')
  .replace(/\s\/\/ .*$/gm, ' ');
const GABARIT = INDEX_HTML.slice(INDEX_HTML.indexOf('</helmet>'), INDEX_HTML.indexOf('</x-dc>'))
  .replace(/<!--[\s\S]*?-->/g, ' ');
const HELMET = INDEX_HTML.slice(INDEX_HTML.indexOf('<helmet>'), INDEX_HTML.indexOf('</helmet>'));

test('un seul script de composant, qui définit class Component extends DCLogic', () => {
  assert.strictEqual((INDEX_HTML.match(/data-dc-script>/g) || []).length, 1);
  assert.ok(/class Component extends DCLogic/.test(SCRIPT));
});
test('aucun <form>', () => {
  assert.ok(!/<form[\s>]/i.test(CODE_SANS_COMMENTAIRES));
});
test('aucun JSX dans le script du composant', () => {
  assert.ok(!/<[A-Z]/.test(SCRIPT_SANS_COMMENTAIRES));
});
test('ni fetch(, ni XMLHttpRequest, ni http:/https: hors commentaires', () => {
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket|https?:/.test(CODE_SANS_COMMENTAIRES));
});
test('aucune directive sc-for / sc-if dans table, thead, tbody, tr, select (D-A3-3)', () => {
  const re = /<(table|thead|tbody|tr|select)[\s>][\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(GABARIT))) assert.ok(!/<sc-(for|if)/.test(m[0]), 'directive dans <' + m[1] + '>');
  assert.ok(!/<select[\s>]/i.test(GABARIT), 'aucun <select> dans l\'interface');
});
test('scripts contenu/ de <helmet> = liste de contenu/index.js, dans l\'ordre, puis le moteur', () => {
  const srcs = [...HELMET.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  const index = fs.readFileSync(path.join(RACINE, 'contenu', 'index.js'), 'utf8');
  const liste = JSON.parse(index.match(/(\[[^\]]*\])/)[1].replace(/'/g, '"'));
  assert.deepStrictEqual(srcs.filter(s => s.startsWith('contenu/')), liste.map(f => 'contenu/' + f));
  assert.strictEqual(srcs[srcs.length - 1], 'moteur-oad.js');
});
test('calcul délégué au moteur : ni 600 *, ni Math.pow, ni 3.6 *, ni / 10 dans le composant', () => {
  ['600 *', 'Math.pow', '3.6 *', '/ 10'].forEach(motif =>
    assert.ok(!SCRIPT_SANS_COMMENTAIRES.includes(motif), 'motif interdit : ' + motif));
  assert.ok(/\.compute\(nombres\)/.test(SCRIPT_SANS_COMMENTAIRES));
  assert.ok(/OAD\.substituer\(/.test(SCRIPT_SANS_COMMENTAIRES));
});
test('horloge : lue une seule fois dans le composant, dans validerQuiz', () => {
  const n = (SCRIPT_SANS_COMMENTAIRES.match(/new Date\(|Date\.now/g) || []).length;
  assert.strictEqual(n, 1);
  const i = SCRIPT_SANS_COMMENTAIRES.indexOf('new Date(');
  assert.ok(SCRIPT_SANS_COMMENTAIRES.lastIndexOf('this.validerQuiz', i) > SCRIPT_SANS_COMMENTAIRES.lastIndexOf('this.recommencerQuiz', i));
});
test('marquerVue jamais appelé dans renderVals (D-A3-6)', () => {
  const debut = SCRIPT_SANS_COMMENTAIRES.indexOf('renderVals() {');
  const fin = SCRIPT_SANS_COMMENTAIRES.indexOf('\n  carte(', debut);
  assert.ok(debut > 0 && fin > debut);
  assert.ok(!SCRIPT_SANS_COMMENTAIRES.slice(debut, fin).includes('marquerVue'));
});
test('clé de progression conservée et version égale à celle du moteur (D-A3-2)', () => {
  assert.ok(SCRIPT.includes("const CLE_PROGRESSION = 'formation-machines:progression:v1';"));
  const m = SCRIPT.match(/const VERSION_PROGRESSION = (\d+);/);
  assert.ok(m);
  assert.strictEqual(Number(m[1]), OAD.VERSION_PROGRESSION);
});
test('<head> : React embarqué puis support.js, dans cet ordre', () => {
  const head = INDEX_HTML.slice(0, INDEX_HTML.indexOf('</head>'));
  const srcs = [...head.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  assert.deepStrictEqual(srcs, ['./vendor/react.production.min.js', './vendor/react-dom.production.min.js', './support.js']);
});
const SUPPORT = fs.readFileSync(path.join(RACINE, 'support.js'));
const sri = f => 'sha384-' + crypto.createHash('sha384').update(fs.readFileSync(path.join(RACINE, 'vendor', f))).digest('base64');
test('vendor/react.production.min.js : SHA-384 = REACT_SRI de support.js', () => {
  const attendu = SUPPORT.toString('utf8').match(/var REACT_SRI = "([^"]+)"/)[1];
  assert.strictEqual(sri('react.production.min.js'), attendu);
});
test('vendor/react-dom.production.min.js : SHA-384 = REACT_DOM_SRI de support.js', () => {
  const attendu = SUPPORT.toString('utf8').match(/var REACT_DOM_SRI = "([^"]+)"/)[1];
  assert.strictEqual(sri('react-dom.production.min.js'), attendu);
});
test('support.js : SHA-256 du runtime de référence (jamais modifié)', () => {
  assert.strictEqual(crypto.createHash('sha256').update(SUPPORT).digest('hex'),
    'e0650b109ec8f78ccc370fa27762b0c485cee4f208156a671f346e8544fc2214');
});

// ----------------------------------------------------------------------
section('§6 A3 — rendu à blanc');
// Principe du vérificateur du skill : DCLogic, React.createElement et
// localStorage simulés ; moteur et contenu chargés par require.

const MAGASIN = {};
global.window = {
  localStorage: {
    getItem: k => (k in MAGASIN ? MAGASIN[k] : null),
    setItem: (k, v) => { MAGASIN[k] = String(v); },
    removeItem: k => { delete MAGASIN[k]; }
  },
  addEventListener() {}, removeEventListener() {}, print() {}, scrollTo() {}, confirm: () => true
};
global.document = { documentElement: { setAttribute() {}, removeAttribute() {} } };
window.OAD = OAD;
window.OAD_CONTENU = require(path.join(RACINE, 'contenu', 'index.js'));
const React = { createElement: (t, p, ...c) => ({ t, p, c }) };
class DCLogic {
  constructor(props) { this.props = props || {}; }
  setState(u, cb) {
    const d = typeof u === 'function' ? u(this.state) : u;
    this.state = { ...this.state, ...d };
    if (cb) cb();
  }
}
const Component = new Function('DCLogic', 'React', SCRIPT + ';return Component')(DCLogic, React);

const LOCALES = new Set([...GABARIT.matchAll(/as="([A-Za-z_]\w*)"/g)].map(m => m[1]));
const RACINES_GABARIT = [...new Set([...GABARIT.matchAll(/\{\{\s*!?\s*([A-Za-z_]\w*)/g)].map(m => m[1]))]
  .filter(k => !LOCALES.has(k) && !['true', 'false', 'null'].includes(k));

function rendre(c, hash) {
  c.state = { ...c.state, route: OAD.lireRoute(hash) };
  const out = c.renderVals();
  const manquantes = RACINES_GABARIT.filter(k => !(k in out));
  assert.deepStrictEqual(manquantes, [], hash + ' : clés absentes de renderVals()');
  return out;
}
function evt(valeur, attrs) {
  const a = attrs || {};
  return { currentTarget: { value: valeur, getAttribute: k => (k in a ? a[k] : null) } };
}

test('le gabarit lit au moins 40 clés (garde du test lui-même)', () => {
  assert.ok(RACINES_GABARIT.length >= 40, String(RACINES_GABARIT.length));
});
test('moteur absent : objet vide mais complet, écran de chargement', () => {
  const sauve = window.OAD; window.OAD = undefined;
  try {
    const c = new Component({});
    const out = c.renderVals();
    assert.deepStrictEqual(RACINES_GABARIT.filter(k => !(k in out)), []);
    assert.strictEqual(out.enChargement, true);
  } finally { window.OAD = sauve; }
});
const ROUTES = ['', '#/', '#/progression', '#/outils', '#/outils/inconnu', '#/module/inconnu'];
MODULES.forEach(m => {
  ROUTES.push('#/module/' + m.id);
  m.sections.forEach(s => ROUTES.push('#/module/' + m.id + '/' + s.id));
});
Object.keys(OAD.CALCULATEURS).forEach(k => ROUTES.push('#/outils/' + k));
test('chaque route (' + ROUTES.length + ') rend sans exception, toutes les clés du gabarit présentes', () => {
  const c = new Component({});
  ROUTES.forEach(h => rendre(c, h));
});
test('routes : bon écran affiché', () => {
  const c = new Component({});
  assert.strictEqual(rendre(c, '').estCatalogue, true);
  assert.strictEqual(rendre(c, '').domainesCatalogue.length, 2);
  assert.strictEqual(rendre(c, '#/module/inconnu').estInconnu, true);
  const o = rendre(c, '#/module/pulve-reglage-volume');
  assert.strictEqual(o.estModule, true);
  assert.strictEqual(o.estFiche, true);   // première section par défaut
  assert.strictEqual(rendre(c, '#/module/pulve-reglage-volume/calc-volume').aCalc, true);
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.titre, 'Volume par hectare');
  assert.strictEqual(rendre(c, '#/outils').aCalc, false);
  assert.ok(rendre(c, '#/progression').tableauProgression);
});
// Pourquoi : défauts recalés sur le corpus, B1 — v = 5, L = 7,7 (était
// 480 L/ha avec v = 6, L = 2,5). 600 × 12 / (5 × 7,7) = 187,01.
test('calculateur « Volume par hectare » : Q = 12 → 187 L/ha, formule ouverte en fr-FR', () => {
  const c = new Component({});
  rendre(c, '#/outils/volHa');
  c.onSaisie(evt('12', { 'data-calc': 'volHa', 'data-entree': 'Q' }));
  const out = rendre(c, '#/outils/volHa');
  assert.strictEqual(out.calcCourant.resultats[0].texte, '187 L/ha');
  assert.strictEqual(out.calcCourant.etapes[0].substitution, '600 × 12 / (5 × 7,7)');
  assert.strictEqual(out.calcCourant.entrees[2].valeur, '7,7');
  assert.strictEqual(out.calcCourant.entrees[0].origine, 'Exemple déduit de 150 L/ha à 5 km/h sur 7,7 m');
});
test('calculateur : saisie « 12, » acceptée, saisie vide → tiret et alerte', () => {
  const c = new Component({});
  c.onSaisie(evt('12,', { 'data-calc': 'volHa', 'data-entree': 'Q' }));
  // Pourquoi : défauts recalés sur le corpus, B1 (était 480 puis 240 L/ha).
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.resultats[0].texte, '187 L/ha');
  c.onSaisie(evt('', { 'data-calc': 'volHa', 'data-entree': 'Q' }));
  const out = rendre(c, '#/outils/volHa');
  assert.strictEqual(out.calcCourant.resultats[0].texte, '— L/ha');
  assert.strictEqual(out.calcCourant.aAlertes, true);
  c.reinitialiserCalc(evt('volHa'));
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.resultats[0].texte, '150 L/ha');   // 149,61
});
// Pourquoi : défauts recalés sur le corpus, B1 (était 11,52 → « 11,5 bar »).
test('pression : 4,32 bar affiché 4,3 bar (1 décimale)', () => {
  const c = new Component({});
  assert.strictEqual(rendre(c, '#/outils/pressionPourVolume').calcCourant.resultats[0].texte, '4,3 bar');
});
test('quiz répondu puis validé : score affiché et enregistré avec la date', () => {
  const c = new Component({});
  const h = '#/module/pulve-reglage-volume/quiz-volume';
  rendre(c, h);
  c.onChoix(evt('quiz-volume|q-vitesse|1'));
  c.onChoix(evt('quiz-volume|q-mesures|0'));
  c.onChoix(evt('quiz-volume|q-mesures|1'));
  c.onChoix(evt('quiz-volume|q-mesures|2'));
  c.onChoix(evt('quiz-volume|q-pression|0'));
  c.validerQuiz(evt('quiz-volume'));
  const out = rendre(c, h);
  assert.strictEqual(out.quiz.corrige, true);
  assert.strictEqual(out.quiz.scoreTxt, 'Score : 2 / 3 (67 %)');
  const q = OAD.progressionSection(c.state.prog, 'pulve-reglage-volume', 'quiz-volume').quiz;
  assert.strictEqual(q.bonnes, 2);
  assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(q.date));
  // verrouillé après validation
  c.onChoix(evt('quiz-volume|q-pression|1'));
  assert.strictEqual(rendre(c, h).quiz.scoreTxt, 'Score : 2 / 3 (67 %)');
  c.recommencerQuiz(evt('quiz-volume'));
  const o2 = rendre(c, h);
  assert.strictEqual(o2.quiz.corrige, false);
  assert.strictEqual(o2.quiz.aDernier, true);
});
test('cas pratique : le retour de l\'option choisie s\'affiche', () => {
  const c = new Component({});
  const h = '#/module/pulve-reglage-volume/cas-vitesse';
  c.choisirCas(evt('cas-vitesse|1'));
  const out = rendre(c, h);
  assert.strictEqual(out.cas.aRetour, true);
  assert.strictEqual(out.cas.verdict, 'Bonne réponse.');
});
test('procédure et entretien : cocher met à jour la progression', () => {
  const c = new Component({});
  const h = '#/module/pulve-reglage-volume/mesure-vitesse';
  rendre(c, h);
  c.basculerEtape(evt('on', { 'data-etape': 'baliser' }));
  const out = rendre(c, h);
  assert.strictEqual(out.procedure.compteur, '1 / 5 étapes cochées');
  assert.strictEqual(out.procedure.etapes[0].fait, true);
  const h2 = '#/module/pulve-entretien/plan-entretien';
  rendre(c, h2);
  c.basculerTache(evt('on', { 'data-tache': 'rincage' }));
  assert.strictEqual(rendre(c, h2).entretien.compteur, '1 / 9 tâches cochées');
});
test('section consultée marquée après rendu (componentDidUpdate), progression écrite', () => {
  Object.keys(MAGASIN).forEach(k => delete MAGASIN[k]);
  const c = new Component({});
  c.state = { ...c.state, route: OAD.lireRoute('#/module/pulve-entretien/pourquoi') };
  c.componentDidUpdate();   // marquerVue → setState
  c.componentDidUpdate();   // écriture
  assert.strictEqual(OAD.progressionSection(c.state.prog, 'pulve-entretien', 'pourquoi').vue, true);
  const stocke = JSON.parse(MAGASIN['formation-machines:progression:v1']);
  assert.strictEqual(stocke.version, 1);
  assert.ok(stocke.modules['pulve-entretien'].vues.includes('pourquoi'));
  // Rechargement : la progression est relue.
  const c2 = new Component({});
  assert.strictEqual(OAD.progressionSection(c2.state.prog, 'pulve-entretien', 'pourquoi').vue, true);
  c2.effacerProgression();
  assert.strictEqual(MAGASIN['formation-machines:progression:v1'], undefined);
});
test('stockage refusé (navigation privée) : aucune exception, l\'outil reste utilisable', () => {
  const sauve = window.localStorage;
  window.localStorage = { getItem() { throw new Error('refusé'); }, setItem() { throw new Error('refusé'); }, removeItem() { throw new Error('refusé'); } };
  try {
    const c = new Component({});
    c.state = { ...c.state, route: OAD.lireRoute('#/module/pulve-entretien/pourquoi') };
    c.componentDidUpdate(); c.componentDidUpdate();
    c.basculerTheme();
    rendre(c, '#/progression');
    c.effacerProgression();
  } finally { window.localStorage = sauve; }
});

// ----------------------------------------------------------------------
section('§7 B0 — préparation');

test('.gitignore contient la ligne docs/corpus/ (D-B0-2)', () => {
  const gi = fs.readFileSync(path.join(RACINE, '.gitignore'), 'utf8');
  assert.ok(gi.split(/\r?\n/).map(l => l.trim()).includes('docs/corpus/'));
});
test('.github/workflows/tests.yml existe et lance node tests/parite.test.js (D-B0-5)', () => {
  const wf = path.join(RACINE, '.github', 'workflows', 'tests.yml');
  assert.ok(fs.existsSync(wf));
  assert.ok(fs.readFileSync(wf, 'utf8').includes('node tests/parite.test.js'));
});
(() => {
  let sortie = null;
  try {
    sortie = require('child_process').execSync('git ls-files docs/corpus',
      { cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) { sortie = null; }
  if (sortie === null) {
    skip('aucun fichier suivi par git sous docs/corpus/', null, 'LIMITE ASSUMÉE — git indisponible');
  } else {
    test('aucun fichier suivi par git sous docs/corpus/ (D-B0-2)', () => {
      assert.strictEqual(sortie.trim(), '');
    });
  }
})();

// ----------------------------------------------------------------------
section('§8 B1 — défauts recalés, plage de buse');
// Valeurs calculées à la main, vérifiées sous Node le 23/09/2026.

const CALC = OAD.CALCULATEURS;
test('volHa({Q: 9,6, v: 5, L: 7,7}) = 5 760 / 38,5 = 149,6104 L/ha, affiché 150 L/ha', () => {
  assertClose(CALC.volHa.compute({ Q: 9.6, v: 5, L: 7.7 }).resultats[0].valeur, 149.6104, 1e-4);
  const c = new Component({});
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.resultats[0].texte, '150 L/ha');
});
test('debitBuse({V: 150, v: 5, L: 7,7, n: 12}) → Q = 9,625 ; q = 0,80208', () => {
  const r = CALC.debitBuse.compute({ V: 150, v: 5, L: 7.7, n: 12 });
  assertClose(r.resultats[0].valeur, 9.625, 1e-9);
  assertClose(r.resultats[1].valeur, 0.80208, 1e-5);
});
test('pression 3 bar, 150 → 180 L/ha, plage 3–4,5 : 4,32 bar, aucune alerte', () => {
  const r = CALC.pressionPourVolume.compute({ P1: 3, V1: 150, V2: 180, b: 0.5, pMin: 3, pMax: 4.5 });
  assertClose(r.resultats[0].valeur, 4.32, 1e-9);
  assert.deepStrictEqual(r.alertes, []);
});
test('pression 3 bar, 100 → 150 L/ha : 6,75 bar, alerte « hors de la plage de la buse »', () => {
  const r = CALC.pressionPourVolume.compute({ P1: 3, V1: 100, V2: 150, b: 0.5, pMin: 3, pMax: 4.5 });
  assertClose(r.resultats[0].valeur, 6.75, 1e-9);
  assert.strictEqual(r.alertes.length, 1);
  assert.ok(r.alertes[0].gabarit.includes('hors de la plage de la buse'));
  const c = new Component({});
  c.onSaisie(evt('100', { 'data-calc': 'pressionPourVolume', 'data-entree': 'V1' }));
  c.onSaisie(evt('150', { 'data-calc': 'pressionPourVolume', 'data-entree': 'V2' }));
  const out = rendre(c, '#/outils/pressionPourVolume');
  assert.ok(out.calcCourant.alertes[0].startsWith('Pression calculée hors de la plage de la buse (3 à 4,5\u00a0bar) :'),
    out.calcCourant.alertes[0]);
});
test('plage pMin = 5, pMax = 4 : alerte « plage invalide », P2 reste calculé (4,32)', () => {
  const r = CALC.pressionPourVolume.compute({ P1: 3, V1: 150, V2: 180, b: 0.5, pMin: 5, pMax: 4 });
  assertClose(r.resultats[0].valeur, 4.32, 1e-9);
  assert.strictEqual(r.alertes.length, 1);
  assert.ok(r.alertes[0].startsWith('Plage de pression de la buse invalide'));
});
test('vitesseMesuree : 50 m / 30 s = 6 km/h ; 50 m / 35 s = 5,142857 (table F-VHA : 5,1)', () => {
  assertClose(CALC.vitesseMesuree.compute({ d: 50, t: 30 }).resultats[0].valeur, 6, 1e-12);
  assertClose(CALC.vitesseMesuree.compute({ d: 50, t: 35 }).resultats[0].valeur, 5.142857, 1e-6);
});
test('OAD.PLAGE_PRESSION_ALERTE_BAR n\'existe plus', () => {
  assert.strictEqual(OAD.PLAGE_PRESSION_ALERTE_BAR, undefined);
});
test('pressionPourVolume : portée affichée sous la description', () => {
  const c = new Component({});
  const out = rendre(c, '#/outils/pressionPourVolume');
  assert.strictEqual(out.calcCourant.aPortee, true);
  assert.ok(out.calcCourant.portee.startsWith('Buses hydrauliques'));
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.aPortee, false);
});
test('statique : aucun origineDefaut ne contient « O4 » ni « prompt » (D-B1-5)', () => {
  Object.values(CALC).forEach(c => c.entrees.forEach(e => {
    assert.ok(!/O4|prompt/i.test(e.origineDefaut), c.id + '.' + e.id + ' : ' + e.origineDefaut);
  }));
});

console.log(`\n${passed} ok, ${failed} FAIL, ${skipped} skip`);
if (failed > 0) process.exit(1);
