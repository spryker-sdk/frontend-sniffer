import { bold, dim } from 'colors';
import { hasLogs, hasErrors, printParsedFileLog, printSuccessMark, printFailureMark, printWarningMark } from '../../shared/log';
import { IStyleFile } from './type';

export function printStyleLog(file: IStyleFile): IStyleFile {
    const name = file.name.replace(/(^_|\.scss$)+/gmi, '');
    process.stdout.write(`${bold(name)} ${dim(`${file.type}... `)}`);

    if (!hasLogs(file)) {
        printSuccessMark()
        return file;
    }

    if (hasErrors(file)) {
        printFailureMark()
    } else {
        printWarningMark()
    }

    hasLogs(file) && printParsedFileLog('sass', file);
    return file;
}
