import { IFile } from '../file';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse, ITypescriptApi } from '../parsers/typescript';

export interface IApplicationFile extends IParsedFile<ITypescriptApi> { }

export async function parseTypescript(file: IFile): Promise<IApplicationFile> {
    const output: IParserOutput<ITypescriptApi> = await parse(file.path);

    return {
        ...file,
        ...output
    }
}
