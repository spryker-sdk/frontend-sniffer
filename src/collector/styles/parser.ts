import { basename, dirname } from 'path';
import { IFile } from '../file';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse, ISassApi } from '../parsers/sass';

export enum EStyleType {
    Setting = 'setting',
    Helper = 'helper',
    Basic = 'basic',
    Util = 'util'
}

export interface IStyleFile extends IParsedFile<ISassApi> {
    type: EStyleType
}

export async function parseSass(file: IFile): Promise<IStyleFile> {
    const type: EStyleType = <EStyleType>basename(dirname(file.path)).slice(0, -1);
    const output: IParserOutput<ISassApi> = await parse(file.path);

    return {
        ...file,
        ...output,
        type
    }
}
