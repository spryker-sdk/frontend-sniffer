import { IView } from './view';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';
import { basename, join } from 'path';
import { readdirSync } from 'fs';
import { extractCorrectTwigFileName } from '../components/component';

export interface IParsedViews extends IParsedFile<ITwigApi>, IView {}

export async function parseViews(file: IView): Promise<IParsedViews> {
    const name = basename(file.path);
    const directoryFiles = readdirSync(file.path);
    const pathToFile = join(file.path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles));

    const output: IParserOutput<ITwigApi> = await parseTwigShared(pathToFile);

    return {
        ...file,
        ...output
    }
}
