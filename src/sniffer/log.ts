import { TestOutcome, TestResult } from './test-outcome';
import { log, success, warn, error } from '../logger';
import { IEvaluation } from './evaluator';

const resultLogMap = {
    [TestResult.SUCCEDED]: success,
    [TestResult.SUCCEDED_WITH_WARNINGS]: warn,
    [TestResult.FAILED]: error
}

export function printRuleOutcome(outcome: TestOutcome): TestOutcome {
    resultLogMap[outcome.result].print(`Rule ${outcome.name} ${outcome.result}`);
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
