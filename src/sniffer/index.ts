import { map, concatMap, flatMap, toArray, single, tap, filter } from 'rxjs/operators';
import { createRuleTester, loadRule, IRule } from './rule';
import { printRuleOutcome, printEvaluation } from './log';
import { collect, ICollectorOutput } from '../collector';
import { config } from './config';
import { scan } from '../scanner';
import { TestOutcome } from './test-outcome';
import { performEvaluation, IEvaluation } from './evaluator';
import { Observable, from } from 'rxjs';
import { info, createDebugger, warn } from '../log';

const debugRule = createDebugger<IRule>('Loading rule', 'name');

export const isEnabled = (rule: IRule): boolean => {
    const enabled = config.settings.enabledRules.includes(rule.name);

    if (!enabled) {
        warn.print('Rule', rule.name, 'disabled');
    }

    return enabled;
}

function testRules(output: ICollectorOutput): Observable<TestOutcome> {
    info.print('\nRunning sniffer...');
    config.load();

    return scan(config.settings.scan).pipe(
        map(loadRule),
        tap(debugRule),
        filter(isEnabled),
        flatMap(createRuleTester(output))
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
