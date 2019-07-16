import { map, concatMap, flatMap, toArray, single, tap, filter } from 'rxjs/operators';
import { runRuleTest, loadRule, ruleIsEnabled, Rule } from './rule';
import { printRuleOutcome, printEvaluation } from './log';
import { collect, ICollectorOutput, TCollectorObjectFields } from '../collector';
import { config } from './config';
import { scan } from '../scanner';
import { TestOutcome } from './test-outcome';
import { performEvaluation, IEvaluation } from './evaluator';
import { Observable, from } from 'rxjs';
import { info, createDebugger, warn } from '../logger';

const debugRule = createDebugger<Rule>('Loading rule', 'name');
export const parseOutputFieldHelper = (field: TCollectorObjectFields) =>
    Object.values(field).reduce((accumulator, item) => {
        const currentItem = !Array.isArray(item) ? parseOutputFieldHelper(item) : item;

        return [...accumulator, ...currentItem];
    }, []);

function testRules(output: ICollectorOutput): Observable<TestOutcome> {
    info.print('\nRunning sniffer...');

    return scan(config.settings.scan).pipe(
        map(loadRule),
        filter(ruleIsEnabled),
        tap(debugRule),
        flatMap(runRuleTest(output))
    )
}

export const sniff = (): Promise<IEvaluation> => new Promise<IEvaluation>((resolve) => from(collect()).pipe(
    concatMap(testRules),
    tap(printRuleOutcome),
    toArray<TestOutcome>(),
    map(performEvaluation),
    tap(printEvaluation),
    single()
).subscribe(resolve))
