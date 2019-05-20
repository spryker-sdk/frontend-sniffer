import { map, flatMap, toArray, groupBy, mergeMap } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile } from '../../shared/file';
import { typescript } from '../../global/application/api';
import { printApplicationFileLog } from './log';

const { application } = settings.core.global;

export default scan(application.dirs, application.patterns, application.options).pipe(
    map(getFile),
    flatMap(typescript),
    map(printApplicationFileLog),
    toArray()
)
