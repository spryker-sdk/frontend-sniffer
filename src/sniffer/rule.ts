import { TestOutcome } from './test-outcome';
import { ICollectorOutput } from '../collector';

export interface IRule {
    name: string
    test: TRuleTest
}

export type TRuleTest = (data: ICollectorOutput) => Promise<TestOutcome>

export const loadRule = (path: string): IRule => <IRule>require(path)
export const createRuleTester = (output: ICollectorOutput) => async (rule: IRule): Promise<TestOutcome> => rule.test(output)
