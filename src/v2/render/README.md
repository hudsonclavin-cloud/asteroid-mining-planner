# V2 Render

`render/` turns validated `core/` truth into pixels.

It may:

- project canonical positions into camera-relative coordinates
- apply readable-mode transforms
- control floating origin / origin rebasing

It may not:

- redefine physical truth
- mutate canonical core state
- hide frame assumptions inside global scene state
