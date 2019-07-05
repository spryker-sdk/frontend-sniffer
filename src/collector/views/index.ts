import { iif, Observable } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import { parseTwig, IParsedView } from './parser';
import { getView, IView } from './view';
import { printParsedViewLog } from './log';
import { config } from '../config';
import { scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment } from '../../environment';

const debugView = createDebugger<IView>('Collecting view', 'namespace', 'module', 'name');
const logCollection = createLogger<IParsedView[]>('Views:', 'length');
const scanForViews = (): Observable<string> => scan(config.settings.core.scan.views);

export const getObservable = (): Observable<IParsedView[]> => iif(
    () => environment.isOnly,
    scanForViews().pipe(take(environment.only)),
    scanForViews()
).pipe(
    map(getView),
    tap(debugView),
    flatMap(parseTwig),
    tap(printParsedViewLog),
    toArray<IParsedView>()
).pipe(
    tap(logCollection)
)
