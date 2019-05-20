import { map, flatMap, toArray, groupBy, mergeMap } from 'rxjs/operators';
import settings from '../../settings';
import { scan } from '../../shared/scanner';
import { getFile } from '../../shared/file';
import { sass } from '../../global/style/api';
import { toStyleFile, byType } from '../../global/style/type';
import { toStyleSection } from '../../global/style/section';
import { printStyleLog } from './log';

const { style } = settings.core.global;

export default scan(style.dirs, style.patterns, style.options).pipe(
    map(getFile),
    flatMap(sass),
    map(toStyleFile),
    map(printStyleLog),
    groupBy(byType),
    mergeMap(group => group.pipe(toArray())),
    map(toStyleSection),
    toArray()
)
