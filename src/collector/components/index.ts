import { iif, Observable } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import { parseReadme, parseDeprecated, parseTwig, parseSass, parseTypescript, IParsedComponent } from './parser';
import { getComponent, IComponent } from './component';
import { printParsedComponentLog } from './log';
import { config } from '../config';
import { scan } from '../../scanner';
import { createDebugger, createLogger } from '../../log';
import { environment } from '../../environment';

const debugComponent = createDebugger<IComponent>('Collecting component', 'namespace', 'module', 'type', 'name');
const logCollection = createLogger<IParsedComponent[]>('Components:', 'length');
const scanForComponents = (): Observable<string> => scan(config.settings.core.scan.components);

export const getObservable = (): Observable<IParsedComponent[]> => iif(
    () => environment.isCollectOnly,
    scanForComponents().pipe(take(environment.collectOnly)),
    scanForComponents()
).pipe(
    map(getComponent),
    tap(debugComponent),
    flatMap(parseReadme),
    flatMap(parseDeprecated),
    flatMap(parseTwig),
    flatMap(parseSass),
    flatMap(parseTypescript),
    tap(printParsedComponentLog),
    toArray<IParsedComponent>()
).pipe(
    tap(logCollection)
)
