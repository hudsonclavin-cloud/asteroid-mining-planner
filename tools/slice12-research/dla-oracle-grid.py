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


def main():
    payload = json.load(sys.stdin)
    mu_sun = payload["muSunKm3S2"] * (u.km ** 3) / (u.s ** 2)
    output_cells = []

    for cell in payload["cells"]:
        r0 = np.array(cell["earthPositionKm"], dtype=float) * u.km
        r = np.array(cell["asteroidPositionKm"], dtype=float) * u.km
        tof = float(cell["tofDays"]) * u.day
        earth_velocity = np.array(cell["earthVelocityKmps"], dtype=float)

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

    print(json.dumps({"ok": True, "cells": output_cells}))


if __name__ == "__main__":
    main()
