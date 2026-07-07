# Aster MCP internal server

Slice 15 MCP workspace for exposing Aster's validated V2 core over stdio.

This package is intentionally private during Phase B. It imports `src/v2/core/`
directly and compiles those files under a no-DOM TypeScript target so the server
cannot silently depend on browser globals.

## Commands

```powershell
npm install
npm run build
npm test
```

The stdio entry point currently starts an SDK 1.29.0 server with no registered
tools. Evidence-envelope helpers and tests live under `src/envelope/` and
`test/` as they land.
