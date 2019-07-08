import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { parseTwig, IParsedView } from './parser';
import { getView, IView } from './view';
import { printParsedViewLog } from './log';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';

type TMergeMapResult = [TLevelRestriction, IParsedView[]];
export interface IParsedViewResult { [key: string]: IParsedView[] }

const debugView = createDebugger<IView>('Collecting view', 'namespace', 'module', 'type', 'name');
const logCollection = (level: string) => createLogger<IParsedView[]>(`${level} Components:`, 'length');
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

export const getObservable = (): Observable<IParsedViewResult> => restrictedScanForViewsCollection.pipe(
    mergeMap(scanForViews =>
            limitedScanForFilesCollection(scanForViews).pipe(
                map(getView),
                tap(debugView),
                flatMap(parseTwig),
                tap(printParsedViewLog),
                toArray<IParsedView>(),
                tap(scanForViews.scanMessage)
            ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult],
    ),
    scanRx((accumulator: IParsedViewResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
