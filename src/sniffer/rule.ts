import { TestOutcome } from './test-outcome';
import { ICollectorOutput } from '../collector';
import { config } from './config';
import { debug } from '../logger';
import { IParsedModules, TModulePart } from '../collector/wrappers';

export abstract class Rule {
    readonly outcome: TestOutcome;

    constructor() {
        this.outcome = new TestOutcome(this.getName());
        this.filterModulesData = this.filterModulesData.bind(this);
    }

    protected isSnifferDisabled(disabledSnifferRules: string[]): boolean {
        const disableAllRules = 'all';

        return Array.isArray(disabledSnifferRules) && (disabledSnifferRules.includes(disableAllRules) ||
            disabledSnifferRules.includes(this.getName()));
    };

    protected parseOutputFieldHelper(data: IParsedModules): TModulePart {
        const stack = [...Object.values(data)];
        const collectionOfFiles = [];

        while (stack.length) {
            const stackElement = stack.shift();

            if (Array.isArray(stackElement)) {
                collectionOfFiles.push(stackElement);
            }

            if (!Array.isArray(stackElement)) {
                stack.push(...Object.values(stackElement));
            }
        }

        return collectionOfFiles.reduce((accumulator, current) => [...accumulator, ...current],[]);
    };

    protected filterModulesData(data: ICollectorOutput, fileType: string): TModulePart {
        return this.parseOutputFieldHelper(data.modules)
            .filter(module => module.files[fileType] && module.files[fileType]['exists'])
            .filter(module => !this.isSnifferDisabled(module.files[fileType].disabledSnifferRules));
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
