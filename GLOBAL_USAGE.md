# jscpd-ai Global Command - Quick Reference

## ✅ Setup Complete!

The `jscpd-ai` command is now globally available on your system.

```bash
# Verify installation
jscpd-ai --version
# Output: 1.0.0
```

## Quick Start with Your Flutter Project

### 1. Basic Analysis

```bash
# Navigate to your Flutter project
cd /path/to/your/flutter/app

# Analyze the lib directory
jscpd-ai lib/ --format dart --min-lines 10 --reporters console
```

### 2. With HTML Report

```bash
jscpd-ai lib/ \
  --format dart \
  --min-lines 10 \
  --reporters console,html \
  --output ./duplication-report

# View report
open duplication-report/html/index.html
```

### 3. With AI Features (Requires Ollama)

```bash
# Make sure Ollama is running first:
# ollama serve

jscpd-ai lib/ \
  --format dart \
  --min-lines 10 \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters console,html,ai \
  --output ./ai-analysis
```

### 4. With Configuration File

Create `.jscpd.json` in your project root:

```json
{
  "format": ["dart"],
  "ignore": [
    "**/*.g.dart",
    "**/*.freezed.dart",
    "**/build/**",
    "**/.dart_tool/**"
  ],
  "minLines": 15,
  "threshold": 10,
  "reporters": ["console", "html"],
  "output": "./code-analysis"
}
```

Then simply run:
```bash
jscpd-ai .
```

## Common Commands

### Analyze Specific Directories
```bash
# Just lib folder
jscpd-ai lib/

# Multiple directories
jscpd-ai lib/ test/

# Specific feature
jscpd-ai lib/src/features/authentication/
```

### Different Report Formats
```bash
# Console only (fastest)
jscpd-ai lib/ --reporters console

# HTML + JSON
jscpd-ai lib/ --reporters html,json --output ./reports

# All formats including AI
jscpd-ai lib/ --reporters console,html,json,ai --ai --output ./reports
```

### Adjust Sensitivity
```bash
# More strict (catch smaller duplications)
jscpd-ai lib/ --min-lines 5 --min-tokens 30

# Less strict (only large duplications)
jscpd-ai lib/ --min-lines 20 --min-tokens 100

# With threshold for CI/CD
jscpd-ai lib/ --threshold 5 --exitCode 1
```

### Focus on Dart Files Only
```bash
# Ignore generated files
jscpd-ai lib/ \
  --format dart \
  --ignore "**/*.g.dart,**/*.freezed.dart,**/*.config.dart"
```

## Common Use Cases

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
jscpd-ai lib/ --threshold 10 --exitCode 1
if [ $? -ne 0 ]; then
  echo "❌ Code duplication threshold exceeded!"
  exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### CI/CD Pipeline

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  duplication-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install jscpd-ai
        run: |
          git clone https://github.com/moinsen-dev/jscpd2025.git
          cd jscpd2025
          pnpm install
          cd apps/jscpd
          pnpm link --global

      - name: Check duplication
        run: |
          jscpd-ai lib/ \
            --format dart \
            --threshold 10 \
            --reporters console,json,badge \
            --output ./reports \
            --exitCode 1

      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: duplication-reports
          path: reports/
```

### VS Code Task

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Duplication",
      "type": "shell",
      "command": "jscpd-ai",
      "args": [
        "lib/",
        "--format", "dart",
        "--reporters", "console,html",
        "--output", "./duplication-report"
      ],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Run with: `Cmd+Shift+P` → `Tasks: Run Task` → `Check Duplication`

## All Available Options

```bash
jscpd-ai --help
```

Key options:
- `--format [string]`: Language format (dart, javascript, python, etc.)
- `--min-lines [number]`: Minimum lines to detect (default: 5)
- `--min-tokens [number]`: Minimum tokens to detect (default: 50)
- `--threshold [number]`: Duplication threshold percentage
- `--reporters [string]`: Comma-separated list: console,html,json,ai,badge
- `--output [string]`: Output directory for reports
- `--ignore [string]`: Comma-separated glob patterns to ignore
- `--ai`: Enable AI-powered analysis
- `--ai-model [string]`: Ollama model (gemma3:1b, llama3.1:8b, etc.)
- `--ai-semantic`: Enable semantic similarity analysis
- `--ai-refactor`: Generate refactoring suggestions
- `--ai-explain`: Generate explanations
- `--exitCode [number]`: Exit code when duplications found

## Uninstalling

To remove the global link:
```bash
pnpm uninstall --global jscpd-ai
```

To reinstall/update:
```bash
cd /Users/udi/work/moinsen/opensource/jscpd2025/apps/jscpd
pnpm link --global
```

## Troubleshooting

### Command not found after installation
```bash
# Check pnpm global bin directory is in PATH
pnpm bin -g
# Output: /Users/udi/Library/pnpm

# Add to your ~/.zshrc or ~/.bashrc if needed:
export PATH="$HOME/Library/pnpm:$PATH"

# Reload shell
source ~/.zshrc
```

### Permission errors
```bash
# Run with appropriate permissions
sudo jscpd-ai lib/  # Not recommended

# Or fix pnpm permissions:
pnpm setup
```

### AI features not working
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull a model
ollama pull gemma3:1b
```

## Examples

### Example 1: Quick Check
```bash
cd ~/projects/my_flutter_app
jscpd-ai lib/ --format dart --reporters console
```

### Example 2: Full Analysis with Reports
```bash
cd ~/projects/my_flutter_app
jscpd-ai lib/ \
  --format dart \
  --min-lines 15 \
  --reporters console,html,json \
  --output ./analysis \
  --ignore "**/*.g.dart,**/*.freezed.dart"

open analysis/html/index.html
```

### Example 3: AI-Enhanced Analysis
```bash
cd ~/projects/my_flutter_app

# Start Ollama first
ollama serve &

# Run analysis
jscpd-ai lib/src/features/ \
  --format dart \
  --ai \
  --ai-model "gemma3:1b" \
  --ai-semantic \
  --ai-refactor \
  --reporters ai,html \
  --output ./ai-report

# View AI insights
cat ai-report/jscpd-ai-report.json | jq '.recommendations'
```

### Example 4: CI/CD Integration
```bash
# Exit with error if duplication > 5%
jscpd-ai lib/ \
  --format dart \
  --threshold 5 \
  --exitCode 1 \
  --reporters console,badge \
  --output ./reports

# In CI, this will fail the build if threshold exceeded
```

## Tips

1. **Start with console reporter** to get quick feedback
2. **Use HTML reporter** for detailed visual analysis
3. **Use AI reporter** for refactoring suggestions (slower but insightful)
4. **Set appropriate thresholds** based on your codebase maturity
5. **Ignore generated files** to focus on hand-written code
6. **Run regularly** to catch duplication early
7. **Use in CI/CD** to prevent duplication from growing

## Next Steps

1. ✅ Test it on a small directory first
2. ✅ Review the HTML report to understand your codebase
3. ✅ Set up configuration file for your project
4. ✅ Integrate into your development workflow
5. ✅ Add to CI/CD pipeline
6. ✅ Track improvements over time
