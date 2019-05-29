import { map, flatMap, toArray } from 'rxjs/operators';
import settings from '../settings';
import { scan } from '../shared/scanner';
import { readme, deprecated, twig, sass, typescript } from '../component/api';
import { getComponent } from '../component/collector';
import { printComponentLog } from '../component/log';
import { printProcessingDir } from '../shared/log';

const { dirs, patterns, options } = settings.core.component;

export default scan(dirs, patterns, options).pipe(
    map(printProcessingDir),
    map(getComponent),
    flatMap(readme),
    flatMap(deprecated),
    flatMap(twig),
    flatMap(sass),
    flatMap(typescript),
    map(printComponentLog),
    toArray()
)
