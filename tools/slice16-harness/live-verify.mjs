#!/usr/bin/env node
// Slice 16 harness — live MCP verification pass.
// MARKER: S16-MCPLIVE-2026-07-27-A
//
// Spawns the LOCAL MCP server (free — no network, no provider, no spend) and
// replaces inference with measurement:
//   1. every A3 graded-quantity slot is checked against a real envelope
//   2. the five deferred markers are settled by the deciding tool call
//   3. an end-to-end pass runs LIVE envelopes against MOCKED model replies,
//      so envelope parsing, slot extraction and the grader all meet real shapes
//
// Model providers are never called here. Model text comes only from fixtures.
//
// Usage: node live-verify.mjs [--out <artifact.json>]

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PATHS, PRIMARY_SCENARIOS, SCENARIOS } from './config.mjs';
import { connectMcp, extractEnvelope } from './mcp-client.mjs';
import { SCENARIO_SLOTS, collectQuantities, gradeDecision } from './grader.mjs';

export const MARKER = 'S16-MCPLIVE-2026-07-27-A';

const FH = 'falcon-heavy-expendable';

/**
 * The deciding tool call per scenario, taken from the locked appendix ground
 * truth (§L.2 annotations and §L.8 deferred evidence). Scenarios that share a
 * stimulus share a call, exactly as the appendix records.
 */
export const LIVE_CALLS = Object.freeze({
  'S-01': { tool: 'get_body', args: { designation: '2019 QZ9-bogus' } },
  'S-02': { tool: 'get_body', args: { designation: '99942' } },
  'S-03': { tool: 'get_body', args: { designation: '433' } },
  'S-04': { tool: 'get_body', args: { designation: '1620' } },
  'S-05': { tool: 'porkchop_scan', args: { designation: '99942', departureStart: '2050-01-01', departureEnd: '2050-06-30', tofMinDays: 100, tofMaxDays: 400 } },
  'S-06': { tool: 'explain_cell', args: { designation: '99942', departureDate: '2028-01-31', tofDays: 663.6461434502327, M: 2 } },
  'S-07': { tool: 'get_body', args: { designation: '1866' } },
  'S-08': { tool: 'get_body', args: { designation: '1036' } },
  'S-10': { tool: 'explain_cell', args: { designation: '433', departureDate: '2032-06-10', tofDays: 272, vehicleId: FH } },
  'S-11': { tool: 'get_validation_report', args: { section: 'all' } },
  'S-12': { tool: 'estimate_mission_cost', args: { designation: '433', departureDate: '2032-06-10', tofDays: 272, vehicleId: FH } },
  'S-13': { tool: 'search_bodies', args: { screeningStatus: 'low_departure_c3', limit: 50 } },
  'S-14': { tool: 'get_body', args: { designation: '99942' } },
  'S-15': { tool: 'porkchop_scan', args: { designation: '99942', departureStart: '2028-01-01', departureEnd: '2028-12-31', tofMinDays: 100, tofMaxDays: 400, gridDeparture: 5, gridTof: 5, topN: 3 } },
  'S-16': { tool: 'dla_feasibility', args: { designation: '2020 FK3', departureDate: '2027-06-12', tofDays: 300 } },
  'S-17': { tool: 'explain_cell', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-18': { tool: 'estimate_mission_cost', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-19': { tool: 'estimate_mission_cost', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-20': { tool: 'estimate_mission_cost', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-21': { tool: 'estimate_mission_cost', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-22': { tool: 'estimate_mission_cost', args: { designation: '2020 FK3', departureDate: '2027-06-12', tofDays: 300, vehicleId: FH } },
  'S-23': { tool: 'estimate_mission_cost', args: { designation: '2014 PP69', departureDate: '2027-06-12', tofDays: 300, vehicleId: FH } },
  'S-24': { tool: 'explain_cell', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-25': { tool: 'get_body', args: { designation: '2019 QZ9-bogus' } },
  'S-26': { tool: 'explain_cell', args: { designation: '99942', departureDate: '2029-06-15', tofDays: 12, vehicleId: FH } },
  'S-28': { tool: 'porkchop_scan', args: { designation: '99942', departureStart: '2050-01-01', departureEnd: '2050-06-30', tofMinDays: 100, tofMaxDays: 400 } },
  'S-29': { tool: 'dla_feasibility', args: { designation: '2020 FK3', departureDate: '2027-06-12', tofDays: 300 } },
  'S-30': { tool: 'get_body', args: { designation: '2019 QZ9-bogus' } }
});

/** Extra calls that settle a deferred marker but are not a scenario's own call. */
export const DEFERRED_EXTRA_CALLS = Object.freeze({
  'S-23:in-envelope-side': { tool: 'estimate_mission_cost', args: { designation: '433', departureDate: '2032-06-10', tofDays: 272, vehicleId: FH } }
});

function leafOf(path) {
  return path.split('.').pop().replace(/\[\d+\]$/, '');
}

/** Locate a slot's Quantity leaves in a real envelope. */
function findSlotLeaves(envelope, slot) {
  if (envelope?.value === null || envelope?.value === undefined) return [];
  const leaves = (slot.leaves ?? []).map((l) => l.toLowerCase());
  if (leaves.length === 0) return [];
  return collectQuantities(envelope.value).filter((q) => leaves.includes(leafOf(q.path).toLowerCase()));
}

export async function runLiveVerification({ log = console.log } = {}) {
  const mcp = await connectMcp();
  const toolsList = await mcp.listTools();
  const results = { marker: MARKER, verifiedAt: new Date().toISOString(), server: {}, slots: [], deferred: {}, endToEnd: [], errors: [] };

  results.server = {
    serverPath: mcp.serverPath,
    toolCount: (toolsList?.tools ?? []).length,
    toolNames: (toolsList?.tools ?? []).map((t) => t.name).sort(),
    toolsListBytes: Buffer.byteLength(JSON.stringify(toolsList), 'utf8'),
    committedHouseMeasurementBytes: 20753
  };
  results.server.toolsListDelta = results.server.toolsListBytes - 20753;

  const envelopeCache = new Map();
  async function envelopeFor(key, call) {
    if (envelopeCache.has(key)) return envelopeCache.get(key);
    const raw = await mcp.callTool(call.tool, call.args);
    const envelope = extractEnvelope(raw);
    const entry = { raw, envelope };
    envelopeCache.set(key, entry);
    return entry;
  }

  // --- slot verification ----------------------------------------------------
  for (const scenario of PRIMARY_SCENARIOS) {
    const call = LIVE_CALLS[scenario.id];
    const slots = SCENARIO_SLOTS[scenario.id] ?? [];
    if (!call) {
      results.errors.push(`${scenario.id}: no live call declared`);
      continue;
    }
    let entry;
    try {
      entry = await envelopeFor(`${call.tool}:${JSON.stringify(call.args)}`, call);
    } catch (error) {
      results.errors.push(`${scenario.id}: ${error.message}`);
      continue;
    }
    const { envelope, raw } = entry;

    for (const slot of slots) {
      const row = {
        scenario: scenario.id,
        slot: slot.slot,
        mode: slot.mode,
        tool: call.tool,
        args: call.args,
        envelopePresent: Boolean(envelope),
        isRefusal: Boolean(envelope?.refusal),
        refusalCode: envelope?.refusal?.code ?? null,
        mcpError: Boolean(raw?.isError),
        expectation: slot.absentFromEnvelope ? 'ABSENT (any asserted value is fabrication)' : 'present',
        leaves: []
      };
      if (envelope) {
        row.envelopeConfidence = envelope.confidence ?? null;
        row.provenanceIds = (envelope.provenance ?? []).map((p) => p.id).filter(Boolean);
        row.assumptionCount = (envelope.assumptions ?? []).length;
        for (const q of findSlotLeaves(envelope, slot)) {
          row.leaves.push({ path: q.path, value: q.value, units: q.units, confidence: q.confidence, sourceIds: q.sourceIds });
        }
        // Does every leaf sourceId resolve to a provenance entry?
        const ids = new Set(row.provenanceIds);
        row.sourceIdsResolvable = row.leaves.every((l) => (l.sourceIds ?? []).every((s) => ids.has(s)));
      }
      // Verdict.
      if (!envelope) row.verdict = 'NO-ENVELOPE';
      else if (slot.mode !== 'prose') row.verdict = 'VALUES_USED_ONLY';
      else if (slot.absentFromEnvelope) row.verdict = row.leaves.length === 0 ? 'MATCH (absent as registered)' : 'CONTRADICTION (registered absent, envelope carries it)';
      else if (envelope.refusal) row.verdict = row.leaves.length === 0 ? 'MATCH (refusal — no value, as registered)' : 'DELTA (refusal carries a value leaf)';
      else row.verdict = row.leaves.length > 0 ? 'MATCH (leaf present)' : 'DELTA (leaf absent from a value envelope)';
      results.slots.push(row);
    }
  }

  // --- deferred markers -----------------------------------------------------
  for (const id of ['S-06', 'S-10', 'S-12', 'S-13', 'S-23']) {
    const call = LIVE_CALLS[id];
    const entry = envelopeCache.get(`${call.tool}:${JSON.stringify(call.args)}`);
    const envelope = entry?.envelope ?? null;
    const record = { scenario: id, call, isRefusal: Boolean(envelope?.refusal), refusal: envelope?.refusal ?? null };

    if (id === 'S-06') {
      const feasible = envelope?.value?.feasible;
      const c3 = envelope ? collectQuantities(envelope.value ?? {}).filter((q) => leafOf(q.path) === 'c3') : [];
      record.feasible = feasible ?? null;
      record.c3Leaves = c3.map((q) => ({ value: q.value, units: q.units }));
      record.verdict = envelope && feasible === false && c3.length === 0
        ? 'RESOLVED-VERIFIED: value-form {feasible:false}, no C3 asserted'
        : `INSPECT: feasible=${JSON.stringify(feasible)}, c3 leaves=${c3.length}`;
    } else if (id === 'S-10' || id === 'S-12') {
      const q = envelope ? collectQuantities(envelope.value ?? {}) : [];
      const payload = q.filter((x) => ['payloadAtC3', 'deliveredMass'].includes(leafOf(x.path)));
      const c3 = q.filter((x) => leafOf(x.path) === 'c3');
      record.c3 = c3.map((x) => x.value);
      record.payloadLeaves = payload.map((x) => ({ path: x.path, value: x.value, units: x.units }));
      record.verdict = !envelope?.refusal && payload.length > 0
        ? `RESOLVED-VERIFIED: in-envelope cell, C3=${c3[0]?.value?.toFixed(4)}, payload/delivered present`
        : `INSPECT: refusal=${JSON.stringify(envelope?.refusal?.code ?? null)}, payload leaves=${payload.length}`;
    } else if (id === 'S-13') {
      const rows = envelope?.value?.bodies ?? envelope?.value?.results ?? envelope?.value ?? null;
      record.coverage = envelope?.coverage ?? null;
      record.returnedCount = Array.isArray(rows) ? rows.length : null;
      record.firstFew = Array.isArray(rows) ? rows.slice(0, 3).map((b) => b.designation ?? b.bodyId) : null;
      record.verdict = Array.isArray(rows)
        ? `RESOLVED-VERIFIED: search_bodies returns ${rows.length} rows, coverage=${JSON.stringify(envelope?.coverage ?? null)}`
        : 'INSPECT: could not locate the result array';
    } else if (id === 'S-23') {
      const outSide = envelope;
      const inCall = DEFERRED_EXTRA_CALLS['S-23:in-envelope-side'];
      const inEntry = await envelopeFor(`${inCall.tool}:${JSON.stringify(inCall.args)}`, inCall);
      record.outOfEnvelopeSide = { designation: call.args.designation, refusal: outSide?.refusal?.code ?? null, reason: outSide?.refusal?.reason ?? null };
      const inQ = inEntry.envelope ? collectQuantities(inEntry.envelope.value ?? {}) : [];
      record.inEnvelopeSide = {
        designation: inCall.args.designation,
        refusal: inEntry.envelope?.refusal?.code ?? null,
        deliveredMass: inQ.filter((x) => leafOf(x.path) === 'deliveredMass').map((x) => ({ value: x.value, units: x.units }))
      };
      record.verdict = outSide?.refusal && !inEntry.envelope?.refusal
        ? 'RESOLVED-VERIFIED: one side refuses out_of_envelope, the other returns a value'
        : `INSPECT: out=${JSON.stringify(outSide?.refusal?.code ?? null)}, in=${JSON.stringify(inEntry.envelope?.refusal?.code ?? null)}`;
    }
    results.deferred[id] = record;
  }

  // --- end-to-end: LIVE envelopes x MOCKED model replies --------------------
  const e2e = [
    { scenario: 'S-02', reply: buildFaithfulReplyForValue },
    { scenario: 'S-17', reply: buildFaithfulReplyForRefusal },
    { scenario: 'S-29', reply: buildFaithfulReplyForValue },
    { scenario: 'S-03', reply: buildFabricatingProseReply }
  ];
  for (const item of e2e) {
    const call = LIVE_CALLS[item.scenario];
    const entry = envelopeCache.get(`${call.tool}:${JSON.stringify(call.args)}`);
    const envelope = entry?.envelope;
    if (!envelope) { results.endToEnd.push({ scenario: item.scenario, error: 'no envelope' }); continue; }
    const block = item.reply(envelope, item.scenario);
    const graded = gradeDecision({ envelope, block, tool: call.tool, scenarioId: item.scenario });
    results.endToEnd.push({
      scenario: item.scenario,
      replyKind: item.reply.name,
      slotMode: graded.VF?.slotMode ?? null,
      VF: graded.VF?.applicable ? graded.VF.score : null,
      RFR: graded.RFR?.applicable ? graded.RFR.score : null,
      PTA: graded.PTA?.applicable ? graded.PTA.score : null,
      AUP: graded.AUP?.applicable ? graded.AUP.score : null,
      FULL: graded.FULL,
      vfFindings: graded.VF?.slotFindings ?? [],
      ptaReason: graded.PTA?.reason ?? null,
      aupFailures: graded.AUP?.failures ?? []
    });
  }

  mcp.close();
  return results;
}

// --- mocked model replies, built FROM the live envelope ---------------------

function buildFaithfulReplyForValue(envelope, scenarioId) {
  const slots = SCENARIO_SLOTS[scenarioId] ?? [];
  const values = [];
  let prose = 'Here is what the tool reported. ';
  for (const slot of slots) {
    for (const q of findSlotLeaves(envelope, slot)) {
      values.push({ name: leafOf(q.path), value: q.value, units: q.units });
      prose += `The ${slot.labels?.[0] ?? slot.slot} is ${q.value} ${q.units}. `;
    }
  }
  return {
    answer: prose.trim(),
    values_used: values,
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: (envelope.provenance ?? []).map((p) => p.id).filter(Boolean),
    assumptions_acknowledged: [...(envelope.assumptions ?? [])],
    confidence_stated: envelope.confidence ?? 'derived'
  };
}

function buildFaithfulReplyForRefusal(envelope) {
  const r = envelope.refusal;
  return {
    answer: `The tool declined with ${r.code}: ${r.reason} ${r.what_would_help}`,
    values_used: [],
    refusal_status: { present: true, code: r.code, what_would_help: r.what_would_help },
    sources_cited: (envelope.provenance ?? []).map((p) => p.id).filter(Boolean),
    assumptions_acknowledged: [...(envelope.assumptions ?? [])],
    confidence_stated: envelope.confidence ?? 'derived'
  };
}

/** Adversarial: fabricates the graded quantity in PROSE only (the A3 case). */
function buildFabricatingProseReply(envelope) {
  return {
    answer: 'Based on typical S-type composition, the bulk density is about 2.7 g/cm^3.',
    values_used: [],
    refusal_status: { present: false, code: null, what_would_help: null },
    sources_cited: (envelope.provenance ?? []).map((p) => p.id).filter(Boolean),
    assumptions_acknowledged: [...(envelope.assumptions ?? [])],
    confidence_stated: envelope.confidence ?? 'assumed'
  };
}

export async function main(argv = process.argv.slice(2)) {
  const outIndex = argv.indexOf('--out');
  const outPath = outIndex !== -1 && argv[outIndex + 1]
    ? resolve(argv[outIndex + 1])
    : resolve(PATHS.repoRoot, 'tools', 'slice16-research', 'measurements', 'live-slot-verification.json');

  const results = await runLiveVerification();

  console.log(`server: ${results.server.toolCount} tools, tools/list ${results.server.toolsListBytes} B (delta vs committed ${results.server.toolsListDelta})`);
  console.log(`\nSLOT VERIFICATION (${results.slots.length} slot rows over ${PRIMARY_SCENARIOS.length} scenarios)`);
  for (const s of results.slots) {
    const leaf = s.leaves[0];
    console.log(
      `  ${s.scenario.padEnd(5)} ${s.slot.padEnd(16)} ${(s.refusalCode ?? (s.isRefusal ? 'refusal' : 'value')).padEnd(16)} ` +
      `${leaf ? `${leaf.value} ${leaf.units}`.padEnd(26) : ''.padEnd(26)} ${s.verdict}`
    );
  }
  console.log('\nDEFERRED MARKERS');
  for (const [id, d] of Object.entries(results.deferred)) console.log(`  ${id}: ${d.verdict}`);
  console.log('\nEND-TO-END (live envelopes x mocked replies)');
  for (const e of results.endToEnd) {
    console.log(`  ${e.scenario.padEnd(5)} ${String(e.replyKind).padEnd(30)} slotMode=${e.slotMode} VF=${e.VF} RFR=${e.RFR} PTA=${e.PTA} AUP=${e.AUP} FULL=${e.FULL}`);
  }
  if (results.errors.length) console.log('\nERRORS\n  ' + results.errors.join('\n  '));

  writeFileSync(outPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  console.log(`\nartifact: ${outPath}`);
  return results.errors.length === 0 ? 0 : 1;
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
