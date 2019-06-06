import { iif } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile, IFile } from '../shared/file';
import { parseTypescript, IApplicationFile } from './parser';
import { printParsedFileLog } from '../shared/log';
import { createDebugger, createLogger } from '../../shared/log';
import { get as environment } from '../../environment';

const { dirs, patterns, options } = settings.core.global.application;
const scanForApplicationFiles = scan(dirs, patterns, options);
const debugFile = createDebugger<IFile>('Collecting application file', 'name');
const logCollection = createLogger<IApplicationFile[]>('Application files:', 'length');

export default iif(
    () => !!environment().takeOnly,
    scanForApplicationFiles.pipe(take(environment().takeOnly)),
    scanForApplicationFiles
).pipe(
    map(getFile),
    tap(debugFile),
    flatMap(parseTypescript),
    tap(printParsedFileLog),
    toArray<IApplicationFile>(),
    tap(logCollection)
)
