# Using jscpd-ai with Flutter Projects

## Quick Start

### 1. Ensure Ollama is Running (for AI features)

```bash
ollama serve
# In another terminal, pull a model if you haven't:
ollama pull gemma3:1b
```

### 2. Analyze Your Flutter Project

```bash
# Option A: From jscpd2025 repo
node apps/jscpd/bin/jscpd /path/to/flutter/project \
  --format dart \
  --min-lines 10 \
  --ai \
  --ai-model "gemma3:1b" \
  --reporters console,html,ai \
  --output ./flutter-report

# Option B: If linked globally
jscpd-ai /path/to/flutter/project \
  --format dart \
  --min-lines 10 \
  --ai \
  --reporters console,html,ai
```

## Recommended Configuration for Flutter

Create `.jscpd.json` in your Flutter project root:

```json
{
  "threshold": 5,
  "reporters": ["console", "html", "ai"],
  "format": ["dart"],
  "ignore": [
    "**/*.g.dart",
    "**/*.freezed.dart",
    "**/*.config.dart",
    "**/generated/**",
    "**/.dart_tool/**",
    "**/build/**",
    "**/ios/**",
    "**/android/**",
    "**/windows/**",
    "**/linux/**",
    "**/macos/**",
    "**/web/**",
    "**/*.pb.dart",
    "**/*.pbenum.dart",
    "**/*.pbgrpc.dart",
    "**/*.pbjson.dart"
  ],
  "minLines": 15,
  "minTokens": 70,
  "maxLines": 500,
  "output": "./code-analysis",
  "reportersOptions": {
    "ai": {
      "enabled": true,
      "aiModel": "gemma3:1b",
      "includeSemanticAnalysis": true,
      "includeRefactoringSuggestions": true,
      "includeExplanations": false,
      "minSimilarityForAI": 40
    }
  }
}
```

## Flutter-Specific Features

### Enhanced Dart 3.0+ Support

jscpd-ai includes advanced tokenization for:
- Null safety operators (`??`, `?.`, `!`)
- Pattern matching
- Records
- Extension methods
- Sealed classes
- Enhanced enums

### Flutter Widget Detection

Automatically recognizes common Flutter patterns:
- StatelessWidget / StatefulWidget
- State management patterns
- Builder widgets
- Custom painters
- Inherited widgets

## Common Use Cases

### 1. Pre-Commit Analysis

```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
jscpd-ai lib/ \
  --min-lines 15 \
  --threshold 10 \
  --reporters console \
  --exitCode 1

if [ $? -ne 0 ]; then
  echo "⚠️  Duplication threshold exceeded!"
  exit 1
fi
```

### 2. CI/CD Integration

```yaml
# GitHub Actions example
- name: Check code duplication
  run: |
    npx jscpd-ai lib/ \
      --format dart \
      --threshold 5 \
      --reporters console,json,badge \
      --output ./reports \
      --exitCode 1
```

### 3. Full Project Analysis with AI

```bash
# Comprehensive analysis (takes longer due to AI processing)
jscpd-ai lib/ \
  --format dart \
  --min-lines 10 \
  --ai \
  --ai-model "llama3.1:8b" \
  --ai-semantic \
  --ai-refactor \
  --ai-explain \
  --reporters console,html,ai,json \
  --output ./full-analysis
```

## Understanding the Reports

### Console Output
Shows immediate feedback with:
- Files analyzed
- Total duplication percentage
- Number of clones found

### HTML Report
Open `reports/html/index.html` in browser for:
- Interactive visualization
- Side-by-side code comparison
- File-by-file breakdown

### AI Report (`jscpd-ai-report.json`)
Contains:
- **summary**: Overview statistics
- **clones**: Detailed duplicate information with code fragments
- **refactoringSummary**: AI-generated refactoring suggestions
- **recommendations**: Actionable advice
- **ollamaModel**: Which AI model was used

Example AI report structure:
```json
{
  "summary": {
    "totalClones": 5,
    "duplicatePercentage": 12.5,
    "aiAnalyzedClones": 3
  },
  "clones": [
    {
      "format": "dart",
      "duplicationA": { /* code location */ },
      "duplicationB": { /* code location */ },
      "semanticAnalysis": {
        "similarityScore": 85,
        "confidence": 0.92,
        "functionallyEquivalent": true,
        "reasoning": "Both methods implement the same business logic..."
      },
      "refactoringSuggestion": {
        "type": "extract-function",
        "confidence": 0.88,
        "description": "Extract common validation logic into shared utility",
        "reasoning": "..."
      }
    }
  ],
  "recommendations": [
    "High duplication detected (12.5%). Consider refactoring.",
    "3 high-priority refactoring opportunities identified."
  ]
}
```

## Performance Tips

### For Large Projects

1. **Focus on specific directories**:
   ```bash
   jscpd-ai lib/src/features/ --format dart
   ```

2. **Increase minimum thresholds**:
   ```bash
   jscpd-ai lib/ --min-lines 20 --min-tokens 100
   ```

3. **Skip AI for initial scan**:
   ```bash
   # First, identify duplicates quickly
   jscpd-ai lib/ --reporters console

   # Then, analyze specific files with AI
   jscpd-ai lib/src/problematic/ --ai --ai-refactor
   ```

4. **Use faster AI models**:
   ```bash
   # gemma3:1b is fastest
   --ai-model "gemma3:1b"

   # llama3.1:8b is more accurate but slower
   --ai-model "llama3.1:8b"
   ```

## Troubleshooting

### "Ollama is not available"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Verify model is pulled
ollama list
ollama pull gemma3:1b
```

### "EPERM: operation not permitted"
Add to `.jscpd.json`:
```json
{
  "ignore": ["**/node_modules/**", "**/.dart_tool/**", "**/build/**"]
}
```

### High Memory Usage
```bash
# Use store option for large codebases
jscpd-ai lib/ --store leveldb
```

## Example: Analyzing a Real Flutter App

```bash
# Clone a Flutter app
git clone https://github.com/flutter/samples.git
cd samples/provider_counter

# Create config
cat > .jscpd.json << 'EOF'
{
  "format": ["dart"],
  "ignore": ["**/*.g.dart", "**/build/**"],
  "minLines": 10,
  "reporters": ["console", "html", "ai"],
  "output": "./duplication-report"
}
EOF

# Run analysis
jscpd-ai . --ai --ai-model "gemma3:1b"

# View HTML report
open duplication-report/html/index.html

# View AI report
cat duplication-report/jscpd-ai-report.json | jq .
```

## Next Steps

1. **Review the reports** and identify the biggest duplication hotspots
2. **Focus on high-priority refactorings** suggested by AI
3. **Set up CI/CD** to prevent future duplication
4. **Configure thresholds** appropriate for your team
5. **Iterate** and track improvements over time
