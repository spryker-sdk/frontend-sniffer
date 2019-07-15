import { ITemplate } from './template';
import { IParsedFile, IParserOutput } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';

export interface IParsedTemplates extends ITemplate<IParsedFile<ITwigApi>> {}

export async function parseTemplates(template: ITemplate): Promise<IParsedTemplates> {
    const output: IParserOutput<ITwigApi> = await parseTwigShared(template.files.twig.path);

    return {
        ...template,
        files: {
            twig: {
                ...template.files.twig,
                ...output
            }
        }
    }
}

