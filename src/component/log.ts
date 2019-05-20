import { green, yellow, dim, red, bold } from 'colors';
import { hasLogs, hasErrors, printParsedFileLog, printSuccessMark, printFailureMark, printWarningMark } from '../shared/log';
import { IParsedComponent } from './api';

export function printComponentLog(component: IParsedComponent): IParsedComponent {
    const { name, type, module } = component;
    const { readme, deprecated, twig, sass, typescript } = component.files;

    process.stdout.write(`${bold(name)} ${dim(`${type} in ${module}... `)}`);

    if (!hasLogs(readme) && !hasLogs(twig) && !hasLogs(sass) && !hasLogs(typescript)) {
        printSuccessMark();
        return component;
    }

    if (hasErrors(readme) || hasErrors(twig) || hasErrors(sass) || hasErrors(typescript)) {
        printFailureMark();
    } else {
        printWarningMark();
    }

    hasLogs(readme) && printParsedFileLog('markdown', readme);
    hasLogs(deprecated) && printParsedFileLog('markdown', deprecated);
    hasLogs(twig) && printParsedFileLog('twig', twig);
    hasLogs(sass) && printParsedFileLog('sass', sass);
    hasLogs(typescript) && printParsedFileLog('typescript', typescript);

    return component;
}
