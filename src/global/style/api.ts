import { IFile } from '../../shared/file';
import { IParsedFile, IParserOutput } from '../../shared/parser/base';
import { parse as parseSass, ISassApi } from '../../shared/parser/sass';

export async function sass(file: IFile): Promise<IParsedFile<ISassApi>> {
    const output: IParserOutput<ISassApi> = await parseSass(file.path);

    return {
        ...file,
        ...output
    }
}
