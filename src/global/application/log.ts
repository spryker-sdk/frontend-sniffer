import { bold, dim } from 'colors';
import { hasLogs, hasErrors, printParsedFileLog, printSuccessMark, printFailureMark, printWarningMark } from '../../shared/log';
import { IApplicationFile } from './api';

export function printApplicationFileLog(file: IApplicationFile): IApplicationFile {
    const name = file.name.replace(/(\.ts$)+/gmi, '');
    process.stdout.write(`${bold(name)}${dim('... ')}`);

    if (!hasLogs(file)) {
        printSuccessMark()
        return file;
    }

    if (hasErrors(file)) {
        printFailureMark()
    } else {
        printWarningMark()
    }

    hasLogs(file) && printParsedFileLog('typescript', file);
    return file;
}
