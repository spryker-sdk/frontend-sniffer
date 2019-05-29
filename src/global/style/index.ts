import { map, flatMap, toArray } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile } from '../../shared/file';
import { sass, IStyleFile } from '../../global/style/api';
import { printProcessingFile, createParsedFileLogPrinter } from '../../shared/log';

const { dirs, patterns, options } = settings.core.global.style;

export default scan(dirs, patterns, options).pipe(
    map(getFile),
    map(printProcessingFile),
    flatMap(sass),
    map(createParsedFileLogPrinter<IStyleFile>()),
    toArray()
)
