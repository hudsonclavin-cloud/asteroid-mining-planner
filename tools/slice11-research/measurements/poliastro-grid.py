#!/usr/bin/env python3

import json
import sys

import numpy as np
from astropy import units as u
from poliastro.iod import izzo


def magnitude(vector):
    return float(np.linalg.norm(vector))


def main():
    payload = json.load(sys.stdin)
    mu_sun = payload["muSunKm3S2"] * (u.km ** 3) / (u.s ** 2)
    output_cells = []

    for cell in payload["cells"]:
        r0 = np.array(cell["earthPositionKm"], dtype=float) * u.km
        r = np.array(cell["asteroidPositionKm"], dtype=float) * u.km
        tof = float(cell["tofDays"]) * u.day
        earth_velocity = np.array(cell["earthVelocityKmps"], dtype=float)
        asteroid_velocity = np.array(cell["asteroidVelocityKmps"], dtype=float)

        try:
            v0, v = izzo.lambert(mu_sun, r0, r, tof, M=0, prograde=True, lowpath=True)
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

        v0_kmps = v0.to_value(u.km / u.s)
        v_kmps = v.to_value(u.km / u.s)
        v_inf_dep = v0_kmps - earth_velocity
        v_inf_arr = v_kmps - asteroid_velocity

        output_cells.append(
            {
                "depDate": cell["depDate"],
                "tofDays": cell["tofDays"],
                "c3": magnitude(v_inf_dep) ** 2,
                "vInfDep": magnitude(v_inf_dep),
                "vInfArr": magnitude(v_inf_arr),
            }
        )

    print(json.dumps({"ok": True, "cells": output_cells}))


if __name__ == "__main__":
    main()
