import { bold } from 'colors';
import { hasLogs, printParsedFileLog } from '../../shared/log';
import { IApplicationFile } from './api';

export function printApplicationFileLog(file: IApplicationFile): IApplicationFile {
    const name = file.name.replace(/(\.ts$)+/gmi, '');
    console.log(bold(name));

    if (!hasLogs(file)) {
        return file;
    }

    hasLogs(file) && printParsedFileLog('typescript', file);
    return file;
}
