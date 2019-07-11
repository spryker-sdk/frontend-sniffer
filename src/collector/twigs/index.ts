import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { parseTwig, IParsedTwig } from './parser';
import { getTwig, ITwig } from './twig';
import { printParsedViewLog } from './log';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';

type TMergeMapResult = [TLevelRestriction, IParsedTwig[]];
export interface IParsedTwigResult { [key: string]: IParsedTwig[] }

const debugTwig = createDebugger<ITwig>('Collecting twigs', 'namespace', 'module', 'type', 'name');
const logCollection = (level: string) => createLogger<IParsedTwig[]>(`${level} twigs:`, 'length');
const scanForTwigs = (configSettings: IScanSettings) => (): Observable<string> => scan(configSettings);
const scanForTwigsCollection = [
    {
        scanFunction: scanForTwigs(config.settings.core.scan.twigs),
        scanMessage: logCollection('Core'),
        scanLevel: coreLevel
    },
    {
        scanFunction: scanForTwigs(config.settings.project.scan.twigs),
        scanMessage: logCollection('Project'),
        scanLevel: projectLevel
    }
];

const restrictedScanForTwigsCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForTwigsCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForTwigsCollection)
);

const limitedScanForFilesCollection = scanForTwigs => iif(
    () => environment.isOnly,
    scanForTwigs.scanFunction().pipe(take(environment.only)),
    scanForTwigs.scanFunction()
);

export const getObservable = (): Observable<IParsedTwigResult> => restrictedScanForTwigsCollection.pipe(
    mergeMap(scanForTwigs =>
            limitedScanForFilesCollection(scanForTwigs).pipe(
                map(getTwig),
                tap(debugTwig),
                flatMap(parseTwig),
                tap(printParsedViewLog),
                toArray<IParsedTwig>(),
                tap(scanForTwigs.scanMessage)
            ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult],
    ),
    scanRx((accumulator: IParsedTwigResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
