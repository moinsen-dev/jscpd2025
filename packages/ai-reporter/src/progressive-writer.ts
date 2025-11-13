/**
 * Progressive Writer for AI Reporter
 * Manages incremental JSON file updates as AI results come in
 */

import { writeFileSync, readFileSync, existsSync } from 'fs-extra';
import { join, dirname } from 'path';
import { AIReport } from './index';

export interface ProgressiveWriterOptions {
  outputPath: string;
  updateInterval?: number; // Minimum ms between writes (debounce)
}

export class ProgressiveWriter {
  private outputPath: string;
  private updateInterval: number;
  private lastUpdate: number = 0;
  private pendingUpdate: NodeJS.Timeout | null = null;

  constructor(options: ProgressiveWriterOptions) {
    this.outputPath = options.outputPath;
    this.updateInterval = options.updateInterval || 1000; // Default 1 second debounce
  }

  /**
   * Writes the initial report immediately
   */
  public writeInitial(report: AIReport): void {
    console.log('[Progressive Writer] Writing initial report to:', this.outputPath);
    this.writeReportSync(report);
    this.lastUpdate = Date.now();
  }

  /**
   * Updates the report incrementally (debounced)
   */
  public updateReport(updater: (report: AIReport) => void): void {
    // Cancel any pending update
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
    }

    // Schedule update after debounce period
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdate;
    const delay = Math.max(0, this.updateInterval - timeSinceLastUpdate);

    this.pendingUpdate = setTimeout(() => {
      this.performUpdate(updater);
      this.pendingUpdate = null;
    }, delay);
  }

  /**
   * Flushes any pending updates immediately
   */
  public flush(updater?: (report: AIReport) => void): void {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
      this.pendingUpdate = null;
    }

    if (updater) {
      this.performUpdate(updater);
    }
  }

  private performUpdate(updater: (report: AIReport) => void): void {
    try {
      // Read current report
      if (!existsSync(this.outputPath)) {
        console.warn('[Progressive Writer] Report file not found, skipping update');
        return;
      }

      const content = readFileSync(this.outputPath, 'utf-8');
      const report: AIReport = JSON.parse(content);

      // Apply updates
      updater(report);

      // Write back atomically
      console.log('[Progressive Writer] Updating report with new AI results');
      this.writeReportSync(report);
      this.lastUpdate = Date.now();
    } catch (error) {
      console.error('[Progressive Writer] Failed to update report:', error);
    }
  }

  private writeReportSync(report: AIReport): void {
    try {
      const dir = dirname(this.outputPath);
      const { ensureDirSync } = require('fs-extra');
      ensureDirSync(dir);

      // Write with pretty formatting
      const json = JSON.stringify(report, null, 2);
      writeFileSync(this.outputPath, json, 'utf-8');
    } catch (error) {
      console.error('[Progressive Writer] Failed to write report:', error);
      throw error;
    }
  }
}
