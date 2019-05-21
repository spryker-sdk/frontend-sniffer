import { dim, bold } from 'colors';
import { hasLogs, printParsedFileLog } from '../shared/log';
import { IParsedComponent } from './api';

export function printComponentLog(component: IParsedComponent): IParsedComponent {
    const { name, type, module } = component;
    const { readme, deprecated, twig, sass, typescript } = component.files;
    console.log(bold(name), dim(`${type} in ${module}`));

    if (!hasLogs(readme) && !hasLogs(twig) && !hasLogs(sass) && !hasLogs(typescript)) {
        return component;
    }

    hasLogs(readme) && printParsedFileLog('markdown', readme);
    hasLogs(deprecated) && printParsedFileLog('markdown', deprecated);
    hasLogs(twig) && printParsedFileLog('twig', twig);
    hasLogs(sass) && printParsedFileLog('sass', sass);
    hasLogs(typescript) && printParsedFileLog('typescript', typescript);

    return component;
}
