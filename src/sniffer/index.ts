import { map, concatMap, flatMap, toArray, single, tap } from 'rxjs/operators';
import { createRuleTester, loadRule } from './rule';
import { printHeading, printRuleOutcome, printEvaluation } from './log';
import { getObservable as getCollectorObservable, parseCollectorObservableOutput, ICollectorOutput } from '../collector';
import settings from '../settings';
import { scan } from '../shared/scanner';
import { TestOutcome } from './test-outcome';
import { performEvaluation, IEvaluation } from './evaluator';
import { Observable } from 'rxjs';

const { dirs, patterns, options } = settings.sniffer.rules;

export const getObservable = (): Observable<IEvaluation> => getCollectorObservable().pipe(
    map(parseCollectorObservableOutput),
    tap(printHeading),
    concatMap((output: ICollectorOutput) => scan(dirs, patterns, options).pipe(
        map(loadRule),
        flatMap(createRuleTester(output))
    )),
    tap(printRuleOutcome),
    toArray<TestOutcome>(),
    map(performEvaluation),
    tap(printEvaluation),
    single()
)

export default (): Promise<IEvaluation> => new Promise<IEvaluation>((resolve) => getObservable().subscribe(resolve))
