import { bold, dim } from 'colors';
import { hasLogs, printParsedFileLog } from '../../shared/log';
import { IStyleFile } from './type';

export function printStyleLog(file: IStyleFile): IStyleFile {
    const name = file.name.replace(/(^_|\.scss$)+/gmi, '');
    console.log(bold(name), dim(file.type));

    if (!hasLogs(file)) {
        return file;
    }

    hasLogs(file) && printParsedFileLog('sass', file);
    return file;
}
