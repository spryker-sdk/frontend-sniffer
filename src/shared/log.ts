import { yellow, dim, red, cyan, magenta, bold } from 'colors';
import { IFile } from '../shared/file';
import { IParsedFile } from '../shared/parser/base';

interface ILogSetting {
    print: Function
    color: Function
}

interface ILogSettings {
    [key: string]: ILogSetting
}

const LogSettings: ILogSettings = {
    log: {
        print: console.log,
        color: dim
    },
    information: {
        print: console.info,
        color: dim
    },
    warning: {
        print: console.warn,
        color: yellow
    },
    error: {
        print: console.error,
        color: red
    }
}

export const hasLogs = (file: IParsedFile): boolean => !!file.log;
export const hasInfos = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.infos && file.log.infos.length > 0;
export const hasWarnings = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.warnings && file.log.warnings.length > 0;
export const hasErrors = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.errors && file.log.errors.length > 0;
export const printLogMessages = (messages: string[], setting: ILogSetting): void => messages.forEach((message: string) => setting.print(setting.color(message)));

export function printProcessingDir(dir: string): string {
    console.log(dim(`\nprocessing directory`), dim(magenta(`\n${dir}`)));
    return dir;
}

export function printProcessingFile(file: IFile): IFile {
    console.log(dim(`\nprocessing file`), file.name, dim(cyan(`\n${file.relativePath}`)));
    return file;
}

export const createParsedFileLogPrinter = <T extends IParsedFile = IParsedFile>() => (file: T): T => {
    hasLogs(file) && console.log(dim(`\nparsing ${bold(file.name)}...`));
    hasInfos(file) && printLogMessages(file.log.infos, LogSettings.information);
    hasWarnings(file) && printLogMessages(file.log.warnings, LogSettings.warning);
    hasErrors(file) && printLogMessages(file.log.errors, LogSettings.error);
    return file;
}
