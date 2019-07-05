import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedView } from './parser';

export function printParsedViewLog(view: IParsedView): IParsedView {
    Object
        .values(view)
        .forEach((file: IParsedFile) => printParsedFileLog(file));
    return view;
}
