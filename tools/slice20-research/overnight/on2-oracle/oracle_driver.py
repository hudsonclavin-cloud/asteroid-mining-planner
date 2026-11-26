#!/usr/bin/env python3
"""S20_OVERNIGHT ON2 oracle driver, written for this run.

It imports no longrun/longrun2/nhats code. The branch mapping is fixed from
the Aster and poliastro code before comparison: Aster right (x > 0) is
poliastro lowpath=True; Aster left (x < 0) is lowpath=False.
"""
import gzip
import json
import math
import sys
import time

import numpy as np
from astropy import units as u
from poliastro.iod import izzo, vallado

KM3_S2 = u.km ** 3 / u.s ** 2
VALLADO_SETTINGS = {"default": {"numiter": 35, "rtol": 1e-8}, "tight": {"numiter": 200, "rtol": 1e-12}}


def stumpff(z):
    if abs(z) < 1e-8:
        return 0.5 - z / 24.0 + z * z / 720.0, 1.0 / 6.0 - z / 120.0 + z * z / 5040.0
    if z > 0:
        root = math.sqrt(z)
        return (1.0 - math.cos(root)) / z, (root - math.sin(root)) / (root ** 3)
    root = math.sqrt(-z)
    return (math.cosh(root) - 1.0) / (-z), (math.sinh(root) - root) / (root ** 3)


def universal_propagate(r0, v0, mu, dt):
    r0 = np.asarray(r0, dtype=float)
    v0 = np.asarray(v0, dtype=float)
    r0mag = float(np.linalg.norm(r0))
    v0sq = float(v0 @ v0)
    rv0 = float(r0 @ v0)
    sqrt_mu = math.sqrt(mu)
    alpha = 2.0 / r0mag - v0sq / mu
    if alpha > 1e-12:
        chi = sqrt_mu * dt * alpha
    else:
        chi = sqrt_mu * dt / r0mag
    for _ in range(200):
        z = alpha * chi * chi
        c2, c3 = stumpff(z)
        f = rv0 / sqrt_mu * chi * chi * c2 + (1.0 - alpha * r0mag) * chi ** 3 * c3 + r0mag * chi - sqrt_mu * dt
        fp = rv0 / sqrt_mu * chi * (1.0 - z * c3) + (1.0 - alpha * r0mag) * chi * chi * c2 + r0mag
        step = f / fp
        chi -= step
        if abs(step) < 1e-12:
            break
    else:
        raise RuntimeError("universal-variable anomaly did not converge")
    z = alpha * chi * chi
    c2, c3 = stumpff(z)
    f = 1.0 - chi * chi / r0mag * c2
    g = dt - chi ** 3 / sqrt_mu * c3
    r = f * r0 + g * v0
    rmag = float(np.linalg.norm(r))
    fdot = sqrt_mu / (rmag * r0mag) * (alpha * chi ** 3 * c3 - chi)
    gdot = 1.0 - chi * chi / rmag * c2
    v = fdot * r0 + gdot * v0
    return r, v


def solve(module, k, r1, r2, tof, **kwargs):
    try:
        v1, v2 = module.lambert(k * KM3_S2, r1 * u.km, r2 * u.km, tof * u.s, **kwargs)
        return {"ok": True, "v1KmS": [float(x) for x in v1.to_value(u.km / u.s)], "v2KmS": [float(x) for x in v2.to_value(u.km / u.s)]}
    except Exception as exc:
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}


def rel_diff(a, b):
    den = max(float(np.linalg.norm(a)), float(np.linalg.norm(b)), 1e-300)
    return float(np.linalg.norm(np.asarray(a) - np.asarray(b)) / den)


def self_test(lr1_path, mu):
    radius = 1.0e8
    speed = math.sqrt(mu / radius)
    r, v = universal_propagate([radius, 0.0, 0.0], [0.0, speed, 0.0], mu, 86400.0)
    if abs(np.linalg.norm(r) - radius) > 1e-3 or abs(np.linalg.norm(v) - speed) > 1e-9:
        raise RuntimeError("circular-orbit universal-variable self-test failed")
    with gzip.open(lr1_path, "rt", encoding="utf-8") as handle:
        lr1 = json.load(handle)
    for record in lr1.get("records", lr1.get("results", [])):
        if "aster" in record and record.get("aster", {}).get("v1KmS"):
            r1 = record["r1Km"]
            r2 = record["r2Km"]
            v1 = record["aster"]["v1KmS"]
            propagated, _ = universal_propagate(r1, v1, mu, record["tofSeconds"])
            miss = float(np.linalg.norm(propagated - np.asarray(r2)))
            if not math.isfinite(miss) or miss > 1.0:
                raise RuntimeError(f"LR1-cell universal-variable self-test failed: miss={miss}")
            return {"circularRadiusErrorM": abs(np.linalg.norm(r) - radius), "lr1CellId": record.get("id"), "lr1MissKm": miss}
    raise RuntimeError("LR1-cell universal-variable self-test found no usable record")


def main():
    cells_path, out_path, lr1_path = sys.argv[1:4]
    with open(cells_path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    k = float(payload["muSunKm3S2"])
    self_test_info = self_test(lr1_path, k)
    started = time.time()
    results = []
    for index, rec in enumerate(payload["cells"]):
        out = {"id": rec["id"], "status": rec["status"], "M": rec["M"]}
        if rec["status"] in ("refused_earth", "asteroid_propagation_refused"):
            results.append(out)
            continue
        r1 = np.asarray(rec["r1"], dtype=float)
        r2 = np.asarray(rec["r2"], dtype=float)
        tof = float(rec["tofDays"]) * 86400.0
        M = int(rec["M"])
        if M == 0:
            out["izzo"] = {"single": solve(izzo, k, r1, r2, tof, M=0, prograde=True, lowpath=True)}
        else:
            # Aster source: lambert-multi-rev.ts:96-106 names the x<0 root left and x>0 root right.
            # poliastro core/iod.py _initial_guess takes lowpath=True for the larger/right root.
            out["izzo"] = {
                "left": solve(izzo, k, r1, r2, tof, M=M, prograde=True, lowpath=False),
                "right": solve(izzo, k, r1, r2, tof, M=M, prograde=True, lowpath=True),
            }
        if M == 0:
            short_way = bool(np.cross(r1, r2)[2] > 0.0)
            out["valladoShortWay"] = short_way
            for name, settings in VALLADO_SETTINGS.items():
                out[f"vallado_{name}"] = solve(vallado, k, r1, r2, tof, M=0, prograde=short_way, **settings)
        closures = []
        for branch in rec.get("asterBranches", []):
            if not branch.get("converged") or not branch.get("v1"):
                continue
            v1 = np.asarray(branch["v1"], dtype=float)
            v2 = np.asarray(branch["v2"], dtype=float)
            try:
                propagated, propagated_v = universal_propagate(r1, v1, k, tof)
                miss = float(np.linalg.norm(propagated - r2))
                energy1 = 0.5 * float(v1 @ v1) - k / float(np.linalg.norm(r1))
                energy2 = 0.5 * float(v2 @ v2) - k / float(np.linalg.norm(r2))
                h1 = np.cross(r1, v1)
                h2 = np.cross(r2, v2)
                a = -k / (2.0 * energy1)
                ecc = math.sqrt(max(0.0, 1.0 + 2.0 * energy1 * float(h1 @ h1) / k ** 2))
                closures.append({
                    "branch": branch["branch"], "missKm": miss, "arrivalVelocityDiffKmS": float(np.linalg.norm(propagated_v - v2)),
                    "specificEnergy1": energy1, "specificEnergy2": energy2, "energyRelDiff": abs(energy2 - energy1) / max(abs(energy1), 1e-300),
                    "angularMomentumRelDiff": float(np.linalg.norm(h2 - h1) / max(np.linalg.norm(h1), 1e-300)),
                    "perihelionKm": a * (1.0 - ecc), "eccentricity": ecc,
                    "vInfDepKmS": (v1 - np.asarray(rec["vAsteroid"])).tolist(), "vInfArrKmS": (v2 - np.asarray(rec["vEarth"])).tolist(),
                })
            except Exception as exc:
                closures.append({"branch": branch["branch"], "error": f"{type(exc).__name__}: {exc}"})
        out["closures"] = closures
        results.append(out)
        if (index + 1) % 5000 == 0:
            print(f"{index + 1}/{len(payload['cells'])} cells, {time.time() - started:.0f}s", flush=True)
    result = {
        "schema": "aster-s20-overnight-on2-oracle/1", "generatedAtUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "python": sys.version.split()[0], "poliastro": __import__("poliastro").__version__, "numpy": np.__version__,
        "astropy": __import__("astropy").__version__, "scipy": __import__("scipy").__version__, "numba": __import__("numba").__version__,
        "muSunKm3S2": k, "branchMapping": {"asterLeft": "izzo lowpath=False", "asterRight": "izzo lowpath=True"},
        "selfTest": self_test_info, "recordCount": len(results), "wallSeconds": time.time() - started, "results": results,
    }
    with open(out_path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(result, handle, separators=(",", ":"))
        handle.write("\n")
    print(json.dumps({"out": out_path, "records": len(results), "wallSeconds": round(result["wallSeconds"], 1)}))


if __name__ == "__main__":
    main()
