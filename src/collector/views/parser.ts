import { IView } from './view';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';
import { IFile } from '../file';

export interface IPartiallyParsedViews<W extends IFile = IParsedFile<ITwigApi> | IFile> extends IView<W> {}
export interface IParsedViews extends IPartiallyParsedViews<IParsedFile<ITwigApi>> {}

const createApiParser = <T, I = any>(fileToParse: string, parser: TParser<T, I>) => async function parseTemplates(view: IPartiallyParsedViews): Promise<IPartiallyParsedViews | IParsedViews> {
    if (!view.files[fileToParse].exists) {
        return view;
    }

    const output: IParserOutput<T, I> = await parser(view.files[fileToParse].path);

    return {
        ...view,
        files: {
            ...view.files,
            [fileToParse]: {
                ...view.files[fileToParse],
                ...output
            }
        }
    }
}

export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
