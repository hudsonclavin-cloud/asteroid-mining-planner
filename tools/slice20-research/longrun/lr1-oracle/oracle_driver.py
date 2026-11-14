#!/usr/bin/env python3
"""LR1 step 3 - poliastro oracle driver for the K1 return-leg cells (NEW driver, not the Slice 11 one).

Reads the cells file written by build-cells.mjs, writes ONE results file. It writes nowhere else:
both paths are command-line arguments, and the caller points them at scratch.

  python -I oracle_driver.py <cells.json> <oracle-results.json>

Per cell (same r1, r2, TOF, mu, M and branch as Aster solved):
  (a) poliastro.iod.izzo.lambert, full velocity vectors.
      Branch mapping for M >= 1 is fixed A PRIORI from the two codebases, not by picking the closer
      answer: Aster 'right' is the x > 0 root, 'left' the x < 0 root (lambert-multi-rev.ts:96-106);
      poliastro lowpath=True takes max(x_0l, x_0r), lowpath=False the min (core/iod.py _initial_guess).
      So right <-> lowpath=True and left <-> lowpath=False. The other lowpath value is also solved
      and stored as a diagnostic ("izzoOtherPath") so a wrong mapping would be visible.
  (b) poliastro.iod.vallado.lambert (universal variables, bisection), M = 0 only.
      In poliastro 0.17.0 the vallado `prograde` flag sets t_m = +1/-1, i.e. it selects the SHORT way
      (transfer angle < 180 deg), not the direction of motion (core/iod.py:112-121). The prograde
      solution Aster returns is the short way exactly when (r1 x r2).z > 0, so the flag is derived
      from that geometry - never from which answer is closer. Solved twice: poliastro defaults
      (numiter=35, rtol=1e-8) and a tight setting (numiter=200, rtol=1e-12).
  (c) endpoint closure: Aster's departure state (r1, v1) propagated two-body for the TOF with
      poliastro farnocchia_rv (analytic) and cowell (DOP853 numerical integration, rtol=1e-13);
      miss distance to Earth's arrival position r2, plus energy and angular-momentum consistency
      between Aster's two endpoint states. Also stored: the distance between the two propagators'
      own end positions, and the transfer orbit's eccentricity and perihelion (from Aster's r1, v1),
      because both propagators lose accuracy on near-rectilinear (Sun-grazing) transfer orbits.

No threshold is applied here. Numbers only.
"""
import json
import sys
import time

import numpy as np
from astropy import units as u

import poliastro
from poliastro.core.propagation import cowell
from poliastro.core.propagation.farnocchia import farnocchia_rv
from poliastro.iod import izzo, vallado

KM3_S2 = u.km**3 / u.s**2
VALLADO_SETTINGS = {
    "default": {"numiter": 35, "rtol": 1e-8},
    "tight": {"numiter": 200, "rtol": 1e-12},
}
COWELL_RTOL = 1e-13


def solve(module, k, r1, r2, tof, **kwargs):
    try:
        v1, v2 = module.lambert(k * KM3_S2, r1 * u.km, r2 * u.km, tof * u.s, **kwargs)
        return {
            "v1KmS": [float(x) for x in v1.to_value(u.km / u.s)],
            "v2KmS": [float(x) for x in v2.to_value(u.km / u.s)],
        }
    except Exception as exc:  # recorded, never hidden
        return {"error": f"{type(exc).__name__}: {exc}"}


def main():
    cells_path, out_path = sys.argv[1], sys.argv[2]
    with open(cells_path, "r", encoding="utf-8") as handle:
        cells = json.load(handle)
    k = float(cells["muSunKm3S2"])
    started = time.time()
    results = []
    for index, rec in enumerate(cells["records"]):
        r1 = np.array(rec["r1Km"], dtype=float)
        r2 = np.array(rec["r2Km"], dtype=float)
        tof = float(rec["tofSeconds"])
        M = int(rec["M"])
        branch = rec["branch"]
        out = {"id": rec["id"]}

        # (a) izzo
        lowpath = branch != "left"  # single/right -> True, left -> False (a-priori mapping)
        out["izzoLowpath"] = lowpath
        out["izzo"] = solve(izzo, k, r1, r2, tof, M=M, prograde=True, lowpath=lowpath)
        if M > 0:
            out["izzoOtherPath"] = solve(izzo, k, r1, r2, tof, M=M, prograde=True, lowpath=not lowpath)

        # (b) vallado, M = 0 only
        if M == 0:
            short_way = bool(np.cross(r1, r2)[2] > 0.0)
            out["valladoShortWay"] = short_way
            for name, settings in VALLADO_SETTINGS.items():
                out[f"vallado_{name}"] = solve(vallado, k, r1, r2, tof, M=0, prograde=short_way, **settings)

        # (c) endpoint closure from ASTER's departure state
        v1 = np.array(rec["aster"]["v1KmS"], dtype=float)
        v2 = np.array(rec["aster"]["v2KmS"], dtype=float)
        closure = {}
        r_end = {}
        try:
            rf, vf = farnocchia_rv(k, r1, v1, tof)
            r_end["farnocchia"] = rf
            closure["farnocchia"] = {
                "missKm": float(np.linalg.norm(rf - r2)),
                "arrivalVelocityDiffKmS": float(np.linalg.norm(vf - v2)),
            }
        except Exception as exc:
            closure["farnocchia"] = {"error": f"{type(exc).__name__}: {exc}"}
        try:
            rrs, vvs = cowell(k, r1, v1, np.array([tof]), rtol=COWELL_RTOL)
            r_end["cowell"] = rrs[-1]
            closure["cowell"] = {
                "missKm": float(np.linalg.norm(rrs[-1] - r2)),
                "arrivalVelocityDiffKmS": float(np.linalg.norm(vvs[-1] - v2)),
            }
        except Exception as exc:
            closure["cowell"] = {"error": f"{type(exc).__name__}: {exc}"}
        e1 = 0.5 * float(v1 @ v1) - k / float(np.linalg.norm(r1))
        e2 = 0.5 * float(v2 @ v2) - k / float(np.linalg.norm(r2))
        h1 = np.cross(r1, v1)
        h2 = np.cross(r2, v2)
        if "farnocchia" in r_end and "cowell" in r_end:
            # how far the two poliastro propagators land from EACH OTHER: a floor on what either
            # one's miss distance can say about Aster
            closure["propagatorDisagreementKm"] = float(np.linalg.norm(r_end["farnocchia"] - r_end["cowell"]))
        # transfer orbit implied by Aster's departure state (two-body, heliocentric)
        a_km = -k / (2.0 * e1)
        ecc = float(np.sqrt(max(0.0, 1.0 + 2.0 * e1 * float(h1 @ h1) / k**2)))
        out["transferOrbit"] = {
            "semiMajorAxisKm": float(a_km),
            "eccentricity": ecc,
            "perihelionKm": float(a_km * (1.0 - ecc)),
            "revolutions": float(tof / (2.0 * np.pi * np.sqrt(abs(a_km) ** 3 / k))) if a_km > 0 else None,
        }
        closure["specificEnergy1"] = e1
        closure["specificEnergy2"] = e2
        closure["energyRelDiff"] = abs(e2 - e1) / abs(e1)
        closure["angularMomentumRelDiff"] = float(np.linalg.norm(h2 - h1) / np.linalg.norm(h1))
        out["closure"] = closure
        results.append(out)
        if (index + 1) % 2000 == 0:
            print(f"{index + 1}/{len(cells['records'])} cells, {time.time() - started:.0f} s", flush=True)

    payload = {
        "schema": "aster-s20-longrun-lr1-oracle-results/1",
        "generatedAtUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "python": sys.version.split()[0],
        "poliastro": poliastro.__version__,
        "numpy": np.__version__,
        "astropy": __import__("astropy").__version__,
        "scipy": __import__("scipy").__version__,
        "numba": __import__("numba").__version__,
        "muSunKm3S2": k,
        "izzoSettings": {"numiter": 35, "rtol": 1e-8, "note": "poliastro defaults", "prograde": True},
        "valladoSettings": VALLADO_SETTINGS,
        "cowellRtol": COWELL_RTOL,
        "cellsHeadCommit": cells.get("headCommit"),
        "recordCount": len(results),
        "wallSeconds": time.time() - started,
        "results": results,
    }
    with open(out_path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle)
        handle.write("\n")
    print(json.dumps({"out": out_path, "records": len(results), "wallSeconds": round(payload["wallSeconds"], 1)}))


if __name__ == "__main__":
    main()
