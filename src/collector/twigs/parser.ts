import { IFile } from '../file';
import { ITwig } from './twig';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';

export interface IPartiallyParsedTwig<W extends IFile = IParsedFile<ITwigApi> | IFile> extends ITwig<W> {}
export interface IParsedTwig extends IPartiallyParsedTwig<IParsedFile<ITwigApi>> {}

const createApiParser = <T>(fileToParse: string, parser: TParser<T>) => async (twig: IPartiallyParsedTwig): Promise<IPartiallyParsedTwig | IParsedTwig> => {
    if (!twig.file[fileToParse].exists) {
        return twig;
    }

    const output: IParserOutput<T> = await parser(twig.file[fileToParse].path);

    return {
        ...twig,
        file: {
            ...twig.file,
            [fileToParse]: <IParsedFile<T>>{
                ...twig.file[fileToParse],
                ...output
            }
        }
    }
}

export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
