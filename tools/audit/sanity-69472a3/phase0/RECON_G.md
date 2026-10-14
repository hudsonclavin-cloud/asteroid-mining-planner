# Recon G - planetary axes at current HEAD

Production import: `.tmp-tests/v2-runtime-camera-presets/app/solar-system/runtime.js`, compiled from `src/v2/app/solar-system/runtime.ts`; PCK: `vendor/naif/pck00010.tpc`. The imported production probe reports `MARS_RENDER_TILT_RAD=0.4396484385773716` and `marsTiltGroup.rotation.x=0.4396484385773716.

## Pole-tilt code quoted from production

- `runtime.ts:91-93`: `MARS_RENDER_TILT_RAD = degToRad(25.19)` and `SATURN_RENDER_TILT_RAD = degToRad(26.7)`.
- `runtime.ts:511-512`: sphere bodies use `new THREE.SphereGeometry(...)` with no pole rotation.
- `runtime.ts:700`: Mars group sets `marsTiltGroup.rotation.x = MARS_RENDER_TILT_RAD`.
- `runtime.ts:1222`: Saturn group sets `saturnTiltGroup.rotation.x = SATURN_RENDER_TILT_RAD`.
- `jupiter-oblate.ts:34-35`: local Y is visual up/spin axis; only `mesh.scale.set(1, JUPITER_POLAR_SCALE, 1)`.
- `mars-oblate.ts:34-36`: local Y is visual spin/polar axis; only non-uniform scale is applied.
- `saturn-oblate.ts:34-36`: local Y is polar axis; only non-uniform scale is applied.
- `saturn-rings.ts:142-143`: ring geometry is rotated by `SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD = -Math.PI / 2`; the external Saturn tilt group supplies the 26.7-degree tilt.

## PCK pole lines and angle probe

| Body | PCK RA/Dec lines | Render angle from ICRF +Z | PCK angle from ICRF +Z | Render/PCK vector separation |
|---|---|---:|---:|---:|
| Sun | `943-944`: `BODY10_POLE_RA         = (  286.13       0.          0. )` / `BODY10_POLE_DEC        = (   63.87       0.          0. )` | 90.00 deg | 26.13 deg | 115.03 deg |
| Mercury | `965-966`: `BODY199_POLE_RA          = (  281.0097   -0.0328     0. )` / `BODY199_POLE_DEC         = (   61.4143   -0.0049     0. )` | 90.00 deg | 28.59 deg | 118.01 deg |
| Venus | `1013-1014`: `BODY299_POLE_RA          = (  272.76       0.          0. )` / `BODY299_POLE_DEC         = (   67.16       0.          0. )` | 90.00 deg | 22.84 deg | 112.81 deg |
| Earth | `1032-1033`: `BODY399_POLE_RA        = (    0.      -0.641         0. )` / `BODY399_POLE_DEC       = (   90.      -0.557         0. )` | 90.00 deg | 0.00 deg | 90.00 deg |
| Moon | `1492-1493`: `BODY301_POLE_RA      = (  269.9949        0.0031        0.      )` / `BODY301_POLE_DEC     = (   66.5392        0.0130        0.      )` | 90.00 deg | 23.46 deg | 113.46 deg |
| Mars | `1146-1147`: `BODY499_POLE_RA          = (  317.68143   -0.1061      0.  )` / `BODY499_POLE_DEC         = (   52.88650   -0.0609      0.  )` | 64.81 deg | 37.11 deg | 91.62 deg |
| Phobos | `1533-1534`: `BODY401_POLE_RA  = ( 317.68    -0.108     0.                     )` / `BODY401_POLE_DEC = (  52.90    -0.061     0.                     )` | 90.00 deg | 37.10 deg | 113.96 deg |
| Deimos | `1587-1588`: `BODY402_POLE_RA       = (  316.65     -0.108       0.           )` / `BODY402_POLE_DEC      = (   53.52     -0.061       0.           )` | 90.00 deg | 36.48 deg | 114.09 deg |
| Jupiter | `670-671`: `BODY599_POLE_RA        = (   268.056595     -0.006499       0. )` / `BODY599_POLE_DEC       = (    64.495303      0.002413       0. )` | 90.00 deg | 25.50 deg | 115.49 deg |
| Io | `788-789`: `BODY501_POLE_RA       = (  268.05          -0.009      0. )` / `BODY501_POLE_DEC      = (   64.50           0.003      0. )` | 90.00 deg | 25.50 deg | 115.48 deg |
| Europa | `1639-1640`: `BODY502_POLE_RA       = (  268.08          -0.009      0.   )` / `BODY502_POLE_DEC      = (   64.51           0.003      0.   )` | 90.00 deg | 25.49 deg | 115.47 deg |
| Ganymede | `1661-1662`: `BODY503_POLE_RA       = (  268.20         -0.009       0.  )` / `BODY503_POLE_DEC      = (   64.57          0.003       0.  )` | 90.00 deg | 25.43 deg | 115.42 deg |
| Callisto | `1684-1685`: `BODY504_POLE_RA       = (   268.72    -0.009       0.  )` / `BODY504_POLE_DEC      = (    64.83     0.003       0.  )` | 90.00 deg | 25.17 deg | 115.16 deg |
| Saturn | `1297-1298`: `BODY699_POLE_RA        = (    40.589    -0.036      0.  )` / `BODY699_POLE_DEC       = (    83.537    -0.004      0.  )` | 63.30 deg | 6.46 deg | 59.21 deg |
| Titan | `1944-1945`: `BODY606_POLE_RA       = (    36.41   -0.036      0. )` / `BODY606_POLE_DEC      = (    83.94   -0.004      0. )` | 90.00 deg | 6.06 deg | 86.41 deg |
| Rhea | `1924-1925`: `BODY605_POLE_RA       = (   40.38   -0.036       0. )` / `BODY605_POLE_DEC      = (   83.55   -0.004       0. )` | 90.00 deg | 6.45 deg | 85.83 deg |
| Iapetus | `1998-1999`: `BODY608_POLE_RA       = (   318.16  -3.949      0.  )` / `BODY608_POLE_DEC      = (    75.03  -1.143      0.  )` | 90.00 deg | 14.97 deg | 99.92 deg |
| Tethys | `1861-1862`: `BODY603_POLE_RA       = (   40.66    -0.036       0. )` / `BODY603_POLE_DEC      = (   83.52    -0.004       0. )` | 90.00 deg | 6.48 deg | 85.78 deg |
| Dione | `1890-1891`: `BODY604_POLE_RA       = (  40.66      -0.036      0.  )` / `BODY604_POLE_DEC      = (  83.52      -0.004      0.  )` | 90.00 deg | 6.48 deg | 85.78 deg |
| Mimas | `1802-1803`: `BODY601_POLE_RA       = (   40.66     -0.036      0.  )` / `BODY601_POLE_DEC      = (   83.52     -0.004      0.  )` | 90.00 deg | 6.48 deg | 85.78 deg |
| Enceladus | `1831-1832`: `BODY602_POLE_RA       = (   40.66    -0.036       0. )` / `BODY602_POLE_DEC      = (   83.52    -0.004       0. )` | 90.00 deg | 6.48 deg | 85.78 deg |

The rendered sphere/oblate local pole is +Y (90 deg from +Z), with Mars/Saturn additionally rotated about +X by the stated render tilt. The vector-separation column is the adversarial mismatch measure; it spans 59.21-118.01 deg for the rendered bodies, including the 59.21 deg Saturn minimum and 115.49 deg Jupiter result.
