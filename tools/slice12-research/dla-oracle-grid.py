#!/usr/bin/env python3

import json
import math
import sys

import numpy as np
from astropy import units as u
from poliastro.iod import izzo


def dla_deg(vector):
    mag = float(np.linalg.norm(vector))
    if mag < 0.1:
        return None
    sin_dla = max(-1.0, min(1.0, float(vector[2]) / mag))
    return math.degrees(math.asin(sin_dla))


def solve_branch(mu_sun, r0, r, tof, earth_velocity, m, lowpath):
    """One izzo solve; returns a branch dict or an error dict (M>=1 legitimately
    has no solution below its T_min, so per-branch failure is data, not abort)."""
    try:
        v0, _ = izzo.lambert(mu_sun, r0, r, tof, M=m, prograde=True, lowpath=lowpath)
    except Exception as error:
        return {"lowpath": lowpath, "solved": False, "error": str(error)}
    v_inf_dep = v0.to_value(u.km / u.s) - earth_velocity
    return {
        "lowpath": lowpath,
        "solved": True,
        "vInfDep": [float(v_inf_dep[0]), float(v_inf_dep[1]), float(v_inf_dep[2])],
        "vInfDepMag": float(np.linalg.norm(v_inf_dep)),
        "dlaDeg": dla_deg(v_inf_dep),
    }


def main():
    payload = json.load(sys.stdin)
    mu_sun = payload["muSunKm3S2"] * (u.km ** 3) / (u.s ** 2)
    mode = payload.get("mode", "m0")
    output_cells = []

    for cell in payload["cells"]:
        r0 = np.array(cell["earthPositionKm"], dtype=float) * u.km
        r = np.array(cell["asteroidPositionKm"], dtype=float) * u.km
        tof = float(cell["tofDays"]) * u.day
        earth_velocity = np.array(cell["earthVelocityKmps"], dtype=float)

        if mode == "m0":
            # Legacy Phase A behavior: single M=0 solve; any failure aborts the run.
            try:
                v0, _ = izzo.lambert(mu_sun, r0, r, tof, M=0, prograde=True, lowpath=True)
            except Exception as error:  # pragma: no cover - surfaced back to Node
                print(
                    json.dumps(
                        {
                            "ok": False,
                            "error": str(error),
                            "depDate": cell["depDate"],
                            "tofDays": cell["tofDays"],
                        }
                    )
                )
                return
            v_inf_dep = v0.to_value(u.km / u.s) - earth_velocity
            output_cells.append(
                {
                    "depDate": cell["depDate"],
                    "tofDays": cell["tofDays"],
                    "dlaDeg": dla_deg(v_inf_dep),
                    "vInfDepMag": float(np.linalg.norm(v_inf_dep)),
                }
            )
        elif mode == "m1":
            # M=1 vector-direction oracle: BOTH branches (lowpath True/False), per-branch
            # failure tolerated (below T_min there is no M=1 solution).
            output_cells.append(
                {
                    "depDate": cell["depDate"],
                    "tofDays": cell["tofDays"],
                    "body": cell.get("body"),
                    "branches": [
                        solve_branch(mu_sun, r0, r, tof, earth_velocity, 1, True),
                        solve_branch(mu_sun, r0, r, tof, earth_velocity, 1, False),
                    ],
                }
            )
        else:
            print(json.dumps({"ok": False, "error": f"unknown mode '{mode}'"}))
            return

    print(json.dumps({"ok": True, "mode": mode, "cells": output_cells}))


if __name__ == "__main__":
    main()
