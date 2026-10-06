// K2 Momentum Bank — catch-envelope model (research prototype, NOT src/v2/core).
//
// Interface between Aster and Skyhook (kernel K2, strategy/IDEA_KERNELS_2026-09.md):
// given an inbound payload's Earth-arrival v-infinity, what does the Rev A tether
// do for it, and what does the catch do for the tether's momentum budget?
//
// Classic script on purpose: it loads from file:// in a browser via <script>, and
// Node loads it with a side-effect `import`. It assigns globalThis.K2Model.
//
// Scope and model limits, stated once:
//   - Planar, impulsive, two-body Earth only (no J2, drag, Moon or Sun). [Certain: that is the model]
//   - The tether is rigid; its CoM orbit is circular at Rev A altitude. [Likely: first-order]
//   - Facility energy accounting is first-order orbital energy only; spin-energy redistribution
//     and the CoM shift while the payload is attached are neglected. [Likely]
//   - Every tether constant comes from the Rev A snapshot passed in (Skyhook params/rev_a.json).
//     Constants that Rev A does not define are named in ASSUMPTIONS with a label.

(function (root) {
  'use strict';

  // Constants Rev A does NOT carry. Each one is labeled and surfaced in the UI.
  var ASSUMPTIONS = {
    // Skyhook physics/skyhook_physics.py line 40 uses 6371.0 (mean radius). That reproduces
    // Rev A's derived r_tip = 7301 km, C3 = -8.06 and apogee 85,222 km. NOTE: rev_a.json's own
    // com_radius_km = 6988 implies 6378 km. Skyhook-side inconsistency, flagged in README. [Certain]
    R_EARTH_KM: { value: 6371.0, label: '[Certain]', source: 'skyhook physics/skyhook_physics.py R_EARTH_KM' },
    G0_MS2: { value: 9.80665, label: '[Certain]', source: 'standard gravity' },
    // Entry interface altitude. 120 km (~400,000 ft) is the Apollo-era convention. [Likely]
    ENTRY_INTERFACE_ALT_KM: { value: 120, label: '[Likely]', source: 'Apollo entry-interface convention' },
    // Atmospheric scale height for the Allen-Eggers ballistic peak-deceleration estimate. [Likely]
    SCALE_HEIGHT_KM: { value: 7.2, label: '[Likely]', source: 'Allen & Eggers 1958 exponential atmosphere' }
  };

  function sq(x) { return x * x; }

  // Derive the Rev A machine from the params snapshot. Every output traces to
  // an EQ in skyhook/CLAUDE.md or a named assumption above.
  function deriveMachine(revA, overrides) {
    overrides = overrides || {};
    var mu = revA.orbital.mu_earth_m3s2 / 1e9;                       // km^3/s^2 [Certain]
    var RE = ASSUMPTIONS.R_EARTH_KM.value;
    var hCom = revA.orbital.com_altitude_km;                           // Rev A locked
    var L = revA.geometry.tether_half_length_km;                       // Rev A locked
    var vTip = overrides.vTip != null ? overrides.vTip : revA.kinematics.v_tip_kms;
    var rCom = RE + hCom;
    var rUp = rCom + L;
    var rLow = rCom - L;
    var vOrb = Math.sqrt(mu / rCom);                                   // EQ-2 [Certain]
    var vUp = vOrb + vTip;                                             // EQ-3 upper tip, ECI [Certain first-order]
    var vLow = vOrb - vTip;                                            // EQ-3 lower tip, ECI (no Earth rotation)
    var omega = vTip / L;                                              // inertial spin rate, rad/s
    var n = Math.sqrt(mu / Math.pow(rCom, 3));                         // orbital mean motion, rad/s
    var epsUp = sq(vUp) / 2 - mu / rUp;
    return {
      mu: mu, RE: RE, hCom: hCom, L: L, vTip: vTip,
      rCom: rCom, rUp: rUp, rLow: rLow,
      vOrb: vOrb, vUp: vUp, vLow: vLow,
      vEscUp: Math.sqrt(2 * mu / rUp),
      omega: omega, n: n,
      spinPeriodMin: 2 * Math.PI / omega / 60,
      orbitPeriodMin: 2 * Math.PI / n / 60,
      tipAccelG: sq(vTip * 1e3) / (L * 1e3) / ASSUMPTIONS.G0_MS2.value,
      c3Up: 2 * epsUp,
      apogeeAltUpKm: epsUp < 0 ? (2 * (-mu / (2 * epsUp)) - rUp) - RE : Infinity,
      // Time from an upper-tip catch until the payload sits at local nadir (lower tip).
      // The local vertical turns at n while the tether turns at omega. [Certain kinematics]
      catchToNadirS: Math.PI / (omega - n)
    };
  }

  // Ballistic entry conditions for a state (r, v, flight-path angle 0 at release apsis).
  function entryFromApsis(m, r0, v0) {
    var mu = m.mu;
    var rEI = m.RE + ASSUMPTIONS.ENTRY_INTERFACE_ALT_KM.value;
    var eps = sq(v0) / 2 - mu / r0;
    var h = r0 * v0;
    var a = -mu / (2 * eps);
    var e = Math.sqrt(Math.max(0, 1 + 2 * eps * sq(h) / sq(mu)));
    var rPeri = a * (1 - e);
    if (eps >= 0) rPeri = sq(h) / mu / (1 + e);
    if (rPeri >= rEI) return { enters: false, perigeeAltKm: rPeri - m.RE };
    var vEI = Math.sqrt(2 * (eps + mu / rEI));
    var cosG = Math.min(1, h / (rEI * vEI));
    var gammaDeg = Math.acos(cosG) * 180 / Math.PI;
    return {
      enters: true, perigeeAltKm: rPeri - m.RE, vEI: vEI, gammaDeg: gammaDeg,
      allenEggersPeakG: allenEggersPeakG(vEI, gammaDeg)
    };
  }

  // Allen-Eggers ballistic peak deceleration: v^2 sin(gamma) / (2 e H). [Likely: ballistic, exponential atm]
  function allenEggersPeakG(vKms, gammaDeg) {
    var H = ASSUMPTIONS.SCALE_HEIGHT_KM.value;
    var aKms2 = sq(vKms) * Math.sin(gammaDeg * Math.PI / 180) / (2 * Math.E * H);
    return aKms2 * 1e3 / ASSUMPTIONS.G0_MS2.value;
  }

  // Direct hyperbolic entry from v_inf with a chosen entry flight-path angle.
  function directEntry(m, vInf, gammaDeg) {
    var rEI = m.RE + ASSUMPTIONS.ENTRY_INTERFACE_ALT_KM.value;
    var vEI = Math.sqrt(sq(vInf) + 2 * m.mu / rEI);
    return { vEI: vEI, gammaDeg: gammaDeg, allenEggersPeakG: allenEggersPeakG(vEI, gammaDeg) };
  }

  function propellantFraction(dvKms, ispS) {
    // EQ-1 Tsiolkovsky, propellant mass per kg of post-burn mass. [Certain]
    var ve = ispS * ASSUMPTIONS.G0_MS2.value / 1e3;
    return Math.exp(Math.abs(dvKms) / ve) - 1;
  }

  // Core K2 evaluation.
  //   vInf          Earth-arrival hyperbolic excess, km/s (Aster supplies this once K1 exists)
  //   decDeg        arrival-asymptote declination w.r.t. the facility's reference plane
  //   incDeg        facility orbit inclination ([Speculative] input: Rev A does not lock it)
  //   tolKms        relative-velocity tolerance at the catch ([Speculative] input: unlocked)
  //   ispS          payload stage Isp for the matching burn ([Speculative] input)
  //   mode          'drop' (release at lower tip -> Earth entry) or 'hold' (move to CoM, 610 km circular)
  //   facilityMassT facility mass for orbit-perturbation estimate ([Speculative] input)
  //   payloadT      payload mass per event
  //   directGammaDeg entry angle assumed for the no-tether direct entry comparison
  function evaluate(revA, inp) {
    var m = deriveMachine(revA, { vTip: inp.vTip });
    var mu = m.mu;
    var vInf = inp.vInf;

    // 1. Arrival: periapsis placed at the upper-tip radius, tangent to the tip velocity.
    var vPeriUp = Math.sqrt(sq(vInf) + 2 * mu / m.rUp);              // vis-viva [Certain]
    var dvMatchSigned = vPeriUp - m.vUp;                                // + : payload must brake
    var dvMatch = Math.max(0, Math.abs(dvMatchSigned) - inp.tolKms);

    // 2. Plane alignment. The facility plane contains the asymptote only if |dec| <= inc.
    //    Otherwise the asymptote must be rotated far from Earth: dv ~ 2 vInf sin(delta/2). [Likely]
    var planeGapDeg = Math.max(0, Math.abs(inp.decDeg) - Math.abs(inp.incDeg));
    var dvPlane = 2 * vInf * Math.sin(planeGapDeg * Math.PI / 360);

    var dvTether = dvMatch + dvPlane;

    // 3. Fate after the catch.
    var epsUp = sq(m.vUp) / 2 - mu / m.rUp;
    var epsLow = sq(m.vLow) / 2 - mu / m.rLow;
    var epsCom = -mu / (2 * m.rCom);
    var out = {};
    if (inp.mode === 'hold') {
      // Payload moved to the CoM and released into the 610 km circular orbit. [Speculative ops: climber]
      out.epsAfter = epsCom;
      out.dvRocketOnly = Math.sqrt(sq(vInf) + 2 * mu / m.rCom) - m.vOrb; // single periapsis burn to circular
      out.rocketOnlyNote = 'propulsive capture straight into the 610 km circular CoM orbit';
    } else {
      out.epsAfter = epsLow;
      out.dvRocketOnly = 0;                                              // direct entry needs no burn
      out.entry = entryFromApsis(m, m.rLow, m.vLow);
      out.direct = directEntry(m, vInf, inp.directGammaDeg);
      out.rocketOnlyNote = 'direct entry from the hyperbola: no burn, but at the full arrival speed';
    }

    // 4. Momentum bank. Energy deposited per kg caught vs energy withdrawn per kg thrown
    //    (outbound throw = catch suborbital at lower tip, release at upper tip). [Likely first-order]
    var depositPerKg = epsUp - out.epsAfter;                            // km^2/s^2 = MJ/kg
    var withdrawPerKg = epsUp - epsLow;
    var bankRatio = depositPerKg / withdrawPerKg;

    // 5. Facility orbit after ONE outbound throw of payloadT (unbalanced), and after one inbound
    //    catch of the same mass. Energy taken at r_com; that point stays an apsis. [Likely]
    var M = inp.facilityMassT;
    function apsesAfter(dEpsFacility) {
      var eps = epsCom + dEpsFacility;
      var a = -mu / (2 * eps);
      var other = 2 * a - m.rCom;
      return { perigeeAltKm: Math.min(other, m.rCom) - m.RE, apogeeAltKm: Math.max(other, m.rCom) - m.RE };
    }
    var afterThrow = apsesAfter(-(inp.payloadT / M) * withdrawPerKg);
    var afterCatch = apsesAfter(+(inp.payloadT / M) * depositPerKg);

    // 6. Annual traffic balance.
    var outT = inp.outboundTPerYr, inT = inp.inboundTPerYr;
    var debt = outT * withdrawPerKg;
    var repaid = inT * depositPerKg;

    return {
      machine: m,
      vPeriUp: vPeriUp,
      dvMatchSigned: dvMatchSigned,
      dvMatch: dvMatch,
      planeGapDeg: planeGapDeg,
      dvPlane: dvPlane,
      dvTether: dvTether,
      dvRocketOnly: out.dvRocketOnly,
      dvSaved: out.dvRocketOnly - dvTether,
      propFracTether: propellantFraction(dvTether, inp.ispS),
      propFracRocketOnly: propellantFraction(out.dvRocketOnly, inp.ispS),
      rocketOnlyNote: out.rocketOnlyNote,
      entry: out.entry || null,
      direct: out.direct || null,
      depositMJperKg: depositPerKg,
      withdrawMJperKg: withdrawPerKg,
      bankRatio: bankRatio,
      afterThrow: afterThrow,
      afterCatch: afterCatch,
      lowerTipAltAfterThrowKm: afterThrow.perigeeAltKm - m.L,
      debtTJperYr: debt * 1e3 / 1e6,                                    // t*MJ/kg -> TJ
      repaidTJperYr: repaid * 1e3 / 1e6,
      repaidFraction: debt > 0 ? repaid / debt : null
    };
  }

  // Two-body RK4 for the visual only (planar). Positions km, velocities km/s.
  function propagate(mu, r, v, dt, steps, stopFn) {
    var pts = [];
    var s = [r[0], r[1], v[0], v[1]];
    function f(x) {
      var rr = Math.hypot(x[0], x[1]);
      var k = -mu / (rr * rr * rr);
      return [x[2], x[3], k * x[0], k * x[1]];
    }
    for (var i = 0; i <= steps; i++) {
      pts.push([s[0], s[1], s[2], s[3]]);
      if (stopFn && stopFn(s)) break;
      var k1 = f(s);
      var s2 = s.map(function (x, j) { return x + dt / 2 * k1[j]; });
      var k2 = f(s2);
      var s3 = s.map(function (x, j) { return x + dt / 2 * k2[j]; });
      var k3 = f(s3);
      var s4 = s.map(function (x, j) { return x + dt * k3[j]; });
      var k4 = f(s4);
      s = s.map(function (x, j) { return x + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]); });
    }
    return pts;
  }

  root.K2Model = {
    ASSUMPTIONS: ASSUMPTIONS,
    deriveMachine: deriveMachine,
    evaluate: evaluate,
    entryFromApsis: entryFromApsis,
    directEntry: directEntry,
    allenEggersPeakG: allenEggersPeakG,
    propellantFraction: propellantFraction,
    propagate: propagate
  };
})(globalThis);
