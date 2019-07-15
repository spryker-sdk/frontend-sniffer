import { IFile } from '../file';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';
import { basename, dirname, join } from 'path';
import { createHash } from 'crypto';
import { readdirSync } from 'fs';
import { extractCorrectTwigFileName } from '../components/component';

export interface IParsedTemplates extends IParsedFile<ITwigApi> {
    id: string
    namespace: string
    module: string
    type: string
}

export async function parseTemplates(file: IFile): Promise<IParsedTemplates> {
    const name = basename(file.path);
    const module = basename(join(file.path, '../../../..'));
    const directoryFiles = readdirSync(file.path);
    const pathToFile = join(file.path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles));
    const type = basename(dirname(file.path)).slice(0, -1);

    const output: IParserOutput<ITwigApi> = await parseTwigShared(pathToFile);
    const fileData = {
        id: createHash('md5').update(file.path).digest('hex'),
        namespace: 'SprykerShop',
        ...file
    };

    return {
        ...fileData,
        ...output,
        module,
        type
    }
}

