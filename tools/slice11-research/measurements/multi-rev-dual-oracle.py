#!/usr/bin/env python3

import json
import math
import sys

import numpy as np
from astropy import units as u
from poliastro.iod.izzo import lambert
from scipy.optimize import brentq, minimize_scalar

EPS = 1.0e-12
DENSE_SCAN_POINTS = 1_000_001


def as_vec(quantity):
    return [
        float(quantity[0].to_value(u.km / u.s)),
        float(quantity[1].to_value(u.km / u.s)),
        float(quantity[2].to_value(u.km / u.s)),
    ]


def solve_branch(mu, r1, r2, tof, m_value, lowpath):
    try:
        v1, v2 = list(
            lambert(
                mu * u.km**3 / u.s**2,
                np.asarray(r1) * u.km,
                np.asarray(r2) * u.km,
                tof * u.s,
                M=m_value,
                prograde=True,
                lowpath=lowpath,
            )
        )
        return {
            "lowpath": lowpath,
            "converged": True,
            "v1": as_vec(v1),
            "v2": as_vec(v2),
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "lowpath": lowpath,
            "converged": False,
            "error": f"{type(exc).__name__}: {exc}",
        }


def solve_any(mu, r1, r2, tof, m_value):
    left = solve_branch(mu, r1, r2, tof, m_value, True)
    if left["converged"]:
        return True
    right = solve_branch(mu, r1, r2, tof, m_value, False)
    return right["converged"]


def norm3(vec):
    return float(np.linalg.norm(np.asarray(vec, dtype=float)))


def geometry(r1, r2):
    r1 = np.asarray(r1, dtype=float)
    r2 = np.asarray(r2, dtype=float)
    c = r2 - r1
    c_mag = norm3(c)
    r1_mag = norm3(r1)
    r2_mag = norm3(r2)
    s = 0.5 * (r1_mag + r2_mag + c_mag)
    if r1_mag == 0 or r2_mag == 0 or c_mag == 0:
        raise ValueError("invalid geometry")

    i_r1 = r1 / r1_mag
    i_r2 = r2 / r2_mag
    i_h = np.cross(i_r1, i_r2)
    i_h_mag = norm3(i_h)
    if i_h_mag == 0:
        raise ValueError("collinear geometry")
    i_h = i_h / i_h_mag

    lam = math.sqrt(1.0 - min(1.0, c_mag / s))
    if i_h[2] < 0:
        lam = -lam

    return {"lambda": lam, "s": s}


def compute_y(x, lam):
    arg = 1.0 - lam * lam * (1.0 - x * x)
    return math.sqrt(arg) if arg >= 0 else math.nan


def tof_general_scalar(x, lam, m_value):
    y = compute_y(x, lam)
    if not math.isfinite(y):
        return math.nan
    one_minus_x2 = 1.0 - x * x
    psi_arg = x * y + lam * one_minus_x2
    psi_arg = min(1.0, max(-1.0, psi_arg))
    psi = math.acos(psi_arg)
    return ((psi + m_value * math.pi) / math.sqrt(abs(one_minus_x2)) - x + lam * y) / one_minus_x2


def tof_general_vector(xs, lam, m_value):
    xs = np.asarray(xs, dtype=float)
    one_minus_x2 = 1.0 - xs * xs
    y = np.sqrt(np.maximum(0.0, 1.0 - lam * lam * (1.0 - xs * xs)))
    psi_arg = np.clip(xs * y + lam * one_minus_x2, -1.0, 1.0)
    psi = np.arccos(psi_arg)
    return ((psi + m_value * np.pi) / np.sqrt(np.abs(one_minus_x2)) - xs + lam * y) / one_minus_x2


def find_true_tmin(lam, m_value):
    xs = np.linspace(-1.0 + EPS, 1.0 - EPS, DENSE_SCAN_POINTS, dtype=np.float64)
    ts = tof_general_vector(xs, lam, m_value)
    index = int(np.argmin(ts))
    left_index = max(index - 1, 0)
    right_index = min(index + 1, len(xs) - 1)
    bracket = (float(xs[left_index]), float(xs[right_index]))
    refined = minimize_scalar(
        lambda value: tof_general_scalar(float(value), lam, m_value),
        bounds=bracket,
        method="bounded",
        options={"xatol": 1e-15},
    )
    x_min = float(refined.x)
    t_min = float(refined.fun)
    return {
        "xMin": x_min,
        "trueTMin": t_min,
    }


def find_roots_for_target(lam, m_value, x_min, true_t_min, target_t):
    if target_t + 1e-12 < true_t_min:
        return None

    def g(value):
        return tof_general_scalar(value, lam, m_value) - target_t

    g_min = g(x_min)
    if g_min > 1e-10:
        return None

    left_lo = -1.0 + 1e-9
    left_hi = x_min
    right_lo = x_min
    right_hi = 1.0 - 1e-9

    left_root = brentq(g, left_lo, left_hi, xtol=1e-14, rtol=1e-14, maxiter=200)
    right_root = brentq(g, right_lo, right_hi, xtol=1e-14, rtol=1e-14, maxiter=200)
    return {
        "leftRootX": float(left_root),
        "rightRootX": float(right_root),
    }


def find_poliastro_gate(mu, r1, r2, m_value, start_tof_seconds):
    low = float(start_tof_seconds)
    if solve_any(mu, r1, r2, low, m_value):
        probe = max(low * (1.0 - 1e-8), low - 1.0)
        while probe > 0 and solve_any(mu, r1, r2, probe, m_value):
            low = probe
            probe = max(probe * (1.0 - 1e-8), probe - 1.0)
        high = low
    else:
        high = low
        step = max(1.0, low * 1e-8)
        while not solve_any(mu, r1, r2, high, m_value):
            high += step
            step *= 2.0
            if step > max(1.0, low) * 10.0:
                raise RuntimeError("failed to bracket poliastro gate")

    if not solve_any(mu, r1, r2, high, m_value):
        raise RuntimeError("failed to find converged upper bracket")

    low_nonconv = low if not solve_any(mu, r1, r2, low, m_value) else max(0.0, low - max(1.0, low * 1e-8))
    if solve_any(mu, r1, r2, low_nonconv, m_value):
        probe = max(0.0, low_nonconv - max(1.0, low_nonconv * 1e-6))
        while probe > 0.0 and solve_any(mu, r1, r2, probe, m_value):
            low_nonconv = probe
            probe = max(0.0, probe - max(1.0, probe * 1e-6))

    for _ in range(80):
        mid = 0.5 * (low_nonconv + high)
        if solve_any(mu, r1, r2, mid, m_value):
            high = mid
        else:
            low_nonconv = mid
    return high


def run_bulk(payload):
    rows = []
    for cell in payload["cells"]:
        branches = [
            solve_branch(cell["mu"], cell["r1"], cell["r2"], cell["tofSeconds"], cell["M"], True),
            solve_branch(cell["mu"], cell["r1"], cell["r2"], cell["tofSeconds"], cell["M"], False),
        ]
        rows.append(
            {
                "body": cell["body"],
                "depDate": cell["depDate"],
                "tofDays": cell["tofDays"],
                "M": cell["M"],
                "branches": branches,
            }
        )
    return {"ok": True, "cells": rows}


def run_boundary(payload):
    rows = []
    for case in payload["cases"]:
        geom = geometry(case["r1"], case["r2"])
        lam = geom["lambda"]
        s = geom["s"]
        scale = math.sqrt((2.0 * case["mu"]) / (s * s * s))
        current_t = scale * case["tofSeconds"]
        true_min = find_true_tmin(lam, case["M"])
        roots = find_roots_for_target(lam, case["M"], true_min["xMin"], true_min["trueTMin"], current_t)
        if roots is None:
            roots_confirmed = False
            left_root = None
            right_root = None
        else:
            roots_confirmed = True
            left_root = roots["leftRootX"]
            right_root = roots["rightRootX"]

        gate_seconds = find_poliastro_gate(case["mu"], case["r1"], case["r2"], case["M"], case["tofSeconds"])
        gate_t = scale * gate_seconds
        rows.append(
            {
                "body": case["body"],
                "depDate": case["depDate"],
                "tofDays": case["tofDays"],
                "M": case["M"],
                "lambda": lam,
                "s": s,
                "normalizedT": current_t,
                "trueTMin": true_min["trueTMin"],
                "xAtTrueTMin": true_min["xMin"],
                "trueTMinSeconds": true_min["trueTMin"] / scale,
                "trueTMinDays": true_min["trueTMin"] / scale / 86400.0,
                "poliastroGateSeconds": gate_seconds,
                "poliastroGateDays": gate_seconds / 86400.0,
                "poliastroGateNormalizedT": gate_t,
                "divergenceBandNormalizedT": gate_t - true_min["trueTMin"],
                "divergenceBandDays": gate_seconds / 86400.0 - true_min["trueTMin"] / scale / 86400.0,
                "rootsConfirmed": roots_confirmed,
                "leftRootX": left_root,
                "rightRootX": right_root,
            }
        )
    return {"ok": True, "cases": rows}


def main():
    payload = json.loads(sys.stdin.read())
    mode = payload["mode"]
    if mode == "bulk":
        json.dump(run_bulk(payload), sys.stdout)
        return
    if mode == "boundary":
        json.dump(run_boundary(payload), sys.stdout)
        return
    raise ValueError(f"unknown mode {mode}")


if __name__ == "__main__":
    main()
