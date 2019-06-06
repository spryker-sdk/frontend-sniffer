import { IFile } from '../shared/file';
import { IParsedFile, IParserOutput } from '../shared/parser/base';
import { parse, ITypescriptApi } from '../shared/parser/typescript';

export interface IApplicationFile extends IParsedFile<ITypescriptApi> { }

export async function parseTypescript(file: IFile): Promise<IApplicationFile> {
    const output: IParserOutput<ITypescriptApi> = await parse(file.path);

    return {
        ...file,
        ...output
    }
}
