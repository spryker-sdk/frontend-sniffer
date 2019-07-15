import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { getFile, IFile } from '../file';
import { parseTemplates, IParsedTemplates } from './parser';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';
import {printParsedFileLog} from "../log";

type TMergeMapResult = [TLevelRestriction, IParsedTemplates[]];
export interface IParsedTemplatesResult { [key: string]: IParsedTemplates[] }

const debugTemplates = createDebugger<IFile>('Collecting twigs', 'namespace', 'module', 'type', 'name');
const logCollection = (level: string) => createLogger<IParsedTemplates[]>(`${level} Templates:`, 'length');
const scanForTemplates = (configSettings: IScanSettings) => (): Observable<string> => scan(configSettings);
const scanForTemplatesCollection = [
    {
        scanFunction: scanForTemplates(config.settings.core.scan.templates),
        scanMessage: logCollection('Core'),
        scanLevel: coreLevel
    },
    {
        scanFunction: scanForTemplates(config.settings.project.scan.templates),
        scanMessage: logCollection('Project'),
        scanLevel: projectLevel
    }
];

const restrictedScanForTwigsCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForTemplatesCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForTemplatesCollection)
);

const limitedScanForFilesCollection = scanForTemplates => iif(
    () => environment.isOnly,
    scanForTemplates.scanFunction().pipe(take(environment.only)),
    scanForTemplates.scanFunction()
);

export const getObservable = (): Observable<IParsedTemplatesResult> => restrictedScanForTwigsCollection.pipe(
    mergeMap(scanForTemplates =>
        limitedScanForFilesCollection(scanForTemplates).pipe(
            map(getFile),
            tap(debugTemplates),
            flatMap(parseTemplates),
            tap(printParsedFileLog),
            toArray<IParsedTemplates>(),
            tap(scanForTemplates.scanMessage)
        ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult],
    ),
    scanRx((accumulator: IParsedTemplatesResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
