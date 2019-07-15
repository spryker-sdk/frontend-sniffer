import { IView } from './view';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';

export interface IParsedViews extends IView<IParsedFile<ITwigApi>> {}

export async function parseViews(view: IView): Promise<IParsedViews> {
    const output: IParserOutput<ITwigApi> = await parseTwigShared(view.files.twig.path);

    return {
        ...view,
        files: {
            twig: {
                ...view.files.twig,
                ...output
            }
        }
    }
}
