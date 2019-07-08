import { IFile } from '../file';
import { IView } from './view';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';

export interface IPartiallyParsedView<W extends IFile = IParsedFile<ITwigApi> | IFile> extends IView<W> {}
export interface IParsedView extends IPartiallyParsedView<IParsedFile<ITwigApi>> {}

const createApiParser = <T>(fileToParse: string, parser: TParser<T>) => async (view: IPartiallyParsedView): Promise<IPartiallyParsedView | IParsedView> => {
    if (!view.file[fileToParse].exists) {
        return view;
    }

    const output: IParserOutput<T> = await parser(view.file[fileToParse].path);

    return {
        ...view,
        file: {
            ...view.file,
            [fileToParse]: <IParsedFile<T>>{
                ...view.file[fileToParse],
                ...output
            }
        }
    }
}

export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
