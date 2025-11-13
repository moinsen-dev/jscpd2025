# Quick Start Guide - jscpd-ai

This guide provides ready-to-use commands for common use cases. Just copy and paste!

## Table of Contents

1. [Basic Usage (No AI)](#basic-usage-no-ai)
2. [AI-Enhanced Detection](#ai-enhanced-detection)
3. [Generate Refactoring Guide for Coding AIs](#generate-refactoring-guide-for-coding-ais)
4. [Speed vs Quality Tradeoffs](#speed-vs-quality-tradeoffs)
5. [Language-Specific Examples](#language-specific-examples)
6. [Troubleshooting](#troubleshooting)

---

## Basic Usage (No AI)

### Quick Scan - Find Duplicates Only

**Use Case:** Just want to see if there are duplicates, no AI analysis needed.

```bash
jscpd-ai <path>
```

**Example:**
```bash
jscpd-ai ./src
```

**What you get:** Console output with duplicate count and locations.

---

### Generate HTML Report

**Use Case:** Want a visual report to browse duplicates in a browser.

```bash
jscpd-ai <path> --reporters html --output ./report
```

**Example:**
```bash
jscpd-ai ./src --reporters html --output ./duplication-report
```

**What you get:** HTML report at `./duplication-report/html/index.html`

---

### Fail CI/CD on High Duplication

**Use Case:** Want your build to fail if duplication exceeds a threshold.

```bash
jscpd-ai <path> --threshold <percentage> --exitCode 1
```

**Example:**
```bash
jscpd-ai ./src --threshold 5 --exitCode 1
```

**What you get:** Exit code 1 if duplication >= 5%, otherwise 0.

---

## AI-Enhanced Detection

### Basic AI Analysis - Understand Duplicates

**Use Case:** Want AI to help understand if duplicates are truly problematic.

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "gemma3:1b" \
  --reporters ai \
  --output ./ai-report
```

**Example:**
```bash
jscpd-ai ./src \
  --ai \
  --ai-model "gemma3:1b" \
  --reporters ai \
  --output ./ai-report
```

**What you get:**
- JSON report at `./ai-report/jscpd-ai-report.json`
- Basic AI tagging of duplicates
- ~10-30 seconds processing time

**Model Options:**
- `gemma3:1b` - Fast, good for quick checks
- `codellama:7b` - Balanced (default)
- `codellama:13b` - Better quality, slower

---

### Full AI Analysis - Semantic Similarity

**Use Case:** Want to know if duplicates are functionally equivalent, even if code looks different.

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --reporters ai \
  --output ./semantic-report
```

**Example:**
```bash
jscpd-ai ./src \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --reporters ai \
  --output ./semantic-report
```

**What you get:**
- Similarity scores (0-100%)
- Functionally equivalent determination (Yes/No)
- AI reasoning explaining why duplicates exist
- ~30-60 seconds processing time

---

## Generate Refactoring Guide for Coding AIs

### Create Markdown Prompt - Full Analysis

**Use Case:** Want to generate a markdown file you can feed to Claude/GPT to automatically fix duplicates.

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output <output-dir>
```

**Example:**
```bash
jscpd-ai ./src \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./refactoring-analysis
```

**What you get:**
- `./refactoring-analysis/jscpd-ai-report.json` - Complete AI analysis
- `./refactoring-analysis/refactoring-guide.md` - **Markdown prompt for coding AIs**
- Task checklist with priority (High/Medium/Low)
- Refactoring strategies (extract-function, extract-class, inline, etc.)
- Code snippets from both locations
- ~60-120 seconds processing time

**How to use the markdown guide:**
1. Open `refactoring-guide.md`
2. Copy the entire content
3. Paste into Claude/GPT with: "Please refactor the code according to these suggestions"
4. Review and commit the changes

---

## Speed vs Quality Tradeoffs

### Fast Mode - Quick Check

**Best for:** Large codebases, CI/CD, quick checks

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-timeout 60 \
  --reporters ai \
  --output ./quick-check
```

**Speed:** ~10-30 seconds for small projects
**Quality:** Good enough for most cases

---

### Balanced Mode - Production Use

**Best for:** Regular analysis, most projects

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "codellama:7b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./analysis
```

**Speed:** ~30-90 seconds for small projects
**Quality:** High quality analysis and suggestions

---

### Deep Mode - Comprehensive Analysis

**Best for:** Critical refactoring, legacy code, detailed review

```bash
jscpd-ai <path> \
  --ai \
  --ai-model "codellama:13b" \
  --ai-semantic \
  --ai-refactor \
  --ai-explain \
  --ai-timeout 180 \
  --reporters ai \
  --output ./deep-analysis
```

**Speed:** ~90-300 seconds for small projects
**Quality:** Highest quality, detailed explanations

---

## Language-Specific Examples

### JavaScript/TypeScript Project

```bash
jscpd-ai ./src \
  --format javascript,typescript \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./js-analysis
```

---

### Python Project

```bash
jscpd-ai ./src \
  --format python \
  --ai \
  --ai-model "codellama:7b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./py-analysis
```

---

### Flutter/Dart Project

```bash
jscpd-ai ./lib \
  --format dart \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./flutter-analysis
```

---

### Java Project

```bash
jscpd-ai ./src/main/java \
  --format java \
  --ai \
  --ai-model "codellama:7b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./java-analysis
```

---

### Multi-Language Project

```bash
jscpd-ai ./src \
  --format javascript,typescript,python,java \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./multi-lang-analysis
```

---

## Troubleshooting

### Timeout Errors

**Problem:** `Ollama generation failed: network timeout`

**Solution:** Increase timeout or use faster model

```bash
# Option 1: Increase timeout
jscpd-ai <path> --ai --ai-timeout 180  # 3 minutes

# Option 2: Use faster model
jscpd-ai <path> --ai --ai-model "gemma3:1b"

# Option 3: Both
jscpd-ai <path> --ai --ai-model "gemma3:1b" --ai-timeout 180
```

---

### Ollama Not Running

**Problem:** `Connection refused at http://localhost:11434`

**Solution:**
```bash
# Start Ollama
ollama serve

# In another terminal, pull the model
ollama pull gemma3:1b

# Then run jscpd-ai
jscpd-ai <path> --ai --ai-model "gemma3:1b"
```

---

### AI Analysis Takes Too Long

**Problem:** Analysis running for many minutes

**Solutions:**

1. **Use faster model:**
```bash
jscpd-ai <path> --ai --ai-model "gemma3:1b"
```

2. **Reduce scope:**
```bash
jscpd-ai <path> --min-lines 10  # Only detect larger duplicates
```

3. **Skip AI for some duplicates:**
```bash
jscpd-ai <path> --ai --threshold 5  # Only analyze if > 5% duplication
```

---

### No Markdown File Generated

**Problem:** Only JSON generated, no `refactoring-guide.md`

**Solution:** Add `--ai-refactor` flag

```bash
jscpd-ai <path> \
  --ai \
  --ai-semantic \
  --ai-refactor \  # ← This is required for markdown
  --reporters ai \
  --output ./analysis
```

---

## Recommended Workflow

### For Daily Development

```bash
# Quick check during development
jscpd-ai ./src --ai --ai-model "gemma3:1b"
```

### For PR Reviews

```bash
# Generate report for code review
jscpd-ai ./src \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --reporters ai,html \
  --output ./pr-analysis
```

### For Refactoring Sessions

```bash
# Generate full refactoring guide
jscpd-ai ./src \
  --ai \
  --ai-model "codellama:7b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai \
  --output ./refactor-guide
```

Then use `./refactor-guide/refactoring-guide.md` with Claude/GPT to perform the actual refactoring.

---

## CLI Options Reference

### Essential Options

| Option | Description | Example |
|--------|-------------|---------|
| `<path>` | Directory to analyze | `./src` |
| `--format` | Languages to detect | `--format dart,javascript` |
| `--ai` | Enable AI analysis | `--ai` |
| `--ai-model` | AI model to use | `--ai-model "gemma3:1b"` |
| `--ai-timeout` | Timeout in seconds | `--ai-timeout 120` |
| `--reporters` | Output formats | `--reporters ai,html,console` |
| `--output` | Output directory | `--output ./report` |

### AI Feature Flags

| Option | What it adds | Impact |
|--------|-------------|---------|
| `--ai-semantic` | Similarity scores, equivalence check | +30-60s |
| `--ai-refactor` | Refactoring suggestions + markdown guide | +30-60s |
| `--ai-explain` | Detailed explanations of why duplicates exist | +30-60s |

### Detection Options

| Option | Description | Example |
|--------|-------------|---------|
| `--min-lines` | Min lines for duplication | `--min-lines 5` |
| `--min-tokens` | Min tokens for duplication | `--min-tokens 50` |
| `--threshold` | Fail if duplication >= % | `--threshold 10` |
| `--ignore` | Ignore patterns | `--ignore "**/test/**,**/*.spec.ts"` |

---

## Quick Decision Tree

**"I just want to see if there are duplicates"**
→ `jscpd-ai ./src`

**"I want a nice report to browse"**
→ `jscpd-ai ./src --reporters html --output ./report`

**"I want AI to tell me if duplicates matter"**
→ `jscpd-ai ./src --ai --ai-model "gemma3:1b" --ai-semantic --reporters ai --output ./analysis`

**"I want to auto-fix duplicates with Claude/GPT"**
→ `jscpd-ai ./src --ai --ai-model "gemma3:1b" --ai-semantic --ai-refactor --reporters ai --output ./guide`

**"I'm getting timeouts"**
→ Add `--ai-model "gemma3:1b" --ai-timeout 180`

**"This is too slow"**
→ Use `--ai-model "gemma3:1b"` or increase `--min-lines 10`

---

## Next Steps

- See [GLOBAL_USAGE.md](./GLOBAL_USAGE.md) for installation instructions
- See [FLUTTER_USAGE.md](./FLUTTER_USAGE.md) for Flutter-specific examples
- See [README.md](./README.md) for full documentation
