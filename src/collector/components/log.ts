import { printParsedFileLog } from '../shared/log';
import { IParsedFile } from '../shared/parser/base';
import { IParsedComponent } from './parser';

export function printParsedComponentLog(component: IParsedComponent): IParsedComponent {
    Object
        .values(component.files)
        .forEach((file: IParsedFile) => printParsedFileLog(file));
    return component;
}
