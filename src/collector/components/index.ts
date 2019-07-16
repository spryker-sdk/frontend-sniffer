import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { parseReadme, parseDeprecated, parseTwig, parseSass, parseTypescript, IParsedComponent } from './parser';
import { getComponent, IComponent } from './component';
import { printParsedComponentLog } from './log';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';

type TMergeMapResult = [TLevelRestriction, IParsedComponent[]];
export interface IParsedComponentResult { [key: string]: IParsedComponent[] }

const debugComponent = createDebugger<IComponent>('Collecting component', 'namespace', 'module', 'type', 'name');
const logCollection = (level: string) => createLogger<IParsedComponent[]>(`${level} Components:`, 'length');
const scanForComponents = (configSettings: IScanSettings) => (): Observable<string> => scan(configSettings);
const scanForComponentsCollection = [
    {
        scanFunction: scanForComponents(config.settings.core.scan.components),
        scanMessage: logCollection('Core'),
        scanLevel: coreLevel
    },
    {
        scanFunction: scanForComponents(config.settings.project.scan.components),
        scanMessage: logCollection('Project'),
        scanLevel: projectLevel
    }
];

const restrictedScanForComponentsCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForComponentsCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForComponentsCollection)
);

const limitedScanForFilesCollection = scanForComponents => iif(
    () => environment.isOnly,
    scanForComponents.scanFunction().pipe(take(environment.only)),
    scanForComponents.scanFunction()
);

export const getObservable = (): Observable<IParsedComponentResult> => restrictedScanForComponentsCollection.pipe(
    mergeMap(scanForComponents =>
        limitedScanForFilesCollection(scanForComponents).pipe(
            map(getComponent(scanForComponents.scanLevel)),
            tap(debugComponent),
            flatMap(parseReadme),
            flatMap(parseDeprecated),
            flatMap(parseTwig),
            flatMap(parseSass),
            flatMap(parseTypescript),
            tap(printParsedComponentLog),
            toArray<IParsedComponent>(),
            tap(scanForComponents.scanMessage)
        ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult],
    ),
    scanRx((accumulator: IParsedComponentResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
