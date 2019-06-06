import { TestOutcome } from './test-outcome';
import { log, info, success, warn, error } from '../shared/log';
import { IEvaluation } from './evaluator';
import { bold } from 'colors';

export const printHeading = (): void => info.print('\nRunning sniffer...')

export function printRuleOutcome(outcome: TestOutcome): TestOutcome {
    log.print(`Rule ${outcome.name} ${bold(outcome.result)}`);
    outcome.logs.forEach((message: string) => log.print(message));
    outcome.warnings.forEach((message: string) => warn.print(message));
    outcome.errors.forEach((message: string) => error.print(message));
    return outcome;
}

export function printEvaluation(evaluation: IEvaluation): IEvaluation {
    if (evaluation.isPassed) {
        success.print(`\nAll ${evaluation.totalTestsCount} tests passed. Good job! :)`);
        return evaluation;
    }

    error.print(`\n${evaluation.failedTestsCount}/${evaluation.totalTestsCount} tests failed. :(`)
    return evaluation;
}
