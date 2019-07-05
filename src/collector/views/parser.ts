import { IFile } from '../file';
import { IView } from './view';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';

export interface IPartiallyParsedView<W extends IFile = IParsedFile<ITwigApi> | IFile> extends IView<W> {}
export interface IParsedView extends IPartiallyParsedView<IParsedFile<ITwigApi>> {}

const createApiParser = <T>(fileToParse: string, parser: TParser<T>) => async (view: IPartiallyParsedView): Promise<IPartiallyParsedView | IParsedView> => {
    if (!view.files[fileToParse].exists) {
        return view;
    }

    const output: IParserOutput<T> = await parser(view.files[fileToParse].path);

    return {
        ...view,
        files: {
            ...view.files,
            [fileToParse]: <IParsedFile<T>>{
                ...view.files[fileToParse],
                ...output
            }
        }
    }
}

export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
