# N1 LR1 difference

This workstream replays the 14,124 LR1 records against the copied production build and against a build compiled from LR1's recorded head commit `0d31cda3d1dca81d29f45092be26b94bb44294c1`. It compares the recorded input vectors and scalars before comparing Lambert output vectors. It also invokes the old-head `computePorkchopGrid` 1x1 swapped-provider path used by LR1 on every record.

The external JSON evidence is `C:\Users\hudso\s20-overnight2-store\n1\input-compare.json`. The old-head throwaway control and full unedited run-1 ON2 harness output remain under `C:\Users\hudso\s20-overnight2-store\tmp-n1-lr1`.
