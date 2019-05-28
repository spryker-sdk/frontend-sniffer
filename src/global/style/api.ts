import { basename, dirname } from 'path';
import { IFile } from '../../shared/file';
import { IParsedFile, IParserOutput } from '../../shared/parser/base';
import { parse as parseSass, ISassApi } from '../../shared/parser/sass';

export enum EStyleType {
    Setting = 'setting',
    Helper = 'helper',
    Basic = 'basic',
    Util = 'util'
}

export interface IStyleFile extends IParsedFile<ISassApi> {
    type: EStyleType
}

export async function sass(file: IFile): Promise<IStyleFile> {
    const type: EStyleType = <EStyleType>basename(dirname(file.path)).slice(0, -1);
    const output: IParserOutput<ISassApi> = await parseSass(file.path);

    return {
        ...file,
        ...output,
        type
    }
}
