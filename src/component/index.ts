import { map, flatMap, toArray } from 'rxjs/operators';
import settings from '../settings';
import { scan } from '../shared/scanner';
import { readme, deprecated, twig, sass, typescript } from '../component/api';
import { getComponent } from '../component/collector';
import { printComponentLog } from '../component/log';

const component = settings.core.component;

export default scan(component.dirs, component.patterns, component.options).pipe(
    map(getComponent),
    map(c => {
        console.log(c.name);
        return c;
    }),
    flatMap(readme),
    flatMap(deprecated),
    flatMap(twig),
    flatMap(sass),
    flatMap(typescript),
    map(printComponentLog),
    toArray()
)
