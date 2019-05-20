import { IFile } from '../shared/file';
import { IComponent } from './collector';
import { IParsedFile, IParserOutput, TParser } from '../shared/parser/base';
import { parse as parseMarkdown } from '../shared/parser/markdown';
import { parse as parseTwig, ITwigApi } from '../shared/parser/twig';
import { parse as parseSass, ISassApi } from '../shared/parser/sass';
import { parse as parseTypescript, ITypescriptApi } from '../shared/parser/typescript';

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

export const readme = createApiParser('readme', parseMarkdown);
export const deprecated = createApiParser('deprecated', parseMarkdown);
export const twig = createApiParser<ITwigApi>('twig', parseTwig);
export const sass = createApiParser<ISassApi>('sass', parseSass);
export const typescript = createApiParser<ITypescriptApi>('typescript', parseTypescript);
