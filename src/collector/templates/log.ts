import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedTemplates } from './parser';

export function printParsedTemplateLog(template: IParsedTemplates): IParsedTemplates {
    Object
        .values(template)
        .forEach((file: IParsedFile) => printParsedFileLog(file));

    return template;
}
