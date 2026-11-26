#!/usr/bin/env python3
"""Independent ON4 headline census.

This module intentionally contains its own Kepler, Hermite, grid, screening,
and selection implementations. Aster's compiled modules are used only by the
separate validation bridge, never by this census.
"""
import gzip
import json
import math
import statistics
import sys
from pathlib import Path

import numpy as np
from astropy import units as u
from poliastro.iod import izzo

MU_SUN = 132712440018.0
MU_EARTH = 398600.43550702266
R_EI_KM = 6503.1366
DAY = 86400.0
J2000 = 2451545.0
DEP_START = 2461041.500800741
DEP_END = 2466154.500800741
TOF_MIN = 182.5
TOF_MAX = 1826.25
SOLAR_RADIUS_KM = 695700.0
Z95 = 1.959963984540054


def norm(v):
    return math.sqrt(sum(x * x for x in v))


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def cross(a, b):
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]


def solve_kepler(mean_anomaly, eccentricity):
    wrapped = ((mean_anomaly % (2.0 * math.pi)) + 2.0 * math.pi) % (2.0 * math.pi)
    mean = wrapped - 2.0 * math.pi if wrapped > math.pi else wrapped
    eccentric = mean if eccentricity < 0.8 else (math.pi if mean >= 0.0 else -math.pi)
    for _ in range(50):
        delta = (eccentric - eccentricity * math.sin(eccentric) - mean) / (1.0 - eccentricity * math.cos(eccentric))
        eccentric -= delta
        if abs(delta) <= 1.0e-12:
            return eccentric
    raise RuntimeError("Kepler solver failed")


def rotate_perifocal(v, elements):
    _, _, inc, om, arg, _ = elements
    cos_om, sin_om = math.cos(om), math.sin(om)
    cos_i, sin_i = math.cos(inc), math.sin(inc)
    cos_arg, sin_arg = math.cos(arg), math.sin(arg)
    q11 = cos_om * cos_arg - sin_om * sin_arg * cos_i
    q12 = -cos_om * sin_arg - sin_om * cos_arg * cos_i
    q21 = sin_om * cos_arg + cos_om * sin_arg * cos_i
    q22 = -sin_om * sin_arg + cos_om * cos_arg * cos_i
    q31 = sin_arg * sin_i
    q32 = cos_arg * sin_i
    ecliptic = [q11 * v[0] + q12 * v[1], q21 * v[0] + q22 * v[1], q31 * v[0] + q32 * v[1]]
    obliquity = 84381.448 * math.pi / (180.0 * 3600.0)
    cos_ob, sin_ob = math.cos(obliquity), math.sin(obliquity)
    return [ecliptic[0], ecliptic[1] * cos_ob - ecliptic[2] * sin_ob, ecliptic[1] * sin_ob + ecliptic[2] * cos_ob]


def propagate(elements, jd_tdb):
    a_km = elements["aKm"]
    e = elements["e"]
    if not (a_km > 0.0 and 0.0 <= e < 1.0):
        raise ValueError("non-propagatable elliptical elements")
    delta_seconds = (jd_tdb - elements["epochTdbJd"]) * DAY
    mean_motion = math.sqrt(MU_SUN / (a_km ** 3))
    eccentric_anomaly = solve_kepler(elements["maRad"] + mean_motion * delta_seconds, e)
    cos_e, sin_e = math.cos(eccentric_anomaly), math.sin(eccentric_anomaly)
    denominator = 1.0 - e * cos_e
    root = math.sqrt(1.0 - e * e)
    position_pf = [a_km * (cos_e - e), a_km * root * sin_e]
    velocity_pf = [-a_km * mean_motion * sin_e / denominator, a_km * mean_motion * root * cos_e / denominator]
    return rotate_perifocal([position_pf[0], position_pf[1], 0.0], (a_km, e, elements["iRad"], elements["omRad"], elements["wRad"], elements["maRad"])), rotate_perifocal([velocity_pf[0], velocity_pf[1], 0.0], (a_km, e, elements["iRad"], elements["omRad"], elements["wRad"], elements["maRad"]))


def hermite_scalar(p0, v0, p1, v1, dt, u_value):
    u2, u3 = u_value * u_value, u_value * u_value * u_value
    return (2.0 * u3 - 3.0 * u2 + 1.0) * p0 + (u3 - 2.0 * u2 + u_value) * v0 * dt + (-2.0 * u3 + 3.0 * u2) * p1 + (u3 - u2) * v1 * dt


def hermite_velocity(p0, v0, p1, v1, dt, u_value):
    u2 = u_value * u_value
    return ((6.0 * u2 - 6.0 * u_value) * p0 + (3.0 * u2 - 4.0 * u_value + 1.0) * v0 * dt + (-6.0 * u2 + 6.0 * u_value) * p1 + (3.0 * u2 - 2.0 * u_value) * v1 * dt) / dt


def earth_at(samples, jd_tdb):
    target_seconds = (jd_tdb - J2000) * DAY
    for sample in samples:
        if sample[0] == jd_tdb:
            return sample[1], sample[2]
    for index in range(len(samples) - 1):
        left, right = samples[index], samples[index + 1]
        t0, t1 = (left[0] - J2000) * DAY, (right[0] - J2000) * DAY
        if t0 < target_seconds < t1:
            dt = t1 - t0
            u_value = (target_seconds - t0) / dt
            position = [hermite_scalar(left[1][axis], left[2][axis], right[1][axis], right[2][axis], dt, u_value) for axis in range(3)]
            velocity = [hermite_velocity(left[1][axis], left[2][axis], right[1][axis], right[2][axis], dt, u_value) for axis in range(3)]
            return position, velocity
    raise ValueError(f"Earth epoch outside fixture: {jd_tdb}")


def perihelion(r, v, tof_seconds):
    rmag = norm(r)
    v2 = dot(v, v)
    energy = 0.5 * v2 - MU_SUN / rmag
    h = cross(r, v)
    h2 = dot(h, h)
    eccentricity = math.sqrt(max(0.0, 1.0 + 2.0 * energy * h2 / MU_SUN ** 2))
    semi_major = -MU_SUN / (2.0 * energy) if energy < 0.0 else None
    q = semi_major * (1.0 - eccentricity) if semi_major is not None else h2 / (MU_SUN * (1.0 + eccentricity))
    passes = dot(r, v) < 0.0
    if semi_major is not None and eccentricity < 1.0:
        ev = [((v2 - MU_SUN / rmag) * r[axis] - dot(r, v) * v[axis]) / MU_SUN for axis in range(3)]
        f = math.atan2(dot(cross(ev, r), h) / max(norm(h) * eccentricity * rmag, 1.0e-300), dot(ev, r) / max(eccentricity * rmag, 1.0e-300))
        eccentric_anomaly = math.atan2(math.sqrt(1.0 - eccentricity * eccentricity) * math.sin(f), eccentricity + math.cos(f))
        mean0 = eccentric_anomaly - eccentricity * math.sin(eccentric_anomaly)
        mean_motion = math.sqrt(MU_SUN / semi_major ** 3)
        passes = math.floor((mean0 + mean_motion * tof_seconds) / (2.0 * math.pi)) > math.floor(mean0 / (2.0 * math.pi))
    return q, passes


def solve_lambert(r1, r2, tof_days, m_value, branch):
    lowpath = branch != "left"
    try:
        v1, v2 = izzo.lambert(MU_SUN * u.km ** 3 / u.s ** 2, np.array(r1) * u.km, np.array(r2) * u.km, tof_days * DAY * u.s, M=m_value, prograde=True, lowpath=lowpath)
        return [float(value) for value in v1.to_value(u.km / u.s)], [float(value) for value in v2.to_value(u.km / u.s)]
    except Exception:
        return None


def wilson(successes, total):
    if total == 0:
        return {"n": 0, "successes": 0, "share": None, "low95": None, "high95": None}
    p = successes / total
    denominator = 1.0 + Z95 ** 2 / total
    center = (p + Z95 ** 2 / (2.0 * total)) / denominator
    half = Z95 * math.sqrt(p * (1.0 - p) / total + Z95 ** 2 / (4.0 * total ** 2)) / denominator
    return {"n": total, "successes": successes, "share": p, "low95": max(0.0, center - half), "high95": min(1.0, center + half)}


def grid(samples):
    cells = []
    for dep_index in range(50):
        dep_jd = DEP_START + (DEP_END - DEP_START) * dep_index / 49.0
        dep_seconds = (dep_jd - J2000) * DAY
        for tof_index in range(25):
            tof_days = TOF_MIN + (TOF_MAX - TOF_MIN) * tof_index / 24.0
            arrival_seconds = dep_seconds + tof_days * DAY
            arrival_jd = J2000 + arrival_seconds / DAY
            if arrival_seconds > (samples[-1][0] - J2000) * DAY:
                cells.append((dep_index, tof_index, dep_jd, tof_days, None, None))
            else:
                earth_r, earth_v = earth_at(samples, arrival_jd)
                cells.append((dep_index, tof_index, dep_jd, tof_days, earth_r, earth_v))
    return cells


def load_run1_rows(table_dir, limit):
    rows = {}
    for part in sorted(Path(table_dir).glob("body-table.part*of3.jsonl.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            for line in handle:
                row = json.loads(line)
                if row.get("mode") == "coarse" and row.get("bodyIndex", limit) < limit:
                    rows[row["bodyIndex"]] = row
    return rows


def main():
    repo_root, order_path, table_dir, validation_path, output_path = map(Path, sys.argv[1:6])
    catalog = json.loads((repo_root / "tests/fixtures/v2/nea-catalog-slice9.json").read_text(encoding="utf-8"))
    bodies = list(catalog["asteroids"].values())
    order_data = json.loads(order_path.read_text(encoding="utf-8"))
    tiers = json.loads((repo_root / "docs/tier-sizing-per-body.json").read_text(encoding="utf-8"))["records"]
    earth_raw = json.loads((repo_root / "src/v2/data/horizons-inner-solar-system-2026-2040.json").read_text(encoding="utf-8"))
    earth_samples = []
    for record in earth_raw["targets"]["earth"]["records"]:
        jd, *values = record
        earth_samples.append((jd, values[0:3], values[3:6]))
    cells = grid(earth_samples)
    run1 = load_run1_rows(table_dir, 2000)
    results = []
    validation = json.loads(validation_path.read_text(encoding="utf-8"))["states"]
    validation_errors = []
    for case in validation:
        body = bodies[case["bodyIndex"]]
        position, velocity = propagate(body["elements"], case["jdTdb"])
        validation_errors.append({"index": case["index"], "designation": case["designation"], "positionDiffKm": norm([position[i] - case["positionKm"][i] for i in range(3)]), "velocityDiffKmS": norm([velocity[i] - case["velocityKmS"][i] for i in range(3)])})
    for body_index in range(2000):
        body = bodies[order_data["order"][body_index]]
        tier = tiers.get(body["designation"], {}).get("tier")
        row = {"bodyIndex": body_index, "designation": body["designation"], "tier": tier, "cells": len(cells), "refusedEarth": 0, "refusedSun": 0, "shown": 0, "shownScreen": 0, "selectedBest": None, "propagationRefused": None}
        best = None
        try:
            propagated = {}
            for di, ti, dep_jd, tof_days, earth_r, earth_v in cells:
                if earth_r is None:
                    row["refusedEarth"] += 1
                    continue
                if di not in propagated:
                    propagated[di] = propagate(body["elements"], dep_jd)
                asteroid_r, asteroid_v = propagated[di]
                branches = []
                for m_value, branch in ((0, "single"), (1, "left"), (1, "right")):
                    solution = solve_lambert(asteroid_r, earth_r, tof_days, m_value, branch)
                    if solution is None:
                        continue
                    v1, v2 = solution
                    q, passes = perihelion(asteroid_r, v1, tof_days * DAY)
                    if q < SOLAR_RADIUS_KM and passes:
                        row["refusedSun"] += 1
                        continue
                    branches.append({"M": m_value, "branch": branch, "vInfDep": norm([v1[i] - asteroid_v[i] for i in range(3)]), "vInfArr": norm([v2[i] - earth_v[i] for i in range(3)])})
                if not branches:
                    continue
                row["shown"] += 1
                candidate = branches[0]
                for branch_value in branches[1:]:
                    if branch_value["vInfDep"] < candidate["vInfDep"]:
                        candidate = branch_value
                v_ei = math.sqrt(candidate["vInfArr"] ** 2 + 2.0 * MU_EARTH / R_EI_KM)
                if v_ei <= 12.0:
                    row["shownScreen"] += 1
                if best is None or candidate["vInfDep"] < best["vInfDep"]:
                    best = {"depIndex": di, "tofIndex": ti, "depJd": dep_jd, "tofDays": tof_days, "M": candidate["M"], "branch": candidate["branch"], "vInfDep": candidate["vInfDep"], "vInfArr": candidate["vInfArr"], "vEI": v_ei}
            row["selectedBest"] = best
        except Exception as error:
            row["propagationRefused"] = f"{type(error).__name__}: {error}"
        results.append(row)
        if (body_index + 1) % 100 == 0:
            print(f"bodies {body_index + 1}/2000", flush=True)
    selected_n2 = [row for row in results if row["selectedBest"] is not None]
    selected_run1 = [run1[index] for index in range(2000) if index in run1 and run1[index].get("selectedBest") is not None]
    best_fail_n2 = sum(row["selectedBest"]["vEI"] > 12.0 for row in selected_n2)
    best_fail_run1 = sum(run1[index]["selectedBest"]["vEI"] > 12.0 for index in range(2000) if index in run1 and run1[index].get("selectedBest") is not None)
    zero_n2 = sum(row["shownScreen"] == 0 for row in results)
    zero_run1 = sum(run1[index]["shownScreen"] == 0 for index in range(2000) if index in run1)
    disagreements = []
    for row in results:
        old = run1.get(row["bodyIndex"])
        if old is None:
            disagreements.append({"bodyIndex": row["bodyIndex"], "reason": "missing run1 row", "n2": row})
            continue
        n2_best, old_best = row["selectedBest"], old.get("selectedBest")
        same_cell = bool(n2_best and old_best and n2_best["depIndex"] == min(range(50), key=lambda value: abs((DEP_START + (DEP_END - DEP_START) * value / 49.0) - old_best["depJd"])) and n2_best["tofIndex"] == min(range(25), key=lambda value: abs((TOF_MIN + (TOF_MAX - TOF_MIN) * value / 24.0) - old_best["tofDays"])) and n2_best["M"] == old_best["M"] and n2_best["branch"] == old_best["branch"])
        old_selected_pass = bool(old_best and old_best["vEI"] <= 12.0)
        n2_selected_pass = bool(n2_best and n2_best["vEI"] <= 12.0)
        same_screen = n2_selected_pass == old_selected_pass
        same_zero = (row["shownScreen"] == 0) == (old["shownScreen"] == 0)
        if not (same_cell and same_screen and same_zero):
            disagreements.append({"bodyIndex": row["bodyIndex"], "designation": row["designation"], "sameSelectedCell": same_cell, "sameSelectedScreen": same_screen, "sameZeroPassing": same_zero, "run1": {"shown": old["shown"], "shownScreen": old["shownScreen"], "selectedBest": old_best}, "n2": {"shown": row["shown"], "shownScreen": row["shownScreen"], "selectedBest": n2_best}})
    summary = {
        "schema": "aster-s20-overnight2-n2-summary/1",
        "method": {"python": sys.version.split()[0], "poliastro": __import__("poliastro").__version__, "numpy": np.__version__, "grid": {"bodies": 2000, "nDep": 50, "nTof": 25, "depStartJd": DEP_START, "depEndJd": DEP_END, "tofMinDays": TOF_MIN, "tofMaxDays": TOF_MAX}, "bodyOrder": "first 2000 positions of tools/slice20-research/overnight/on4-census/order.json", "muSunKm3S2": MU_SUN, "earthScreen": {"muKm3S2": MU_EARTH, "rEIKm": R_EI_KM, "limitKmS": 12.0}},
        "validation": {"samples": len(validation_errors), "maxPositionDiffKm": max(item["positionDiffKm"] for item in validation_errors), "maxVelocityDiffKmS": max(item["velocityDiffKmS"] for item in validation_errors), "details": validation_errors},
        "shares": {"bestFailsScreen": {"run1": wilson(best_fail_run1, len([index for index in range(2000) if index in run1 and run1[index].get("selectedBest") is not None])), "n2": wilson(best_fail_n2, len(selected_n2))}, "zeroShownScreen": {"run1": wilson(zero_run1, 2000), "n2": wilson(zero_n2, len(results))}},
        "bodyAgreement": {"compared": len(results), "disagreeing": len(disagreements), "disagreements": disagreements},
        "perBody": results,
    }
    best_delta_pp = abs(summary["shares"]["bestFailsScreen"]["run1"]["share"] - summary["shares"]["bestFailsScreen"]["n2"]["share"]) * 100.0
    zero_delta_pp = abs(summary["shares"]["zeroShownScreen"]["run1"]["share"] - summary["shares"]["zeroShownScreen"]["n2"]["share"]) * 100.0
    summary["shareDeltaPercentagePoints"] = {"bestFailsScreen": best_delta_pp, "zeroShownScreen": zero_delta_pp, "max": max(best_delta_pp, zero_delta_pp)}
    summary["verdict"] = f"ON4 REPRODUCED (shares within 0.1 pp, {len(disagreements)} of 2,000 bodies disagree)" if max(best_delta_pp, zero_delta_pp) <= 0.1 else "ON4 DIFFERS"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"verdict": summary["verdict"], "shareDeltaPercentagePoints": summary["shareDeltaPercentagePoints"], "disagreeing": len(disagreements), "maxPositionDiffKm": summary["validation"]["maxPositionDiffKm"]}, indent=2))


if __name__ == "__main__":
    main()
