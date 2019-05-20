import { EStyleType, IStyleFile } from './type';

export interface IStyleSection {
    type: EStyleType,
    files: IStyleFile[]
}

export function toStyleSection(files: IStyleFile[]): IStyleSection {
    return {
        type: files[0].type,
        files
    }
}
