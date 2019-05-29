import { map, flatMap, toArray, groupBy, mergeMap } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile } from '../../shared/file';
import { typescript, IApplicationFile } from '../../global/application/api';
import { printProcessingFile, createParsedFileLogPrinter } from '../../shared/log';

const { dirs, patterns, options } = settings.core.global.application;

export default scan(dirs, patterns, options).pipe(
    map(getFile),
    map(printProcessingFile),
    flatMap(typescript),
    map(createParsedFileLogPrinter<IApplicationFile>()),
    toArray()
)
