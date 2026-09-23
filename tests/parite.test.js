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
// Pourquoi : écart entre diffuseurs, B3 — ses défauts montrent volontairement
// un diffuseur hors seuil (D-B3-5) : une alerte attendue, les autres aucune.
const ALERTES_DEFAUT = { ecartDiffuseurs: 1 };
test('chaque calculateur du registre calcule avec ses valeurs par défaut', () => {
  Object.values(OAD.CALCULATEURS).forEach(c => {
    const r = c.compute(defauts(c));
    assert.ok(r.etapes.length >= 1 && r.resultats.length >= 1, c.id);
    assert.strictEqual(r.alertes.length, ALERTES_DEFAUT[c.id] || 0, c.id + ' : alertes avec les défauts');
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

// Pourquoi : le catalogue s'étend à partir de B9 : nom sans le nombre.
test('les modules livrés sont conformes au schéma', () => {
  assert.deepStrictEqual(OAD.erreursContenu(MODULES), []);
});
test('chaque fichier contenu/<id>.js porte le module de même id', () => {
  MODULES.forEach(m => {
    assert.ok(fs.existsSync(path.join(RACINE, 'contenu', m.id + '.js')), m.id);
    assert.strictEqual(require(path.join(RACINE, 'contenu', m.id + '.js')).id, m.id);
  });
});
// Pourquoi : type « exercice » ajouté en B5 et utilisé par le contenu depuis
// B7 : de nouveau, tous les types du vocabulaire sont utilisés.
test('tous les types de section sont utilisés par le contenu', () => {
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
// B5 : les exercices s'ajoutent aux quiz et cas (clés d'état de l'écran).
test('identifiants de section quiz, cas et exercice uniques sur tout le catalogue (clés d\'état de l\'écran)', () => {
  const ids = [];
  MODULES.forEach(m => m.sections.filter(s => OAD.TYPES_SECTION_EVALUES.includes(s.type)).forEach(s => ids.push(s.id)));
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
// Pourquoi : trois modules ajoutés après pulve-entretien, B9.
test('modules() suit l\'ordre de contenu/index.js', () => {
  assert.deepStrictEqual(MODULES.map(m => m.id),
    ['pulve-reglage-volume', 'pulve-entretien', 'pulve-filtration', 'pulve-remise-en-route',
      'pulve-couverture', 'sol-outil-interceps']);
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
  // Pourquoi : consulté n'est plus terminé, B6 (sections sans quiz : plafond « consulte »).
  assert.strictEqual(OAD.etatModule(OAD.marquerVue(p1, 'm', 's2'), m), 'consulte');
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
// Pourquoi : défauts recalés sur le corpus, B1 — +pMin, +pMax (était 15) ;
// puis 3 calculateurs ajoutés, B2 — +7 entrées (était 17) ; puis écart entre
// diffuseurs, B3 — +1 entrée liste (était 24).
test('chaque entrée de chaque calculateur a un origineDefaut non vide (25 entrées)', () => {
  let n = 0;
  Object.values(OAD.CALCULATEURS).forEach(c => c.entrees.forEach(e => {
    n++;
    assert.ok(typeof e.origineDefaut === 'string' && e.origineDefaut.trim(), c.id + '.' + e.id);
  }));
  assert.strictEqual(n, 25);   // 3 + 4 + 6 + 2 + 2 + 2 + 2 + 3 + 1
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
  // Pourquoi : aller-retour retiré de la mesure de vitesse (absent du corpus), B7.
  assert.strictEqual(out.procedure.compteur, '1 / 4 étapes cochées');
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
// Pourquoi : champ portee remplacé par technologies, B4 (D-B4-1).
test('pressionPourVolume : technologies affichées sous la description, pas pour volHa', () => {
  const c = new Component({});
  const out = rendre(c, '#/outils/pressionPourVolume');
  assert.strictEqual(out.calcCourant.aTechnos, true);
  assert.strictEqual(OAD.CALCULATEURS.pressionPourVolume.portee, undefined);
  assert.strictEqual(rendre(c, '#/outils/volHa').calcCourant.aTechnos, false);
});
test('statique : aucun origineDefaut ne contient « O4 » ni « prompt » (D-B1-5)', () => {
  Object.values(CALC).forEach(c => c.entrees.forEach(e => {
    assert.ok(!/O4|prompt/i.test(e.origineDefaut), c.id + '.' + e.id + ' : ' + e.origineDefaut);
  }));
});

// ----------------------------------------------------------------------
section('§9 B2 — nouveaux calculateurs');

test('largeurTraitee(7, 1,10) = 7,7 m ; largeurTraitee(2, 1,10) = 2,2 m', () => {
  assertClose(OAD.largeurTraitee(7, 1.10), 7.7, 1e-9);
  assertClose(OAD.largeurTraitee(2, 1.10), 2.2, 1e-9);
});
test('debitParNiveauCuve(48, 5) = 9,6 L/min ; (19,2, 2) = 9,6 L/min', () => {
  assertClose(OAD.debitParNiveauCuve(48, 5), 9.6, 1e-9);
  assertClose(OAD.debitParNiveauCuve(19.2, 2), 9.6, 1e-9);
});
test('volumeSelonHauteurs(180, 3, 2) = 120 L/ha ; (180, 3, 0) → NaN, calculateur null + alerte', () => {
  assertClose(OAD.volumeSelonHauteurs(180, 3, 2), 120, 1e-9);
  assert.ok(Number.isNaN(OAD.volumeSelonHauteurs(180, 3, 0)));
  const r = OAD.CALCULATEURS.hauteursBuses.compute({ V1: 180, h1: 3, h2: 0 });
  assert.strictEqual(r.resultats[0].valeur, null);
  assert.strictEqual(r.alertes.length, 1);
});
test('volumeApresChangementVitesse(150, 6, 7) = 128,5714 L/ha', () => {
  assertClose(OAD.volumeApresChangementVitesse(150, 6, 7), 128.5714, 1e-4);
});
test('cohérence : volumeHectare(debitParNiveauCuve(48, 5), 5, largeurTraitee(7, 1,10)) = 149,6104 (comme B1)', () => {
  assertClose(OAD.volumeHectare(OAD.debitParNiveauCuve(48, 5), 5, OAD.largeurTraitee(7, 1.10)), 149.6104, 1e-4);
});
// Pourquoi : le catalogue de calculateurs évolue, B3 — la page liste tout le
// registre (8 à la fin de B2, 9 après B3) : comparé au registre, pas en dur.
test('registre : les nouvelles entrées ont un origineDefaut non vide ; la page liste tout le registre', () => {
  ['largeurTraitee', 'debitCuve', 'hauteursBuses'].forEach(id => {
    const c = OAD.CALCULATEURS[id];
    assert.ok(c, id);
    c.entrees.forEach(e => assert.ok(typeof e.origineDefaut === 'string' && e.origineDefaut.trim(), id + '.' + e.id));
  });
  const c = new Component({});
  assert.strictEqual(rendre(c, '#/outils').outilsListe.length, Object.keys(OAD.CALCULATEURS).length);
});
test('rendu à blanc : #/outils/largeurTraitee, debitCuve, hauteursBuses', () => {
  const c = new Component({});
  assert.strictEqual(rendre(c, '#/outils/largeurTraitee').calcCourant.resultats[0].texte, '7,7 m');
  assert.strictEqual(rendre(c, '#/outils/debitCuve').calcCourant.resultats[0].texte, '9,6 L/min');
  assert.strictEqual(rendre(c, '#/outils/hauteursBuses').calcCourant.resultats[0].texte, '120 L/ha');
});

// ----------------------------------------------------------------------
section('§10 B3 — écart entre diffuseurs');
// Valeurs vérifiées sous Node le 23/09/2026.

const centieme = x => Math.round(x * 10000) / 100;   // fraction → % au centième
test('défaut : moyenne 1,392857 ; écarts +0,51 −0,92 +9,13 +1,23 −10,26 −0,21 +0,51 ; hors seuil [5]', () => {
  const r = OAD.ecartsALaMoyenne(defauts(OAD.CALCULATEURS.ecartDiffuseurs).debits, OAD.ECART_DIFFUSEUR_MAX);
  assertClose(r.moyenne, 1.392857, 1e-6);
  assert.deepStrictEqual(r.ecarts.map(x => centieme(x.ecart)), [0.51, -0.92, 9.13, 1.23, -10.26, -0.21, 0.51]);
  assert.deepStrictEqual(r.horsSeuil, [5]);
});
test('[1,1 ; 0,9] : moyenne 1, écarts ±10 %, aucun hors seuil (« supérieur à 10 % », D-B3-2)', () => {
  const r = OAD.ecartsALaMoyenne([1.1, 0.9], 0.10);
  assertClose(r.moyenne, 1, 1e-12);
  assert.deepStrictEqual(r.ecarts.map(x => centieme(x.ecart)), [10, -10]);
  assert.deepStrictEqual(r.horsSeuil, []);
});
test('[1,12 ; 0,88] : hors seuil [1, 2]', () => {
  assert.deepStrictEqual(OAD.ecartsALaMoyenne([1.12, 0.88], 0.10).horsSeuil, [1, 2]);
});
test('[1,4] : résultat null et alerte de saisie', () => {
  const r = OAD.CALCULATEURS.ecartDiffuseurs.compute({ debits: [1.4] });
  assert.strictEqual(r.resultats[0].valeur, null);
  assert.strictEqual(r.resultats[1].valeur, null);
  assert.ok(r.alertes.some(a => typeof a === 'string' && a.startsWith('Calcul impossible')));
});
test('[1,4 ; NaN ; 1,3] : moyenne 1,35, alerte « Valeur n° 2 illisible »', () => {
  const r = OAD.CALCULATEURS.ecartDiffuseurs.compute({ debits: [1.4, NaN, 1.3] });
  assertClose(r.resultats[0].valeur, 1.35, 1e-12);
  const a = r.alertes.find(x => typeof x === 'object');
  assert.ok(OAD.substituer(a.gabarit, a.operandes.map(o => String(o.valeur))).startsWith('Valeur n° 2 illisible'));
  assert.deepStrictEqual(r.detail.map(x => x.rang), [1, 3]);
});
test('registre : une entrée liste a un défaut tableau (garde de schéma)', () => {
  assert.deepStrictEqual(OAD.erreursRegistre(OAD.CALCULATEURS), []);
  const faux = { x: { id: 'x', entrees: [{ id: 'l', label: 'L', type: 'liste', defaut: 3, origineDefaut: 'o' }] } };
  assert.ok(OAD.erreursRegistre(faux).some(e => e.includes('défaut tableau')));
});
const versListe = new Function(SCRIPT.slice(SCRIPT.indexOf('function versNombre'), SCRIPT.indexOf('function texteListe')) +
  'return versListe;')();
test('vue : versListe(\'1,40 ; 1,38;;1,52\') → [1.4, 1.38, 1.52]', () => {
  assert.deepStrictEqual(versListe('1,40 ; 1,38;;1,52'), [1.4, 1.38, 1.52]);
});
test('rendu à blanc #/outils/ecartDiffuseurs : tableau de 7 lignes, une seule « hors-seuil »', () => {
  const c = new Component({});
  const out = rendre(c, '#/outils/ecartDiffuseurs');
  assert.strictEqual(out.calcCourant.aTableau, true);
  assert.strictEqual(out.calcCourant.entrees[0].valeur, '1,40 ; 1,38 ; 1,52 ; 1,41 ; 1,25 ; 1,39 ; 1,40');
  assert.strictEqual(out.calcCourant.entrees[0].estListe, true);
  const tbody = out.calcCourant.tableau.c.find(x => x && x.t === 'tbody');
  const lignes = [].concat(...tbody.c);
  assert.strictEqual(lignes.length, 7);
  const hors = lignes.filter(l => l.p.className === 'hors-seuil');
  assert.strictEqual(hors.length, 1);
  assert.ok(hors[0].c[2].c[0].endsWith('— à contrôler'), hors[0].c[2].c[0]);
  assert.strictEqual(hors[0].c[2].c[0], '−10,26 % — à contrôler');
  assert.ok(out.calcCourant.alertes[0].startsWith('Diffuseur n° 5 : écart de −10,26 % à la moyenne'), out.calcCourant.alertes[0]);
});
test('saisie d\'une liste dans la vue : « 1,1 ; abc ; 0,9 » → alerte n° 2, 2 lignes', () => {
  const c = new Component({});
  c.onSaisie(evt('1,1 ; abc ; 0,9', { 'data-calc': 'ecartDiffuseurs', 'data-entree': 'debits' }));
  const out = rendre(c, '#/outils/ecartDiffuseurs');
  assert.ok(out.calcCourant.alertes.some(a => a.startsWith('Valeur n° 2 illisible')));
  assert.strictEqual([].concat(...out.calcCourant.tableau.c.find(x => x && x.t === 'tbody').c).length, 2);
});

// ----------------------------------------------------------------------
section('§11 B4 — schéma');

// Module minimal conforme, à décliner dans les tests.
function moduleFabrique(sections, extra) {
  return Object.assign({
    id: 'fabrique', titre: 'Fabriqué', resume: 'r', domaine: 'pulverisation', statut: 'brouillon',
    valideur: null, sources: [{ code: 'F-VHA', reference: 'Fiche volume/hectare, CIVC', date: 'février 2014' }],
    sections
  }, extra || {});
}
const ficheChiffree = [{ id: 'mesure', type: 'fiche', titre: 'Mesure', blocs: [{ type: 'paragraphe', texte: 'Mesurer sur 50 m' }] }];

test('module « valide » avec un bloc chiffré sans source → erreur citant la section ; en brouillon, 1 élément compté', () => {
  const v = moduleFabrique(ficheChiffree, { statut: 'valide', valideur: 'Valideur' });
  const e = OAD.validerModule(v);
  assert.ok(e.some(x => x.includes('« mesure »') && x.includes('élément chiffré sans source')), e.join('\n'));
  const b = moduleFabrique(ficheChiffree);
  assert.deepStrictEqual(OAD.validerModule(b), []);
  assert.strictEqual(OAD.elementsChiffresSansSource(b).length, 1);
  // Sourcé : plus rien à compter, et le module valide est conforme.
  const src = moduleFabrique([{ id: 'mesure', type: 'fiche', titre: 'Mesure',
    blocs: [{ type: 'paragraphe', texte: 'Mesurer sur 50 m', source: 'F-VHA' }] }], { statut: 'valide', valideur: 'Valideur' });
  assert.deepStrictEqual(OAD.validerModule(src), []);
});
test('source d\'élément F-XXX absente des sources du module → « source inconnue »', () => {
  const m = moduleFabrique([{ id: 's', type: 'fiche', titre: 'S', blocs: [{ type: 'paragraphe', texte: 't', source: 'F-XXX' }] }]);
  assert.ok(OAD.validerModule(m).some(x => x.includes('source inconnue « F-XXX »')));
});
test('code de source f-vha (minuscules) → erreur de format ; code en double → erreur', () => {
  const m = moduleFabrique(ficheChiffree, { sources: [{ code: 'f-vha', reference: 'r', date: 'd' }] });
  assert.ok(OAD.validerModule(m).some(x => x.includes('non conforme')));
  const d = moduleFabrique(ficheChiffree, { sources: [{ code: 'A', reference: 'r', date: 'd' }, { code: 'A', reference: 'r2', date: 'd' }] });
  assert.ok(OAD.validerModule(d).some(x => x.includes('source en double « A »')));
});
test('bloc tableau : une ligne de 2 cellules pour 3 en-têtes → erreur', () => {
  const m = moduleFabrique([{ id: 't', type: 'fiche', titre: 'T', blocs: [{ type: 'tableau',
    entetes: ['a', 'b', 'c'], lignes: [['1', '2', '3'], ['1', '2']] }] }]);
  assert.ok(OAD.validerModule(m).some(x => x.includes('3 cellules attendues')));
});
test('tâche « semestrielle » acceptée ; « mensuelle » refusée ; détail vide refusé', () => {
  const t = (periodicite, detail) => moduleFabrique([{ id: 'e', type: 'entretien', titre: 'E',
    taches: [Object.assign({ id: 'x', texte: 'Changer le filtre', periodicite }, detail === undefined ? {} : { detail })] }]);
  assert.deepStrictEqual(OAD.validerModule(t('semestrielle')), []);
  assert.ok(OAD.validerModule(t('mensuelle')).some(x => x.includes('périodicité inconnue')));
  assert.ok(OAD.validerModule(t('annuelle', ' ')).some(x => x.includes('détail vide')));
  assert.strictEqual(OAD.PERIODICITES.indexOf('semestrielle'), OAD.PERIODICITES.indexOf('hebdomadaire') + 1);
  assert.strictEqual(OAD.PERIODICITES_LIBELLES.semestrielle, 'Au moins deux fois par an');
});
test('technologie de section hors vocabulaire → erreur ; libellés présents', () => {
  const m = moduleFabrique([{ id: 't', type: 'fiche', titre: 'T', technologie: 'canon', blocs: [{ type: 'paragraphe', texte: 'x' }] }]);
  assert.ok(OAD.validerModule(m).some(x => x.includes('technologie inconnue')));
  OAD.TECHNOLOGIES.forEach(k => assert.ok(OAD.TECHNOLOGIES_LIBELLES[k], k));
});
test('calculateurs : pressionPourVolume = jets portés + jets projetés ; toutes les technologies du vocabulaire', () => {
  assert.deepStrictEqual(OAD.CALCULATEURS.pressionPourVolume.technologies, ['jets-portes', 'jets-projetes']);
  Object.values(OAD.CALCULATEURS).forEach(c =>
    assert.ok(c.technologies.length && c.technologies.every(t => OAD.TECHNOLOGIES.includes(t)), c.id));
  assert.deepStrictEqual(OAD.erreursRegistre(OAD.CALCULATEURS), []);
});
test('les modules actuels restent conformes', () => {
  assert.deepStrictEqual(OAD.erreursContenu(MODULES), []);
});

// Rendu d'un module fabriqué : le composant lit window.OAD.modules().
function avecModules(liste, fn) {
  const sauve = window.OAD;
  window.OAD = Object.assign({}, OAD, { modules: () => liste });
  try { return fn(); } finally { window.OAD = sauve; }
}
test('rendu à blanc : fiche avec un tableau 3 × 2, sources et lecture graphique', () => {
  const m = moduleFabrique([{ id: 'tab', type: 'fiche', titre: 'Tableau', technologie: 'jets-portes', blocs: [
    { type: 'tableau', entetes: ['A', 'B', 'C'], lignes: [['1', '2', '3'], ['4', '5', '6']], source: 'F-VHA' },
    { type: 'liste', items: ['sans chiffre', { texte: 'lu : 40 %', source: 'F-VHA', lectureGraphique: true }] }
  ] }]);
  avecModules([m], () => {
    const c = new Component({});
    const out = rendre(c, '#/module/fabrique/tab');
    const bl = out.blocs[0];
    assert.strictEqual(bl.estTableau, true);
    const tbody = bl.tableau.c.find(x => x && x.t === 'tbody');
    assert.strictEqual([].concat(...tbody.c).filter(x => x.t === 'tr').length, 2);
    const thead = bl.tableau.c.find(x => x && x.t === 'thead');
    assert.ok([].concat(...thead.c[0].c).every(th => th.t === 'th' && th.p.scope === 'col'));
    assert.strictEqual(bl.sourceTxt, 'Source : Fiche volume/hectare, CIVC (février 2014)');
    assert.strictEqual(out.blocs[1].items[1].lectureGraphique, true);
    assert.strictEqual(out.blocs[1].items[1].aSource, true);
    assert.strictEqual(out.blocs[1].items[0].aSource, false);
    assert.strictEqual(out.section.aTechno, true);
    assert.strictEqual(out.section.technoLibelle, 'Jets portés');
    assert.strictEqual(out.mod.aChiffresSansSource, false);
  });
});
test('bandeau : nombre d\'éléments chiffrés sans source d\'un module non validé', () => {
  avecModules([moduleFabrique(ficheChiffree)], () => {
    const out = rendre(new Component({}), '#/module/fabrique/mesure');
    assert.strictEqual(out.mod.aChiffresSansSource, true);
    assert.strictEqual(out.mod.chiffresSansSourceTxt, '1 élément chiffré sans source.');
  });
});
test('rendu à blanc #/outils/pressionPourVolume : « S\'applique à : Jets portés, Jets projetés »', () => {
  const out = rendre(new Component({}), '#/outils/pressionPourVolume');
  assert.strictEqual(out.calcCourant.technosTxt, 'S\'applique à : Jets portés, Jets projetés');
});

// ----------------------------------------------------------------------
section('§12 B5 — exercices');

const exoVitesse = { id: 'exo-test-vitesse', type: 'exercice', titre: 'Vitesse', enonce: '50 m en 35 s : quelle vitesse ?',
  calculateur: 'vitesseMesuree', valeurs: { d: 50, t: 35 }, resultat: 0 };
const exoVolume = { id: 'exo-test-volume', type: 'exercice', titre: 'Volume', enonce: '9,6 L/min, 5 km/h, 7,7 m : quel volume ?',
  calculateur: 'volHa', valeurs: { Q: 9.6, v: 5, L: 7.7 }, resultat: 0 };

test('exercice vitesseMesuree {d: 50, t: 35} : attendu 5,142857 à 1 décimale ; 5,1 juste, 5,2 faux, « » faux', () => {
  const a = OAD.attenduExercice(exoVitesse);
  assertClose(a.valeur, 5.142857, 1e-6);
  assert.strictEqual(a.decimales, 1);
  assert.strictEqual(OAD.corrigerExercice(exoVitesse, 5.1).juste, true);
  assert.strictEqual(OAD.corrigerExercice(exoVitesse, 5.2).juste, false);
  assert.doesNotThrow(() => OAD.corrigerExercice(exoVitesse, ''));
  assert.strictEqual(OAD.corrigerExercice(exoVitesse, '').juste, false);
  assert.strictEqual(OAD.corrigerExercice(exoVitesse, NaN).juste, false);
  assert.doesNotThrow(() => OAD.corrigerExercice(null, 1));
});
test('exercice volHa {Q: 9,6, v: 5, L: 7,7} : attendu 149,61 à 0 décimale ; 150 juste, 149 faux', () => {
  assertClose(OAD.attenduExercice(exoVolume).valeur, 149.61, 1e-2);
  assert.strictEqual(OAD.corrigerExercice(exoVolume, 150).juste, true);
  assert.strictEqual(OAD.corrigerExercice(exoVolume, 149).juste, false);
});
test('validerModule : calculateur inconnu, valeurs incomplètes, indice 3 sur 1 résultat → une erreur chacun', () => {
  const e1 = OAD.validerModule(moduleFabrique([Object.assign({}, exoVitesse, { calculateur: 'inconnu' })]));
  assert.strictEqual(e1.filter(x => x.includes('calculateur inconnu')).length, 1);
  const e2 = OAD.validerModule(moduleFabrique([Object.assign({}, exoVitesse, { valeurs: { d: 50 } })]));
  assert.strictEqual(e2.filter(x => x.includes('valeurs manquantes (t)')).length, 1);
  const e3 = OAD.validerModule(moduleFabrique([Object.assign({}, exoVitesse, { resultat: 3 })]));
  assert.strictEqual(e3.filter(x => x.includes('indice de résultat invalide')).length, 1);
  assert.deepStrictEqual(OAD.validerModule(moduleFabrique([exoVitesse])), []);
});
test('catalogue : deux exercices de même id dans deux modules → erreur', () => {
  const a = moduleFabrique([exoVitesse]), b = Object.assign(moduleFabrique([exoVitesse]), { id: 'autre' });
  assert.ok(OAD.erreursContenu([a, b]).some(x => x.includes('en double sur le catalogue')));
});

/* Nombres écrits en dur dans les cas pratiques, recalculés par le moteur
   (D-B5-5) : un changement de formule qui les contredit est détecté. */
const CAS_CHIFFRES = [
  // 150 L/ha à 6 km/h, passage à 7 km/h : 150 × 6 / 7 = 128,57 ≈ 129.
  { sectionId: 'cas-vitesse', nombre: 129, calcul: () => Math.round(OAD.volumeApresChangementVitesse(150, 6, 7)) },
  // Distracteur : l'erreur de sens (150 × 7 / 6 = 175).
  { sectionId: 'cas-vitesse', nombre: 175, calcul: () => Math.round(OAD.volumeApresChangementVitesse(150, 7, 6)) },
  // B9 : pas de formule ; les nombres doivent être ceux du tableau D-IDR du
  // même module (passage tous les 3 rangs : feuilles, grappes).
  { sectionId: 'cas-passage', nombre: 50, calcul: () => ecartTableauPassages('Tous les 3 rangs', 2) },
  { sectionId: 'cas-passage', nombre: 60, calcul: () => ecartTableauPassages('Tous les 3 rangs', 3) }
];
function ecartTableauPassages(passage, colonne) {
  const t = MODULES.find(m => m.id === 'pulve-couverture').sections.find(s => s.id === 'passages')
    .blocs.find(b => b.type === 'tableau');
  return Math.abs(parseInt(t.lignes.find(l => l[0] === passage)[colonne].replace('−', '-'), 10));
}
const sectionsCas = () => [].concat(...MODULES.map(m => m.sections.filter(s => s.type === 'cas')));
test('CAS_CHIFFRES : chaque nombre figure dans les options de son cas et vaut le calcul du moteur', () => {
  CAS_CHIFFRES.forEach(x => {
    const s = sectionsCas().find(c => c.id === x.sectionId);
    assert.ok(s, x.sectionId);
    const texte = s.options.map(o => o.texte + ' ' + o.retour).join(' ');
    assert.ok(new RegExp('\\b' + x.nombre + '\\b').test(texte), x.sectionId + ' : ' + x.nombre + ' absent');
    assert.strictEqual(x.calcul(), x.nombre, x.sectionId + ' : ' + x.nombre);
  });
});
test('statique : tout cas dont les options contiennent un nombre de plus d\'un chiffre a une entrée CAS_CHIFFRES', () => {
  sectionsCas().forEach(s => {
    const nombres = s.options.map(o => o.texte).join(' ').match(/\d{2,}/g) || [];
    if (nombres.length) assert.ok(CAS_CHIFFRES.some(x => x.sectionId === s.id), s.id + ' : ' + nombres.join(', '));
  });
});
test('rendu à blanc : exercice saisi puis vérifié → progression écrite avec taux 1 et une date', () => {
  avecModules([moduleFabrique([exoVitesse])], () => {
    const c = new Component({});
    const h = '#/module/fabrique/exo-test-vitesse';
    const o0 = rendre(c, h);
    assert.strictEqual(o0.estExercice, true);
    assert.strictEqual(o0.exo.uniteTxt, '(km/h)');
    c.onReponseExo(evt('5,1', { 'data-exo': 'exo-test-vitesse' }));
    c.verifierExo(evt('exo-test-vitesse'));
    const out = rendre(c, h);
    assert.strictEqual(out.exo.corrige, true);
    assert.strictEqual(out.exo.verdict, 'Juste.');
    assert.strictEqual(out.exo.attenduTxt, '5,1 km/h');
    assert.strictEqual(out.exo.etapes[0].substitution, '3,6 × 50 / 35');
    const q = OAD.progressionSection(c.state.prog, 'fabrique', 'exo-test-vitesse').quiz;
    assert.strictEqual(q.taux, 1);
    assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(q.date));
    c.recommencerExo(evt('exo-test-vitesse'));
    const o2 = rendre(c, h);
    assert.strictEqual(o2.exo.corrige, false);
    assert.strictEqual(o2.exo.aDernier, true);
    c.onReponseExo(evt('5,2', { 'data-exo': 'exo-test-vitesse' }));
    c.verifierExo(evt('exo-test-vitesse'));
    assert.strictEqual(rendre(c, h).exo.verdict, 'À revoir.');
    assert.strictEqual(OAD.progressionSection(c.state.prog, 'fabrique', 'exo-test-vitesse').quiz.taux, 0);
  });
});

// ----------------------------------------------------------------------
section('§13 B6 — états et édition');

const mod3 = { id: 'm3', sections: [{ id: 'a', type: 'fiche' }, { id: 'b', type: 'fiche' }, { id: 'q', type: 'quiz' }] };
const voir = (p, m, ids) => ids.reduce((acc, id) => OAD.marquerVue(acc, m.id, id), p);
test('module à 3 sections dont 1 quiz : non-commence, en-cours, consulte, maitrise, quiz à 0,5 → consulte', () => {
  const p0 = OAD.progressionVide();
  assert.strictEqual(OAD.etatModule(p0, mod3), 'non-commence');
  assert.strictEqual(OAD.etatModule(voir(p0, mod3, ['a']), mod3), 'en-cours');
  const tout = voir(p0, mod3, ['a', 'b', 'q']);
  assert.strictEqual(OAD.etatModule(tout, mod3), 'consulte');
  assert.strictEqual(OAD.etatModule(OAD.enregistrerQuiz(tout, 'm3', 'q', { taux: 1 }, 'd'), mod3), 'maitrise');
  assert.strictEqual(OAD.etatModule(OAD.enregistrerQuiz(tout, 'm3', 'q', { taux: 0.5 }, 'd'), mod3), 'consulte');
  // Quiz réussi mais une section non ouverte : pas maîtrisé.
  assert.strictEqual(OAD.etatModule(OAD.enregistrerQuiz(voir(p0, mod3, ['a', 'q']), 'm3', 'q', { taux: 1 }, 'd'), mod3), 'en-cours');
});
test('module sans quiz, toutes sections vues → consulte ; bilanEvaluation → { 0, 0 }', () => {
  const m = { id: 'sq', sections: [{ id: 'a', type: 'fiche' }, { id: 'b', type: 'procedure' }] };
  const p = voir(OAD.progressionVide(), m, ['a', 'b']);
  assert.strictEqual(OAD.etatModule(p, m), 'consulte');
  assert.deepStrictEqual(OAD.bilanEvaluation(p, m), { reussies: 0, total: 0 });
});
test('exercice réussi + quiz réussi, toutes sections vues → maitrise', () => {
  const m = { id: 'mx', sections: [{ id: 'f', type: 'fiche' }, { id: 'q', type: 'quiz' }, { id: 'x', type: 'exercice' }] };
  let p = voir(OAD.progressionVide(), m, ['f', 'q', 'x']);
  p = OAD.enregistrerQuiz(p, 'mx', 'q', { taux: 1 }, 'd');
  assert.strictEqual(OAD.etatModule(p, m), 'consulte');
  p = OAD.enregistrerQuiz(p, 'mx', 'x', { taux: 1, bonnes: 1, total: 1 }, 'd');
  assert.strictEqual(OAD.etatModule(p, m), 'maitrise');
  assert.deepStrictEqual(OAD.bilanEvaluation(p, m), { reussies: 2, total: 2 });
  assert.deepStrictEqual(OAD.sectionsEvaluees(m).map(s => s.id), ['q', 'x']);
});
test('EDITION_CONTENU au format ISO ; README : même date en jj/mm/aaaa dans « Édition du contenu »', () => {
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(OAD.EDITION_CONTENU));
  const [a, mo, j] = OAD.EDITION_CONTENU.split('-');
  const readme = fs.readFileSync(path.join(RACINE, 'README.md'), 'utf8').replace(/\r\n/g, '\n');
  const titre = readme.match(/^## [\d. ]*Édition du contenu$/m);
  assert.ok(titre, 'section « Édition du contenu » absente du README');
  const suite = readme.slice(titre.index + titre[0].length);
  const sectionEd = suite.slice(0, suite.search(/^## /m) > 0 ? suite.search(/^## /m) : undefined);
  assert.ok(sectionEd.includes(j + '/' + mo + '/' + a), 'date ' + j + '/' + mo + '/' + a + ' absente');
});
test('pied de page : « Édition du contenu : jj/mm/aaaa »', () => {
  const out = rendre(new Component({}), '#/');
  const [a, mo, j] = OAD.EDITION_CONTENU.split('-');
  assert.strictEqual(out.editionTxt, 'Édition du contenu : ' + j + '/' + mo + '/' + a);
});
test('progression du format v1 écrite avant B6 : états recalculés sans exception, sans migration', () => {
  const ancienne = { version: 1, modules: {
    'pulve-entretien': { vues: ['pourquoi', 'plan-entretien', 'rincage-fin-traitement', 'quiz-entretien', 'cas-buse'],
      etapes: {}, taches: { 'plan-entretien': ['rincage'] },
      quiz: { 'quiz-entretien': { taux: 1, bonnes: 2, total: 2, date: '2026-09-20T08:00:00.000Z' } } },
    'module-disparu': { vues: ['x'] }
  } };
  MAGASIN['formation-machines:progression:v1'] = JSON.stringify(ancienne);
  try {
    const c = new Component({});
    const out = rendre(c, '#/progression');
    assert.ok(out.tableauProgression);
    const pe = MODULES.find(m => m.id === 'pulve-entretien');
    assert.ok(['consulte', 'maitrise', 'en-cours'].includes(OAD.etatModule(c.state.prog, pe)));
    const carte = rendre(c, '#/').domainesCatalogue[0].modules.find(x => x.titre === pe.titre);
    assert.ok(carte.quizTxt.startsWith('Quiz réussis : ') || carte.quizTxt === 'Pas de quiz dans ce module');
  } finally { delete MAGASIN['formation-machines:progression:v1']; }
});
test('tableau de progression : colonne « Quiz réussis »', () => {
  const t = rendre(new Component({}), '#/progression').tableauProgression;
  const thead = t.c.find(x => x && x.t === 'thead');
  assert.deepStrictEqual([].concat(...thead.c[0].c).map(th => th.c[0]), ['Module', 'Sections consultées', 'Quiz', 'Quiz réussis', 'État']);
});

// ----------------------------------------------------------------------
section('§14 B7 — contenu pulvérisation');

const PULVE = ['pulve-reglage-volume', 'pulve-entretien'].map(id => MODULES.find(m => m.id === id));
// Tout le texte visible d'un module (valeurs des champs texte, récursivement).
function textesModule(m) {
  const t = [];
  (function parcourir(x) {
    if (typeof x === 'string') t.push(x);
    else if (Array.isArray(x)) x.forEach(parcourir);
    else if (x && typeof x === 'object') Object.keys(x).forEach(k => { if (k !== 'source' && k !== 'id' && k !== 'code') parcourir(x[k]); });
  })(m.sections);
  return t.join('\n');
}
// Codes de source cités par les éléments d'un module.
function codesCites(m) {
  const c = new Set();
  (function parcourir(x) {
    if (Array.isArray(x)) x.forEach(parcourir);
    else if (x && typeof x === 'object') { if (typeof x.source === 'string') c.add(x.source); Object.values(x).forEach(parcourir); }
  })(m.sections);
  return [...c];
}
test('les deux modules pulvérisation sont conformes, aucun élément chiffré sans source', () => {
  PULVE.forEach(m => {
    assert.deepStrictEqual(OAD.validerModule(m), [], m.id);
    assert.deepStrictEqual(OAD.elementsChiffresSansSource(m).map(x => x.sectionId), [], m.id);
    assert.strictEqual(m.statut, 'brouillon');
  });
});
test('statique : ni « racine carrée », ni « 100 m », ni « chaque semaine »', () => {
  PULVE.forEach(m => {
    const t = textesModule(m);
    ['racine carrée', '100 m', 'chaque semaine'].forEach(x => assert.ok(!t.toLowerCase().includes(x), m.id + ' : ' + x));
  });
});
test('exo-vitesse → 5,1 km/h ; exo-volume → 150 L/ha (0 décimale)', () => {
  const s = id => PULVE[0].sections.find(x => x.id === id);
  const v = OAD.attenduExercice(s('exo-vitesse')), w = OAD.attenduExercice(s('exo-volume'));
  assert.strictEqual(v.decimales, 1);
  assert.strictEqual(Math.round(v.valeur * 10) / 10, 5.1);
  assert.strictEqual(w.decimales, 0);
  assert.strictEqual(Math.round(w.valeur), 150);
});
test('codes de source : sous-ensemble de F-VHA, F-FIL, A-LVC, A-WEB, B20-1, F-PRE', () => {
  const permis = ['F-VHA', 'F-FIL', 'A-LVC', 'A-WEB', 'B20-1', 'F-PRE'];
  PULVE.forEach(m => {
    m.sources.forEach(s => assert.ok(permis.includes(s.code), m.id + ' : ' + s.code));
    codesCites(m).forEach(c => assert.ok(permis.includes(c), m.id + ' : ' + c));
  });
});
test('rendu à blanc des nouvelles sections', () => {
  const c = new Component({});
  const r = id => rendre(c, '#/module/pulve-reglage-volume/' + id);
  assert.strictEqual(r('table-vitesse').blocs[1].estTableau, true);
  assert.strictEqual(r('calc-largeur').calcCourant.id, 'largeurTraitee');
  assert.strictEqual(r('calc-debit-cuve').calcCourant.id, 'debitCuve');
  assert.strictEqual(r('calc-ecart').calcCourant.aTableau, true);
  assert.strictEqual(r('exo-vitesse').estExercice, true);
  assert.strictEqual(r('exo-volume').exo.uniteTxt, '(L/ha)');
  assert.strictEqual(r('controle-diffuseurs').procedure.etapes.length, 4);
  assert.strictEqual(r('mesure-debit').procedure.etapes[3].aSource, true);
  const e = rendre(c, '#/module/pulve-entretien/plan-entretien');
  const libelles = e.entretien.groupes.map(g => g.libelle);
  assert.ok(libelles.includes('Au moins deux fois par an'));
  const cabine = [].concat(...e.entretien.groupes.map(g => g.taches)).find(t => t.id === 'filtre-cabine');
  assert.strictEqual(cabine.detail, 'ou toutes les 500 h');
  assert.strictEqual(rendre(c, '#/module/pulve-reglage-volume').mod.aChiffresSansSource, false);
});

// ----------------------------------------------------------------------
section('§15 B8 — contenu interceps');

const INTERCEPS = MODULES.find(m => m.id === 'sol-outil-interceps');
test('module interceps conforme, aucun élément chiffré sans source', () => {
  assert.deepStrictEqual(OAD.validerModule(INTERCEPS), []);
  assert.deepStrictEqual(OAD.elementsChiffresSansSource(INTERCEPS).map(x => x.sectionId), []);
  assert.strictEqual(INTERCEPS.statut, 'brouillon');
});
test('tableau des outils d\'ouverture : 6 lignes, 4 colonnes', () => {
  const t = INTERCEPS.sections.find(s => s.id === 'types-outils').blocs.find(b => b.type === 'tableau');
  assert.strictEqual(t.lignes.length, 6);
  assert.strictEqual(t.entetes.length, 4);
  t.lignes.forEach(l => assert.strictEqual(l.length, 4));
  assert.strictEqual(t.source, 'F-OUV');
});
test('statique : aucun texte du module ne contient « 50 m »', () => {
  assert.ok(!/\b50\s?m\b/.test(textesModule(INTERCEPS)));
});
test('codes : F-BOI, F-BRA, F-DER, F-OUV, D-SOL ; quiz q-profondeur et q-ouverture sourcés', () => {
  assert.deepStrictEqual(INTERCEPS.sources.map(s => s.code), ['F-BOI', 'F-BRA', 'F-DER', 'F-OUV', 'D-SOL']);
  const q = INTERCEPS.sections.find(s => s.id === 'quiz-interceps').questions;
  ['q-profondeur', 'q-ouverture'].forEach(id => assert.ok(q.find(x => x.id === id).source, id));
});
test('rendu à blanc des sections du module interceps', () => {
  const c = new Component({});
  INTERCEPS.sections.forEach(s => rendre(c, '#/module/sol-outil-interceps/' + s.id));
  assert.strictEqual(rendre(c, '#/module/sol-outil-interceps/types-outils').blocs.filter(b => b.estTableau).length, 1);
});

// ----------------------------------------------------------------------
section('§16 B9 — nouveaux modules');

const NOUVEAUX_B9 = ['pulve-filtration', 'pulve-remise-en-route', 'pulve-couverture'].map(id => MODULES.find(m => m.id === id));
test('6 modules chargés dans l\'ordre déclaré ; les 3 nouveaux après pulve-entretien', () => {
  assert.strictEqual(MODULES.length, 6);
  const ids = MODULES.map(m => m.id);
  assert.strictEqual(ids.indexOf('pulve-filtration'), ids.indexOf('pulve-entretien') + 1);
});
test('les 3 nouveaux modules : conformes, brouillon, aucun élément chiffré sans source', () => {
  NOUVEAUX_B9.forEach(m => {
    assert.ok(m, 'module manquant');
    assert.deepStrictEqual(OAD.validerModule(m), [], m.id);
    assert.deepStrictEqual(OAD.elementsChiffresSansSource(m).map(x => x.sectionId), [], m.id);
    assert.strictEqual(m.statut, 'brouillon');
    assert.strictEqual(m.valideur, null);
  });
});
test('tableau de filtration : 5 lignes, 5 colonnes ; « Gris » → 80 mesh', () => {
  const t = NOUVEAUX_B9[0].sections.find(s => s.id === 'principe').blocs.find(b => b.type === 'tableau');
  assert.strictEqual(t.lignes.length, 5);
  assert.strictEqual(t.entetes.length, 5);
  assert.strictEqual(t.lignes.find(l => l[0] === 'Gris')[t.entetes.indexOf('Mesh')], '80');
});
test('statique : ni « EN 907 », ni « EN 1553 », ni « TVI », ni « soufre »', () => {
  NOUVEAUX_B9.forEach(m => {
    const t = textesModule(m);
    ['EN 907', 'EN 1553', 'TVI', 'soufre'].forEach(x => assert.ok(!t.includes(x), m.id + ' : ' + x));
  });
});
test('rendu à blanc de chaque section des 3 nouveaux modules', () => {
  const c = new Component({});
  NOUVEAUX_B9.forEach(m => m.sections.forEach(s => rendre(c, '#/module/' + m.id + '/' + s.id)));
  const rosee = rendre(c, '#/module/pulve-couverture/rosee');
  assert.strictEqual(rosee.blocs[1].lectureGraphique, true);
  const cat = rendre(c, '#/').domainesCatalogue.find(g => g.libelle === 'Pulvérisation');
  assert.strictEqual(cat.modules.length, 5);
});

console.log(`\n${passed} ok, ${failed} FAIL, ${skipped} skip`);
if (failed > 0) process.exit(1);
