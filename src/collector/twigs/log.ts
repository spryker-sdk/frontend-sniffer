import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedTwig } from './parser';

export function printParsedViewLog(view: IParsedTwig): IParsedTwig {
    Object
        .values(view.file)
        .forEach((file: IParsedFile) => printParsedFileLog(file));
    return view;
}
