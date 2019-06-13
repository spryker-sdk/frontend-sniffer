import { TestOutcome } from './test-outcome';
import { ICollectorOutput } from '../collector';
import { config } from './config';
import { debug } from '../logger';

export abstract class Rule {
    readonly outcome: TestOutcome

    constructor() {
        this.outcome = new TestOutcome(this.getName());
    }

    get isSkipped(): boolean {
        return config.settings.enable.includes(this.getName());
    }

    abstract getName(): string
    abstract test(data: ICollectorOutput): void
}

export function loadRule(path: string): Rule {
    const LoadedRule = require(path);
    return new LoadedRule();
}

export const ruleIsEnabled = (rule: Rule): boolean => {
    if (rule.isSkipped) {
        return true;
    }

    debug.print('Rule', rule.getName(), 'not enabled');
    return false;
}

export const runRuleTest = (output: ICollectorOutput) => async (rule: Rule): Promise<TestOutcome> => {
    rule.test(output);
    return rule.outcome;
}
