import { IFile } from '../file';
import { IComponent } from './component';
import { IParsedFile, IParserOutput, TParser } from '../parsers/base';
import { parse as parseMarkdownShared } from '../parsers/markdown';
import { parse as parseTwigShared, ITwigApi } from '../parsers/twig';
import { parse as parseSassShared, ISassApi } from '../parsers/sass';
import { parse as parseTypescriptShared, ITypescriptExternalApi, ITypescriptInternalApi } from '../parsers/typescript';

export interface IPartiallyParsedComponent<M extends IFile = IParsedFile | IFile, W extends IFile = IParsedFile<ITwigApi> | IFile, S extends IFile = IParsedFile<ISassApi> | IFile, T extends IFile = IParsedFile<ITypescriptExternalApi, ITypescriptInternalApi> | IFile> extends IComponent<M, W, S, T> {}
export interface IParsedComponent extends IPartiallyParsedComponent<IParsedFile, IParsedFile<ITwigApi>, IParsedFile<ISassApi>, IParsedFile<ITypescriptExternalApi, ITypescriptInternalApi>> {}

const createApiParser = <T, I = any>(fileToParse: string, parser: TParser<T, I>) => async (component: IPartiallyParsedComponent): Promise<IPartiallyParsedComponent | IParsedComponent> => {
    if (!component.files[fileToParse].exists) {
        return component;
    }

    const output: IParserOutput<T, I> = await parser(component.files[fileToParse].path);

    return {
        ...component,
        files: {
            ...component.files,
            [fileToParse]: <IParsedFile<T, I>>{
                ...component.files[fileToParse],
                ...output
            }
        }
    }
}

export const parseReadme = createApiParser('readme', parseMarkdownShared);
export const parseDeprecated = createApiParser('deprecated', parseMarkdownShared);
export const parseTwig = createApiParser<ITwigApi>('twig', parseTwigShared);
export const parseSass = createApiParser<ISassApi>('sass', parseSassShared);
export const parseTypescript = createApiParser<ITypescriptExternalApi, ITypescriptInternalApi>('typescript', parseTypescriptShared);
