import { iif, Observable } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import { config } from '../config';
import { scan } from '../../scanner';
import { getFile, IFile } from '../file';
import { parseTypescript, IApplicationFile } from './parser';
import { printParsedFileLog } from '../log';
import { createDebugger, createLogger } from '../../logger';
import { environment } from '../../environment';

const debugFile = createDebugger<IFile>('Collecting application file', 'name');
const logCollection = createLogger<IApplicationFile[]>('Application files:', 'length');
const scanForApplicationFiles = (): Observable<string> => scan(config.settings.core.scan.application);

export const getObservable = (): Observable<IApplicationFile[]> => iif(
    () => environment.isOnly,
    scanForApplicationFiles().pipe(take(environment.only)),
    scanForApplicationFiles()
).pipe(
    map(getFile),
    tap(debugFile),
    flatMap(parseTypescript),
    tap(printParsedFileLog),
    toArray<IApplicationFile>(),
    tap(logCollection)
)
