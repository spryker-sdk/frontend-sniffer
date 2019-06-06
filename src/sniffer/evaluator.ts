import { TestOutcome } from './test-outcome';

export interface IEvaluation {
    totalTestsCount: number
    validTestsCount: number
    failedTestsCount: number
    isPassed: boolean
}

export function performEvaluation(outcomes: TestOutcome[]): IEvaluation {
    const totalTestsCount = outcomes.length;
    const failedTests = outcomes.filter((outcome: TestOutcome) => !outcome.isValid);
    const failedTestsCount = failedTests.length;

    return {
        totalTestsCount,
        validTestsCount: totalTestsCount - failedTestsCount,
        failedTestsCount,
        isPassed: failedTestsCount === 0
    }
}
