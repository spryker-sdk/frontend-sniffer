import { log, info, warn, error, ILogger } from '../../shared/log';
import { IParsedFile } from './parser/base';
import { get as environment } from '../../environment';

export const hasLogs = (file: IParsedFile): boolean => !!file.log;
export const hasInfos = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.infos && file.log.infos.length > 0;
export const hasWarnings = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.warnings && file.log.warnings.length > 0;
export const hasErrors = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.errors && file.log.errors.length > 0;
export const printLogMessages = (messages: string[], logger: ILogger): void => messages.forEach((message: string) => logger.print(message));

export const printParsedFileLog = (file: IParsedFile): IParsedFile => {
    if (!environment().debug) {
        hasErrors(file) && log.print(`\nparsing ${file.name}...`);
        hasErrors(file) && printLogMessages(file.log.errors, error);
        return file;
    }

    hasLogs(file) && log.print(`\nparsing ${file.name}...`);
    hasInfos(file) && printLogMessages(file.log.infos, info);
    hasWarnings(file) && printLogMessages(file.log.warnings, warn);
    hasErrors(file) && printLogMessages(file.log.errors, error);
    return file;
}
