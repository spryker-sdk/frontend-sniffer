import { IFile } from '../shared/file';
import { IComponent } from './component';
import { IParsedFile, IParserOutput, TParser } from '../shared/parser/base';
import { parse as parseMarkdownShared } from '../shared/parser/markdown';
import { parse as parseTwigShared, ITwigApi } from '../shared/parser/twig';
import { parse as parseSassShared, ISassApi } from '../shared/parser/sass';
import { parse as parseTypescriptShared, ITypescriptApi } from '../shared/parser/typescript';

export interface IPartiallyParsedComponent<M extends IFile = IParsedFile | IFile, W extends IFile = IParsedFile<ITwigApi> | IFile, S extends IFile = IParsedFile<ISassApi> | IFile, T extends IFile = IParsedFile<ITypescriptApi> | IFile> extends IComponent<M, W, S, T> {}
export interface IParsedComponent extends IPartiallyParsedComponent<IParsedFile, IParsedFile<ITwigApi>, IParsedFile<ISassApi>, IParsedFile<ITypescriptApi>> {}

const createApiParser = <T>(fileToParse: string, parser: TParser<T>) => async (component: IPartiallyParsedComponent): Promise<IPartiallyParsedComponent | IParsedComponent> => {
    if (!component.files[fileToParse].exists) {
        return component;
    }

    const output: IParserOutput<T> = await parser(component.files[fileToParse].path);

    return {
        ...component,
        files: {
            ...component.files,
            [fileToParse]: <IParsedFile<T>>{
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
export const parseTypescript = createApiParser<ITypescriptApi>('typescript', parseTypescriptShared);