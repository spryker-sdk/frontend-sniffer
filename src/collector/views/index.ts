import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { getView, IView } from './view';
import { parseTwig, IParsedViews } from './parser';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';
import { printParsedTemplateLog } from './log';

type TMergeMapResult = [TLevelRestriction, IParsedViews[]];
export interface IParsedViewsResult { [key: string]: IParsedViews[] }

const debugViews = createDebugger<IView>('Collecting view', 'namespace', 'module', 'type', 'name');
const logCollection = (level: string) => createLogger<IParsedViews[]>(`${level} Views:`, 'length');
const scanForViews = (configSettings: IScanSettings) => (): Observable<string> => scan(configSettings);
const scanForViewsCollection = [
    {
        scanFunction: scanForViews(config.settings.core.scan.views),
        scanMessage: logCollection('Core'),
        scanLevel: coreLevel
    },
    {
        scanFunction: scanForViews(config.settings.project.scan.views),
        scanMessage: logCollection('Project'),
        scanLevel: projectLevel
    }
];

const restrictedScanForViewsCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForViewsCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForViewsCollection)
);

const limitedScanForFilesCollection = scanForViews => iif(
    () => environment.isOnly,
    scanForViews.scanFunction().pipe(take(environment.only)),
    scanForViews.scanFunction()
);

export const getObservable = (): Observable<IParsedViewsResult> => restrictedScanForViewsCollection.pipe(
    mergeMap(scanForViews =>
        limitedScanForFilesCollection(scanForViews).pipe(
            map(getView),
            tap(debugViews),
            flatMap(parseTwig),
            tap(printParsedTemplateLog),
            toArray<IParsedViews>(),
            tap(scanForViews.scanMessage)
        ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult],
    ),
    scanRx((accumulator: IParsedViewsResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
