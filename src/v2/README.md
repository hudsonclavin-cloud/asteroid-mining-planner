# Aster V2

`src/v2/` is a clean-room architecture inside the existing product.

Rules:

- no imports from legacy runtime files
- no shared mutable state with legacy
- all truth lives in `core/`
- all visual exaggeration lives in `render/`
- all planning heuristics live in `mission/`
- all data ingestion and external conversions live in `boundary/`

The first slice is Earth + Moon in honest mode only.
