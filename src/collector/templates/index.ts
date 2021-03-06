import { iif, Observable, from } from 'rxjs';
import { map, flatMap, toArray, tap, take, mergeMap, scan as scanRx, filter } from 'rxjs/operators';
import { getTemplate, ITemplate } from './template';
import { parseSass, parseTwig, IParsedTemplates } from './parser';
import { config } from '../config';
import { IScanSettings, scan } from '../../scanner';
import { createDebugger, createLogger } from '../../logger';
import { environment, coreLevel, projectLevel, TLevelRestriction } from '../../environment';
import { printParsedTemplateLog } from './log';
import {getView} from "../views/view";

type TMergeMapResult = [TLevelRestriction, IParsedTemplates[]];
export interface IParsedTemplatesResult { [key: string]: IParsedTemplates[] }

const debugTemplates = createDebugger<ITemplate>('Collecting template', 'namespace', 'module', 'type', 'name');
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

const restrictedScanForTemplatesCollection = iif(
    () => environment.isAllowedLevel,
    from(scanForTemplatesCollection).pipe(filter(item => item.scanLevel === environment.levelRestriction)),
    from(scanForTemplatesCollection)
);

const limitedScanForFilesCollection = scanForTemplates => iif(
    () => environment.isOnly,
    scanForTemplates.scanFunction().pipe(take(environment.only)),
    scanForTemplates.scanFunction()
);

export const getObservable = (): Observable<IParsedTemplatesResult> => restrictedScanForTemplatesCollection.pipe(
    mergeMap(scanForTemplates =>
        limitedScanForFilesCollection(scanForTemplates).pipe(
            map((path: string) => getTemplate(scanForTemplates.scanLevel, path)),
            tap(debugTemplates),
            flatMap(parseTwig),
            flatMap(parseSass),
            tap(printParsedTemplateLog),
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
