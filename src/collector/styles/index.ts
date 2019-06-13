import { iif, Observable } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import { config } from '../config';
import { scan } from '../../scanner';
import { getFile, IFile } from '../file';
import { parseSass, IStyleFile } from './parser';
import { printParsedFileLog } from '../log';
import { createDebugger, createLogger } from '../../logger';
import { environment } from '../../environment';

const debugFile = createDebugger<IFile>('Collecting style', 'name');
const logCollection = createLogger<IStyleFile[]>('Styles:', 'length');
const scanForFiles = (): Observable<string> => scan(config.settings.core.scan.styles)

export const getObservable = (): Observable<IStyleFile[]> => iif(
    () => environment.isOnly,
    scanForFiles().pipe(take(environment.only)),
    scanForFiles()
).pipe(
    map(getFile),
    tap(debugFile),
    flatMap(parseSass),
    tap(printParsedFileLog),
    toArray<IStyleFile>(),
    tap(logCollection)
)
