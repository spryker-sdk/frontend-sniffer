import { IFile } from '../file';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse, ITypescriptExternalApi, ITypescriptInternalApi } from '../parsers/typescript';

export interface IApplicationFile extends IParsedFile<ITypescriptExternalApi, ITypescriptInternalApi> { }

export async function parseTypescript(file: IFile): Promise<IApplicationFile> {
    const output: IParserOutput<ITypescriptExternalApi, ITypescriptInternalApi> = await parse(file.path);

    return {
        ...file,
        ...output
    }
}
