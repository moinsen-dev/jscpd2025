import {IClone, IStatistic} from '@jscpd-ai/core';

export interface IReporter {
	report(clones: IClone[], statistic: IStatistic | undefined): void;
	/**
	 * Optional method that returns a promise which resolves when all async reporter work is complete.
	 * Used by reporters that perform background processing (e.g., AI analysis).
	 */
	waitForCompletion?(): Promise<void>;
}
