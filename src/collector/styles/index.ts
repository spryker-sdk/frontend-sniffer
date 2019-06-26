import {iif, Observable, from} from 'rxjs';
import {map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter} from 'rxjs/operators';
import {config} from '../config';
import {IScanSettings, scan} from '../../scanner';
import {getFile, IFile} from '../file';
import {parseSass, IStyleFile} from './parser';
import {printParsedFileLog} from '../log';
import {createDebugger, createLogger} from '../../logger';
import {environment} from '../../environment';

type TMergeMapResult = [string, IStyleFile[]];
export interface IStyleFilesResult { [key: string]: IStyleFile[] }

const debugFile = createDebugger<IFile>('Collecting style', 'name');
const logCollection = (level: string) => createLogger<IStyleFile[]>(`${level} Styles:`, 'length');
const scanForFiles = (configSettings: IScanSettings) => (): Observable<string> => scan(configSettings);
const scanForFilesCollection = [
    {
        scanFunction: scanForFiles(config.settings.core.scan.styles),
        scanMessage: logCollection('Vendor'),
        scanLevel: 'vendor'
    },
    {
        scanFunction: scanForFiles(config.settings.project.scan.styles),
        scanMessage: logCollection('Project'),
        scanLevel: 'project'
    }
];

const restrictedScanForFilesCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForFilesCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForFilesCollection)
);

const limitedScanForFilesCollection = (scanForFiles) => iif(
    () => environment.isOnly,
    scanForFiles.scanFunction().pipe(take(environment.only)),
    scanForFiles.scanFunction()
);

export const getObservable = (): Observable<IStyleFilesResult> => restrictedScanForFilesCollection.pipe(
    mergeMap(scanForFiles =>
        limitedScanForFilesCollection(scanForFiles).pipe(
            map(getFile),
            tap(debugFile),
            flatMap(parseSass),
            tap(printParsedFileLog),
            toArray<IStyleFile>(),
            tap(scanForFiles.scanMessage)
        ),
        (collectionItem, collectionResult) => [collectionItem.scanLevel, collectionResult]
    ),
    scanRx((accumulator: IStyleFilesResult, current: TMergeMapResult) => {
        accumulator[current[0]] = current[1];

        return accumulator;
    }, {})
);
