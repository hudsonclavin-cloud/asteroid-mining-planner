# F1 B5-F06 UI copy diff

Rendered runtime hit:

```diff
-Dogleg regime (this cell): AMBER — plane-matching from ${siteName} is handled by launch geometry at ~1 m/s-per-degree class cost (JPL DESCANSO Vol. 12 evidence), below screening error bars; zero added ΔV, disclosed rather than fabricated.
+Dogleg regime (this cell): AMBER — plane-matching from ${siteName} is handled by launch geometry (launch-geometry class; below screening error bars); zero added ΔV, disclosed rather than fabricated.
```

The F1 regression test adds the requirement that the page source contains `below screening error bars` and does not match `/m\/s[- ]per[- ]degree/`.
