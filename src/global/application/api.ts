import { IFile } from '../../shared/file';
import { IParsedFile, IParserOutput } from '../../shared/parser/base';
import { parse as parseTypescript, ITypescriptApi } from '../../shared/parser/typescript';

export interface IApplicationFile extends IParsedFile<ITypescriptApi> { }

export async function typescript(file: IFile): Promise<IApplicationFile> {
    const output: IParserOutput<ITypescriptApi> = await parseTypescript(file.path);

    return {
        ...file,
        ...output
    }
}
