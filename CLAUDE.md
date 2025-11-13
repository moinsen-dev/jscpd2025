# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**jscpd-ai** is an AI-enhanced copy/paste detector for programming source code, supporting 150+ programming languages with local AI-powered semantic analysis via Ollama. It extends the original jscpd with intelligent refactoring suggestions and enhanced Dart/Flutter support.

This is a **monorepo** managed with:
- **pnpm** workspaces for package management
- **Turbo 2.6+** for build orchestration and caching
- **tsup** for building TypeScript packages
- **vitest** for testing

## Monorepo Structure

The repository is organized into two main directories:

### `apps/`
- **jscpd-ai** - Main CLI application and public API, provides `jscpd-ai` command and programmatic interfaces (`jscpd()`, `detectClones()`)

### `packages/`
Core packages (all under **@jscpd-ai/** scope):

**Detection Core:**
- **@jscpd-ai/core** - Core duplication detection algorithm using Rabin-Karp. Only depends on `eventemitter3`. Contains the `Detector` class, `RabinKarp` algorithm implementation, stores (`MemoryStore`), and validators
- **@jscpd-ai/tokenizer** - Tokenizes source code for 150+ programming languages/formats. Includes enhanced Dart/Flutter 3.0+ pattern detection in `src/languages/dart.ts`
- **@jscpd-ai/finder** - File system detection layer. Provides `InFilesDetector` that orchestrates detection across multiple files using the core detector

**AI Enhancement Packages (NEW):**
- **@jscpd-ai/ollama-service** - Ollama integration for local AI analysis. Provides `OllamaService` class with methods for semantic similarity, refactoring suggestions, and duplication explanations
- **@jscpd-ai/ai-reporter** - AI-enhanced reporter that generates reports with semantic analysis and refactoring suggestions

**Reporter Packages:**
- **@jscpd-ai/html-reporter** - HTML report generation
- **@jscpd-ai/badge-reporter** - Badge generation for duplication metrics
- **@jscpd-ai/sarif-reporter** - SARIF format output

**Store Packages:**
- **@jscpd-ai/leveldb-store** - LevelDB-backed store for large repositories (slower than memory store)
- **@jscpd-ai/redis-store** - Redis-backed store option

**Utility Packages:**
- **@jscpd-ai/tsconfig** - Shared TypeScript configuration

## Architecture

### Detection Flow
1. **File Discovery** (`@jscpd/finder`) - `getFilesToDetect()` finds files matching patterns, respecting ignore rules and gitignore
2. **Tokenization** (`@jscpd/tokenizer`) - Source code is parsed into tokens based on language format
3. **Detection** (`@jscpd/core`) - `Detector` uses `RabinKarp` algorithm to find matching token sequences in the store
4. **Validation** (`@jscpd/core`) - Clone validators ensure duplications meet thresholds (min lines, min tokens, etc.)
5. **Reporting** (`@jscpd/finder` + reporters) - Results are formatted and output via registered reporters

### Key Components
- **Detector** (`@jscpd/core`) - Main detection class, emits events during detection lifecycle
- **RabinKarp** (`@jscpd/core`) - Rolling hash algorithm implementation for efficient pattern matching
- **InFilesDetector** (`@jscpd/finder`) - Orchestrates detection across files, manages reporters/subscribers/hooks
- **Stores** (`@jscpd/core`) - Implement `IStore<IMapFrame>` interface for storing token maps (Memory, LevelDB, Redis)
- **Tokenizer** (`@jscpd/tokenizer`) - Implements `ITokenizer`, generates `ITokensMap[]` from source code

## Development Commands

### Building
```bash
# Build all packages (uses Turbo)
pnpm build

# Build a specific package
cd packages/core && pnpm build

# Watch mode (rebuilds on changes)
pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/core && pnpm test

# Watch mode for tests (in individual packages)
cd packages/core && pnpm test:dev
```

### Linting
```bash
# Lint all packages
pnpm lint

# Auto-fix lint issues
pnpm lint:fix
```

### Type Checking
```bash
# Type check all packages
pnpm typecheck
```

### Cleanup
```bash
# Clean build artifacts
pnpm cleanup
```

### Package Publishing
```bash
# Uses changesets for versioning and publishing
pnpm publish-packages
```

### Running jscpd CLI Locally
```bash
# After building, run the CLI
node apps/jscpd/bin/jscpd [path-to-analyze]

# Or with npx in development
cd apps/jscpd && node bin/jscpd ../../
```

## Working with Individual Packages

Each package in `packages/` has its own:
- `package.json` with local scripts
- `tsup.config.ts` for build configuration
- `src/` directory with TypeScript source
- `dist/` directory (generated) with compiled output

When modifying a package, you typically need to:
1. Make changes in `src/`
2. Run `pnpm build` (or `pnpm dev` for watch mode)
3. Run `pnpm test` to verify changes
4. Dependent packages will automatically use the updated version due to `workspace:*` dependencies

## Testing Strategy

Tests use vitest and are located in `__tests__/` directories within each package. To run tests for a single package:
```bash
cd packages/[package-name]
pnpm test
```

For test-driven development with watch mode:
```bash
cd packages/[package-name]
pnpm test:dev
```

## Configuration Files

- `.jscpd.json` - jscpd configuration (can be in project root)
- `package.json` - Can contain `jscpd` section for configuration
- `turbo.json` - Turbo pipeline configuration for build orchestration
- `pnpm-workspace.yaml` - Defines workspace packages and build dependencies

## Important Implementation Notes

### Rabin-Karp Algorithm
The core detection uses a rolling hash technique (packages/core/src/rabin-karp.ts) that:
- Iterates through token maps using an iterator pattern
- Checks each hash against the store
- When a match is found, attempts to enlarge the clone
- Validates clones before adding to results

### Event System
Detection uses EventEmitter3 for lifecycle events:
- Subscribers implement `ISubscriber` interface with `subscribe()` method
- Returns a map of event handlers for different detection events
- Events include CLONE_FOUND, END, etc.
- Located in `InFilesDetector` and `Detector` classes
- AI reporter subscribes to these events to enhance clones with AI analysis

### Store Abstraction
All stores implement `IStore<IMapFrame>` with:
- `get(id: string): Promise<IMapFrame>`
- `set(id: string, frame: IMapFrame): Promise<void>`
- `close(): void`

Default is `MemoryStore`, use `@jscpd-ai/leveldb-store` for large repositories.

### AI Integration Architecture
The AI features are implemented as an optional layer:
1. **OllamaService** (`packages/ollama-service/src/index.ts`) - Handles communication with local Ollama instance
   - `checkAvailability()` - Verifies Ollama is running
   - `analyzeSementicSimilarity()` - Compares code semantically
   - `generateRefactoringSuggestion()` - Creates refactoring advice
   - `explainDuplication()` - Generates natural language explanations

2. **AIReporter** (`packages/ai-reporter/src/index.ts`) - Implements `ISubscriber`
   - Listens to CLONE_FOUND events
   - Enhances clones with AI analysis asynchronously
   - Generates AI-enhanced reports in JSON/Markdown/HTML

3. **AI Features are Optional** - All AI features gracefully degrade:
   - If Ollama is not available, traditional detection continues
   - Reports show which clones were AI-analyzed
   - No external API calls - everything runs locally

### Dart/Flutter Enhanced Support
The tokenizer includes special handling for Dart 3.0+ and Flutter (`packages/tokenizer/src/languages/dart.ts`):
- **Null Safety Operators**: `??`, `?.`, `!`
- **Flutter Widget Patterns**: Detects 20+ common widgets (Container, Column, Row, Scaffold, etc.)
- **Modern Dart Features**: Records, sealed classes, pattern matching
- **Widget Tree Analysis**: `extractWidgetStructure()` identifies structural similarities
- Detects StatefulWidget and StatelessWidget patterns
- Analyzes build methods for duplication

## Entry Points

- CLI: `apps/jscpd-ai/bin/jscpd` (shell script) → `apps/jscpd-ai/src/cli.ts`
- Programmatic API: `apps/jscpd-ai/src/index.ts` exports `jscpd()` and `detectClones()`
- Core detection: `packages/core/src/detector.ts` exports `Detector` class
- Tokenization: `packages/tokenizer/src/tokenize.ts` exports `createTokenMapBasedOnCode()`
- Dart tokenization: `packages/tokenizer/src/languages/dart.ts` exports Dart-specific functions
- AI Service: `packages/ollama-service/src/index.ts` exports `OllamaService` class
- AI Reporter: `packages/ai-reporter/src/index.ts` exports `AIReporter` class

## Testing with AI Features

### Prerequisites for AI Testing
- **Ollama must be installed and running** on localhost:11434
- Recommended models: `codellama:7b`, `gemma3:1b`, `llama3.1:8b`
- Check Ollama status: `curl http://localhost:11434/api/tags`

### Testing Commands

```bash
# Test traditional detection (no Ollama required)
pnpm test

# Test with specific package
cd packages/core && pnpm test

# Watch mode for TDD
cd packages/core && pnpm test:dev

# Test Dart detection
node apps/jscpd-ai/bin/jscpd fixtures/dart --reporters console --min-lines 3

# Test AI features (requires Ollama)
node apps/jscpd-ai/bin/jscpd fixtures/dart --ai --ai-semantic --reporters ai

# Test Ollama service directly
cd packages/ollama-service && pnpm test:dev
```

### Verifying AI Integration
1. Build all packages: `pnpm build`
2. Check Ollama: `ollama --version`
3. Pull a model: `ollama pull codellama:7b`
4. Test detection with AI: `node apps/jscpd-ai/bin/jscpd ./fixtures --ai --ai-refactor`
5. Check for AI-enhanced output in console or reports

## Common Issues

### Build Errors
- **"Cannot find module '@jscpd/core'"**: Old references to original package name. Should be `@jscpd-ai/core`
- **"Cannot find type definition file for 'node'"**: Missing `@types/node` in package devDependencies
- **tsup DTS build errors**: Usually TypeScript type mismatches. Check imports and interface implementations

### Ollama Issues
- **"Ollama not available"**: Check if Ollama service is running: `curl http://localhost:11434`
- **AI features not working**: Verify model is pulled: `ollama list`
- **Timeout errors**: Increase timeout in config: `"ollama": { "timeout": 60000 }`

### Package Naming
All packages use `@jscpd-ai/*` scope, not `@jscpd/*`. When adding imports, always use the `-ai` suffix:
- ✅ `import { IClone } from '@jscpd-ai/core'`
- ❌ `import { IClone } from '@jscpd/core'`
