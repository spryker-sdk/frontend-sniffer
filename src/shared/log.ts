import { green, yellow, dim, red, bold } from 'colors';
import { IParsedFile } from '../shared/parser/base';

export const hasLogs = (file: IParsedFile): boolean => !!file.log;
export const hasInfos = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.infos && file.log.infos.length > 0;
export const hasWarnings = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.warnings && file.log.warnings.length > 0;
export const hasErrors = (file: IParsedFile): boolean => hasLogs(file) && !!file.log.errors && file.log.errors.length > 0;

export const printSuccessMark = (): void => console.log(green('\u2714'));
export const printFailureMark = (): void => console.log(red('\u2718'));
export const printWarningMark = (): void => console.log(yellow('\u2691'));

export function printInfos(messages: string[] = []): void {
    console.log(dim('informations'));
    messages.forEach((message: string) => console.log(dim(message)));
}

export function printWarnings(messages: string[] = []): void {
    console.log(dim('warnings'));
    messages.forEach((message: string) => console.warn(yellow(message)));
}

export function printErrors(messages: string[] = []): void {
    console.log(dim('errors'));
    messages.forEach((message: string) => console.error(red(message)));
}

export function printParsedFileLog(parserName: string, file: IParsedFile): void {
    console.log(dim(`${parserName} parser on ${bold(file.name)}`));
    hasInfos(file) && printInfos(file.log.infos);
    hasWarnings(file) && printWarnings(file.log.warnings);
    hasErrors(file) && printErrors(file.log.errors);
}
