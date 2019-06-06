import { iif } from 'rxjs';
import { map, flatMap, toArray, tap, take } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile, IFile } from '../shared/file';
import { parseSass, IStyleFile } from './parser';
import { printParsedFileLog } from '../shared/log';
import { createDebugger, createLogger } from '../../shared/log';
import { get as environment } from '../../environment';

const { dirs, patterns, options } = settings.core.global.styles;
const scanForStyles = scan(dirs, patterns, options);
const debugFile = createDebugger<IFile>('Collecting style', 'name');
const logCollection = createLogger<IStyleFile[]>('Styles:', 'length');

export default iif(
    () => !!environment().takeOnly,
    scanForStyles.pipe(take(environment().takeOnly)),
    scanForStyles
).pipe(
    map(getFile),
    tap(debugFile),
    flatMap(parseSass),
    tap(printParsedFileLog),
    toArray<IStyleFile>(),
    tap(logCollection)
)
