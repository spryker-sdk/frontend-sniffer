import { ITemplate } from './template';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';
import { ISassApi, parse as parseSassShared } from '../parsers/sass';
import { IFile } from '../file';

export interface IPartiallyParsedTemplates<W extends IFile = IParsedFile<ITwigApi> | IFile, S extends IFile = IParsedFile<ISassApi> | IFile> extends ITemplate<W, S> {}
export interface IParsedTemplates extends IPartiallyParsedTemplates<IParsedFile<ITwigApi>, IParsedFile<ISassApi>> {}

const createApiParser = <T, I = any>(fileToParse: string, parser: TParser<T, I>) => async function parseTemplates(template: IPartiallyParsedTemplates): Promise<IPartiallyParsedTemplates | IParsedTemplates> {
    if (!template.files[fileToParse].exists) {
        return template;
    }

    const output: IParserOutput<T, I> = await parser(template.files[fileToParse].path);

    return {
        ...template,
        files: {
            ...template.files,
            [fileToParse]: {
                ...template.files[fileToParse],
                ...output
            }
        }
    }
}

export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
export const parseSass = createApiParser<ISassApi>('sass', parseSassShared);
