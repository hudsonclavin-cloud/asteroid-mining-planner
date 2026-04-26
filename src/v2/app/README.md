# V2 App

`app/` owns assembly and mount points.

It is the only place allowed to compose:

- `core/`
- `render/`
- `mission/`
- `boundary/`

No business logic should accumulate here.
