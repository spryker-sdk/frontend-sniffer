import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedViews } from './parser';

export function printParsedTemplateLog(view: IParsedViews): IParsedViews {
    Object
        .values(view.files)
        .forEach((file: IParsedFile) => printParsedFileLog(file));

    return view;
}
