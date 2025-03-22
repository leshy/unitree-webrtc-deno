# Claude Agent Instructions

## Directory Structure
- `src/`: Source code
- `dist/`: Compiled output

## Commands
- Build: `npm run build`
- Dev (watch mode): `npm run dev`
- Test (all): `npm test`
- Test (single): `npx ava test.tsx -m "test name pattern"`
- Run app: `node dist/cli.js`
- Run with args: `node dist/cli.js --name=YourName`
- Lint: `npx xo`
- Format: `npx prettier --write .`
- Typecheck: `npx tsc --noEmit`

## Code Style
- **Types**: Use TypeScript with strict typing, define props interfaces
- **Naming**: camelCase for variables/methods, PascalCase for components
- **Imports**: Use named imports, include file extensions for local imports
- **Architecture**: React functional components with hooks
- **Formatting**: Prettier with @vdemedes/prettier-config conventions
- **Components**: Ink components for terminal UI, React patterns
- **Error Handling**: Try/catch for synchronous errors
- **Testing**: AVA test runner with ink-testing-library
- **Module System**: ESM (import/export), not CommonJS