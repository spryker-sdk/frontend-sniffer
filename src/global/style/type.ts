import { dirname, basename } from 'path';
import { IParsedFile } from '../../shared/parser/base';
import { ISassApi } from '../../shared/parser/sass';

export enum EStyleType {
    Setting = 'setting',
    Helper = 'helper',
    Basic = 'basic',
    Util = 'util'
}

export interface IStyleFile extends IParsedFile<ISassApi> {
    type: EStyleType
}

export function toStyleFile(file: IParsedFile<ISassApi>): IStyleFile {
    return {
        ...file,
        type: <EStyleType>basename(dirname(file.path)).slice(0, -1)
    }
}

export const byType = (file: IStyleFile): EStyleType => file.type
