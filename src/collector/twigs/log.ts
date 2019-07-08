import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedTwig } from './parser';

export function printParsedViewLog(twig: IParsedTwig): IParsedTwig {
    Object
        .values(twig.file)
        .forEach((file: IParsedFile) => printParsedFileLog(file));

    return twig;
}
