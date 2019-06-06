import { iif } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import { parseReadme, parseDeprecated, parseTwig, parseSass, parseTypescript, IParsedComponent } from './parser';
import { getComponent, IComponent } from './component';
import { printParsedComponentLog } from './log';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { createDebugger, createLogger } from '../../shared/log';
import { get as environment } from '../../environment';

const { dirs, patterns, options } = settings.core.components;
const scanForComponents = scan(dirs, patterns, options);
const debugComponent = createDebugger<IComponent>('Collecting component', 'namespace', 'module', 'type', 'name');
const logCollection = createLogger<IParsedComponent[]>('Components:', 'length');

export default iif(
    () => !!environment().takeOnly,
    scanForComponents.pipe(take(environment().takeOnly)),
    scanForComponents
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
