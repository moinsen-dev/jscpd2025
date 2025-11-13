/**
 * AI Reporter for jscpd-ai
 * Generates AI-enhanced reports with semantic analysis and refactoring suggestions
 */

import { IClone, ISubscriber, IStatistic, IEventPayload } from '@jscpd-ai/core';
import { IReporter } from '@jscpd-ai/finder';
import { OllamaService, SemanticAnalysis, RefactoringSuggestion } from '@jscpd-ai/ollama-service';
import { writeFileSync, ensureDirSync } from 'fs-extra';

export interface AIReportOptions {
  output?: string;
  format?: 'json' | 'markdown' | 'html';
  includeRefactoringSuggestions?: boolean;
  includeSemanticAnalysis?: boolean;
  includeExplanations?: boolean;
  minSimilarityForAI?: number; // Only use AI for similarities above this threshold (40-70%)
}

export interface AIEnhancedClone extends IClone {
  semanticAnalysis?: SemanticAnalysis;
  refactoringSuggestion?: RefactoringSuggestion;
  explanation?: string;
  aiProcessed?: boolean;
}

export interface AIReport {
  summary: {
    totalClones: number;
    totalFiles: number;
    totalLines: number;
    duplicatePercentage: number;
    aiAnalyzedClones: number;
  };
  clones: AIEnhancedClone[];
  refactoringSummary?: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    totalSuggestions: number;
  };
  recommendations: string[];
  generatedAt: string;
  ollamaModel?: string;
}

export class AIReporter implements ISubscriber, IReporter {
  private ollamaService: OllamaService | null = null;
  private options: AIReportOptions;
  private clones: AIEnhancedClone[] = [];
  private aiProcessingPromises: Promise<void>[] = [];
  private initializationPromise: Promise<void>;
  private processedCount: number = 0;
  private failedCount: number = 0;
  private statistic: IStatistic | null = null;
  private completionPromise: Promise<void> = Promise.resolve();

  constructor(options: any = {}) {
    // Extract AI-specific options from reportersOptions.ai if available
    const aiOptions = options.reportersOptions?.ai || {};

    this.options = {
      format: 'json',
      includeRefactoringSuggestions: aiOptions.includeRefactoringSuggestions !== false,
      includeSemanticAnalysis: aiOptions.includeSemanticAnalysis !== false,
      includeExplanations: aiOptions.includeExplanations || false,
      minSimilarityForAI: aiOptions.minSimilarityForAI || 40,
      output: aiOptions.output || options.output,
      ...aiOptions,
    };

    // Start Ollama initialization and store the promise
    this.initializationPromise = this.initializeOllama(aiOptions);
  }

  private async initializeOllama(aiOptions: any): Promise<void> {
    try {
      console.log('[AI Reporter] Starting Ollama initialization...');
      const ollamaConfig: any = {};

      if (aiOptions.aiHost) {
        ollamaConfig.host = aiOptions.aiHost;
      }

      if (aiOptions.aiModel) {
        ollamaConfig.model = aiOptions.aiModel;
      }

      if (aiOptions.aiTimeout) {
        ollamaConfig.timeout = aiOptions.aiTimeout;
      }

      console.log('[AI Reporter] Creating OllamaService with config:', ollamaConfig);
      this.ollamaService = new OllamaService(ollamaConfig);
      console.log('[AI Reporter] Checking Ollama availability...');
      const isAvailable = await this.ollamaService.checkAvailability();
      console.log('[AI Reporter] Availability check result:', isAvailable);
      if (!isAvailable) {
        console.warn('Ollama is not available. AI features will be disabled.');
        this.ollamaService = null;
      } else {
        console.log(`AI Reporter initialized with model: ${this.ollamaService.getConfig().model}`);
      }
    } catch (error) {
      console.warn('Failed to initialize Ollama:', error);
      this.ollamaService = null;
    }
  }

  subscribe() {
    console.log('[AI Reporter] Subscribe called');
    return {
      'CLONE_FOUND': (payload: IEventPayload) => {
        console.log('[AI Reporter] CLONE_FOUND event received');
        if (payload.clone) {
          // Collect clones synchronously and start AI processing in background
          this.collectClone(payload.clone);
        }
      },
    };
  }

  private collectClone(clone: IClone): void {
    // Synchronously add clone to our collection
    const enhancedClone: AIEnhancedClone = { ...clone, aiProcessed: false };
    this.clones.push(enhancedClone);
    console.log('[AI Reporter] Clone collected, total:', this.clones.length);

    // Start AI processing and track the promise
    const promise = this.processCloneWithAI(clone, enhancedClone).catch(err => {
      console.error('[AI Reporter] AI processing error:', err);
    });
    this.aiProcessingPromises.push(promise);
  }

  private async processCloneWithAI(clone: IClone, enhancedClone: AIEnhancedClone): Promise<void> {
    // Wait for initialization first - this is safe now that report() waits with deasync
    await this.initializationPromise;

    // Check if we should use AI for this clone
    if (!this.shouldUseAI(clone)) {
      console.log('[AI Reporter] Skipping AI (Ollama not available)');
      return;
    }

    try {
      let aiCallsMade = false;

      if (this.options.includeSemanticAnalysis && this.ollamaService) {
        console.log('[AI Reporter] Calling Ollama for semantic analysis...');
        const start = Date.now();
        enhancedClone.semanticAnalysis = await this.analyzeSemantics(clone);
        console.log(`[AI Reporter] Semantic analysis completed in ${Date.now() - start}ms`);
        aiCallsMade = true;
      }

      if (this.options.includeRefactoringSuggestions && this.ollamaService) {
        console.log('[AI Reporter] Calling Ollama for refactoring suggestions...');
        const start = Date.now();
        enhancedClone.refactoringSuggestion = await this.generateRefactoring(clone);
        console.log(`[AI Reporter] Refactoring suggestion completed in ${Date.now() - start}ms`);
        aiCallsMade = true;
      }

      if (this.options.includeExplanations && this.ollamaService) {
        console.log('[AI Reporter] Calling Ollama for explanation...');
        const start = Date.now();
        enhancedClone.explanation = await this.explainDuplication(clone);
        console.log(`[AI Reporter] Explanation completed in ${Date.now() - start}ms`);
        aiCallsMade = true;
      }

      if (aiCallsMade) {
        enhancedClone.aiProcessed = true;
        console.log('[AI Reporter] Clone AI-enhanced with real AI calls');
      } else {
        console.log('[AI Reporter] No AI calls made (all options false or service unavailable)');
      }
    } catch (error) {
      console.error('[AI Reporter] AI processing failed for clone:', error);
    }
  }

  private shouldUseAI(_clone: IClone): boolean {
    // Only use AI for borderline cases where traditional detection might need extra confidence
    // or for generating refactoring suggestions
    if (!this.ollamaService) {
      return false;
    }

    // Always use AI if enabled and Ollama is available
    // Future: could add logic to filter based on clone characteristics
    return true;
  }

  private async analyzeSemantics(clone: IClone): Promise<SemanticAnalysis | undefined> {
    if (!this.ollamaService || !clone.duplicationA || !clone.duplicationB) {
      return undefined;
    }

    try {
      const code1 = clone.duplicationA.fragment || '';
      const code2 = clone.duplicationB.fragment || '';
      const language = clone.format || 'unknown';

      return await this.ollamaService.analyzeSementicSimilarity(code1, code2, language);
    } catch (error) {
      console.error('Semantic analysis failed:', error);
      return undefined;
    }
  }

  private async generateRefactoring(clone: IClone): Promise<RefactoringSuggestion | undefined> {
    if (!this.ollamaService || !clone.duplicationA || !clone.duplicationB) {
      return undefined;
    }

    try {
      const duplicates = [
        {
          code: clone.duplicationA.fragment || '',
          file: clone.duplicationA.sourceId || 'unknown',
          line: clone.duplicationA.start?.line || 0,
        },
        {
          code: clone.duplicationB.fragment || '',
          file: clone.duplicationB.sourceId || 'unknown',
          line: clone.duplicationB.start?.line || 0,
        },
      ];

      const language = clone.format || 'unknown';
      return await this.ollamaService.generateRefactoringSuggestion(duplicates, language);
    } catch (error) {
      console.error('Refactoring suggestion failed:', error);
      return undefined;
    }
  }

  private async explainDuplication(clone: IClone): Promise<string | undefined> {
    if (!this.ollamaService || !clone.duplicationA) {
      return undefined;
    }

    try {
      const code = clone.duplicationA.fragment || '';
      const locations = [
        `${clone.duplicationA.sourceId}:${clone.duplicationA.start?.line}`,
        `${clone.duplicationB?.sourceId}:${clone.duplicationB?.start?.line}`,
      ];
      const language = clone.format || 'unknown';

      return await this.ollamaService.explainDuplication(code, locations, language);
    } catch (error) {
      console.error('Explanation generation failed:', error);
      return undefined;
    }
  }

  // IReporter interface implementation - generates initial report, AI processing continues async
  public report(clones: IClone[], statistic: IStatistic): void {
    console.log('[AI Reporter] report() called with', clones.length, 'clones');
    this.statistic = statistic;

    // Generate and save initial report immediately (without blocking)
    this.generateAndSaveInitialReport(statistic);

    // Start async AI processing in background
    if (this.aiProcessingPromises.length > 0) {
      console.log(`[AI Reporter] Starting background AI processing for ${this.aiProcessingPromises.length} clones...`);
      console.log('[AI Reporter] Initial report generated. AI results will be added progressively.');

      // Wait for initialization, then process all AI tasks - store the promise for waitForCompletion()
      this.completionPromise = this.initializationPromise
        .then(() => {
          console.log('[AI Reporter] Ollama initialized, processing clones with AI...');
          return this.processAllAITasks();
        })
        .catch(err => {
          console.error('[AI Reporter] Ollama initialization failed:', err);
          this.finalize();
        });
    } else {
      console.log('[AI Reporter] No AI processing needed, report complete.');
      this.completionPromise = Promise.resolve();
    }
  }

  // IReporter optional completion method - allows detector to wait for async processing
  public async waitForCompletion(): Promise<void> {
    console.log('[AI Reporter] waitForCompletion() called');
    return this.completionPromise;
  }

  private generateAndSaveInitialReport(statistic: IStatistic): void {
    try {
      console.log('[AI Reporter] Generating initial report with', this.clones.length, 'clones');
      const report = this.generateReport(statistic);

      // Save initial report
      if (this.options.output) {
        this.saveReportSync(report);
      }

      // Print initial summary
      this.printSummary(report);
    } catch (error) {
      console.error('[AI Reporter] Error generating initial report:', error);
      throw error;
    }
  }

  private async processAllAITasks(): Promise<void> {
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // Process all AI tasks and track results
    const results = await Promise.allSettled(this.aiProcessingPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        this.processedCount++;

        // Update report progressively (every few clones or when all done)
        if (index === results.length - 1 || (index + 1) % 5 === 0) {
          this.updateReportWithAIResults();
        }
      } else {
        failCount++;
        this.failedCount++;
        console.warn(`[AI Reporter] Clone #${index + 1} AI processing failed:`, result.reason);
      }
    });

    const totalTime = Date.now() - startTime;
    console.log(`[AI Reporter] AI processing completed: ${successCount} successful, ${failCount} failed in ${totalTime}ms`);

    // Final update and generate prompt
    this.finalize();
  }

  private updateReportWithAIResults(): void {
    if (!this.statistic || !this.options.output) return;

    try {
      // Re-generate report with updated AI data
      const report = this.generateReport(this.statistic);
      this.saveReportSync(report);
      console.log(`[AI Reporter] Report updated: ${this.processedCount}/${this.clones.length} clones AI-analyzed`);
    } catch (error) {
      console.error('[AI Reporter] Failed to update report:', error);
    }
  }

  private finalize(): void {
    if (!this.statistic) return;

    console.log('[AI Reporter] Finalizing report...');

    // Check failure rate
    const failureRate = this.failedCount / this.clones.length;
    if (failureRate > 0.5) {
      console.warn('[AI Reporter] High failure rate (>50%), skipping AI-enhanced features');
      return;
    }

    // Generate final report
    const report = this.generateReport(this.statistic);
    if (this.options.output) {
      this.saveReportSync(report);
    }

    // Generate AI prompt markdown if we have AI results
    if (this.processedCount > 0 && this.options.output) {
      this.generateAIPrompt(report);
    }

    console.log('[AI Reporter] Report finalized with', this.processedCount, 'AI-analyzed clones');
  }

  private generateAIPrompt(report: AIReport): void {
    try {
      const { PromptGenerator } = require('./prompt-generator');
      const outputDir = this.options.output ? require('path').dirname(this.options.output) : '.';
      const promptPath = require('path').join(outputDir, 'refactoring-guide.md');

      const generator = new PromptGenerator({
        outputPath: promptPath,
        projectName: 'Project',
        language: report.clones[0]?.format || 'code',
      });

      generator.writePrompt(report);
      console.log('[AI Reporter] AI refactoring guide generated:', promptPath);
    } catch (error) {
      console.error('[AI Reporter] Failed to generate AI prompt:', error);
    }
  }

  private generateReport(statistic: IStatistic): AIReport {
    const aiAnalyzedClones = this.clones.filter(c => c.aiProcessed).length;

    const refactoringSummary = this.calculateRefactoringSummary();

    const recommendations = this.generateRecommendations(statistic, refactoringSummary);

    return {
      summary: {
        totalClones: this.clones.length,
        totalFiles: statistic.formats ? Object.keys(statistic.formats).length : 0,
        totalLines: statistic.total?.lines || 0,
        duplicatePercentage: statistic.total?.percentage || 0,
        aiAnalyzedClones,
      },
      clones: this.clones,
      refactoringSummary,
      recommendations,
      generatedAt: new Date().toISOString(),
      ollamaModel: this.ollamaService?.getConfig().model,
    };
  }

  private calculateRefactoringSummary() {
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;

    this.clones.forEach(clone => {
      if (clone.refactoringSuggestion) {
        const potential = clone.refactoringSuggestion.type;
        if (potential === 'extract-function' || potential === 'extract-class') {
          highPriority++;
        } else if (potential === 'create-module') {
          mediumPriority++;
        } else {
          lowPriority++;
        }
      }
    });

    return {
      highPriority,
      mediumPriority,
      lowPriority,
      totalSuggestions: highPriority + mediumPriority + lowPriority,
    };
  }

  private generateRecommendations(statistic: IStatistic, refactoringSummary: any): string[] {
    const recommendations: string[] = [];

    if (statistic.total?.percentage && statistic.total.percentage > 10) {
      recommendations.push(
        `High duplication detected (${statistic.total.percentage.toFixed(1)}%). Consider refactoring.`
      );
    }

    if (refactoringSummary.highPriority > 0) {
      recommendations.push(
        `${refactoringSummary.highPriority} high-priority refactoring opportunities identified.`
      );
    }

    if (refactoringSummary.totalSuggestions > 5) {
      recommendations.push(
        'Multiple refactoring opportunities detected. Consider addressing them incrementally.'
      );
    }

    if (!this.ollamaService) {
      recommendations.push(
        'Install Ollama and enable AI features for advanced analysis and refactoring suggestions.'
      );
    }

    return recommendations;
  }

  private saveReportSync(report: AIReport): void {
    let outputPath = this.options.output || '.';

    // If output is a directory, append the filename
    if (!outputPath.endsWith('.json') && !outputPath.endsWith('.md')) {
      ensureDirSync(outputPath);
      outputPath = `${outputPath}/jscpd-ai-report.json`;
    }

    try {
      if (this.options.format === 'json') {
        writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`\nAI report saved to: ${outputPath}`);
      } else if (this.options.format === 'markdown') {
        const markdown = this.generateMarkdownReport(report);
        const mdPath = outputPath.replace('.json', '.md');
        writeFileSync(mdPath, markdown);
        console.log(`\nAI report saved to: ${mdPath}`);
      }
    } catch (error) {
      console.error('[AI Reporter] Failed to save report:', error);
    }
  }

  private generateMarkdownReport(report: AIReport): string {
    let markdown = `# JSCPD-AI Code Duplication Report\n\n`;
    markdown += `Generated: ${report.generatedAt}\n`;
    if (report.ollamaModel) {
      markdown += `AI Model: ${report.ollamaModel}\n`;
    }
    markdown += `\n## Summary\n\n`;
    markdown += `- Total Clones: ${report.summary.totalClones}\n`;
    markdown += `- Total Files: ${report.summary.totalFiles}\n`;
    markdown += `- Duplicate Percentage: ${report.summary.duplicatePercentage.toFixed(2)}%\n`;
    markdown += `- AI-Analyzed Clones: ${report.summary.aiAnalyzedClones}\n`;

    if (report.refactoringSummary) {
      markdown += `\n## Refactoring Summary\n\n`;
      markdown += `- High Priority: ${report.refactoringSummary.highPriority}\n`;
      markdown += `- Medium Priority: ${report.refactoringSummary.mediumPriority}\n`;
      markdown += `- Low Priority: ${report.refactoringSummary.lowPriority}\n`;
    }

    if (report.recommendations.length > 0) {
      markdown += `\n## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    markdown += `\n## Detailed Clones\n\n`;
    report.clones.forEach((clone, index) => {
      const linesCount = clone.duplicationA?.end?.line && clone.duplicationA?.start?.line
        ? clone.duplicationA.end.line - clone.duplicationA.start.line + 1
        : 0;
      markdown += `### Clone ${index + 1}\n\n`;
      markdown += `- Format: ${clone.format}\n`;
      markdown += `- Lines: ${linesCount}\n`;

      if (clone.semanticAnalysis) {
        markdown += `\n**AI Analysis:**\n`;
        markdown += `- Similarity Score: ${clone.semanticAnalysis.similarityScore}/100\n`;
        markdown += `- Confidence: ${(clone.semanticAnalysis.confidence * 100).toFixed(0)}%\n`;
        markdown += `- Functionally Equivalent: ${clone.semanticAnalysis.functionallyEquivalent ? 'Yes' : 'No'}\n`;
        markdown += `- Reasoning: ${clone.semanticAnalysis.reasoning}\n`;
      }

      if (clone.refactoringSuggestion) {
        markdown += `\n**Refactoring Suggestion:**\n`;
        markdown += `- Type: ${clone.refactoringSuggestion.type}\n`;
        markdown += `- Confidence: ${(clone.refactoringSuggestion.confidence * 100).toFixed(0)}%\n`;
        markdown += `- Description: ${clone.refactoringSuggestion.description}\n`;
        markdown += `- Reasoning: ${clone.refactoringSuggestion.reasoning}\n`;
      }

      markdown += `\n---\n\n`;
    });

    return markdown;
  }

  private printSummary(report: AIReport): void {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║        JSCPD-AI Report Summary                 ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║ Total Clones: ${String(report.summary.totalClones).padEnd(33)}║`);
    console.log(`║ Duplicate %:  ${String(report.summary.duplicatePercentage.toFixed(2) + '%').padEnd(33)}║`);
    console.log(`║ AI Analyzed:  ${String(report.summary.aiAnalyzedClones).padEnd(33)}║`);

    if (report.refactoringSummary && report.refactoringSummary.totalSuggestions > 0) {
      console.log('╠════════════════════════════════════════════════╣');
      console.log(`║ High Priority Refactoring: ${String(report.refactoringSummary.highPriority).padEnd(19)}║`);
      console.log(`║ Medium Priority:           ${String(report.refactoringSummary.mediumPriority).padEnd(19)}║`);
      console.log(`║ Low Priority:              ${String(report.refactoringSummary.lowPriority).padEnd(19)}║`);
    }

    console.log('╚════════════════════════════════════════════════╝');

    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
  }
}

export default AIReporter;
