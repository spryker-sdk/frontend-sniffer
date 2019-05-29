import { createParsedFileLogPrinter } from '../shared/log';
import { IParsedComponent } from './api';

export function printComponentLog(component: IParsedComponent): IParsedComponent {
    const { readme, deprecated, twig, sass, typescript } = component.files;
    const print = createParsedFileLogPrinter();

    print(readme);
    print(deprecated);
    print(twig);
    print(sass);
    print(typescript);

    return component;
}
