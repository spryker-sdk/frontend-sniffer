import { printParsedFileLog } from '../log';
import { IParsedFile } from '../parsers/base';
import { IParsedComponent } from './parser';

export function printParsedComponentLog(component: IParsedComponent): IParsedComponent {
    Object
        .values(component.files)
        .forEach((file: IParsedFile) => printParsedFileLog(file));
    return component;
}
