import { readFileSync } from 'fs';
import { IParserOutput, TParser } from './base';

interface ITag {
    openingTagRegex: RegExp
    closingTagRegex: RegExp
}

export interface IComment {
    description: string
    tags: [{
        name: string
        description: string
    }]
}

export interface IDefine {
    name: string
    contract: string
    declaration: string
}

export interface IBlock {
    comment: IComment
    name: string
}

export interface IDeprecation {
    description: string
    code: string
}

export interface ITwigApi {
    defines: IDefine[]
    blocks: IBlock[],
    deprecations: IDeprecation[]
}

const allowedDefinitions = [
    'config',
    'data',
    'attributes'
];

const contentRegex = /(\{|\}|\.|\n|\w|:|\s|t|,|\[|\]|\||\(|\)|(('|"|\{#).*('|"|#\}))|)+/;
const defineNameRegex = new RegExp(`(?<=\\{%\\s+define\\s+)(${allowedDefinitions.join('|')})`, 'i');
const defineOpeningTagRegex = new RegExp(`\\{%\\s+define\\s+(${allowedDefinitions.join('|')})\\s+=\\s+\\{`);
const defineClosingTagRegex = /\}\s*%\}/;
const defineDeclarationRegex = new RegExp(`${defineOpeningTagRegex.source}${contentRegex.source}${defineClosingTagRegex.source}`, 'gmi');
const defineContractRegex = new RegExp(`(?<=${defineOpeningTagRegex.source})${contentRegex.source}(?=${defineClosingTagRegex.source})`, 'gmi');
const blockNameRegex = /(?<=\{%\s+block\s+)\w+(?=\s+%\})/gmi;
const deprecationNoteRegex = /(?<=\{#\s+@deprecated\s+).+#\}\n.+/gmi;

//\{#\s+.+#\}(?=(\n|\s)*\{%\s+block\s+\w+\s+%\})
//\{#\s+.+#\}(?=(\n|\s)*\{%\s+macro\s+(\w|\(|\)|,\s)+\s+%\})

const tagsWithChildrenBlocks: ITag[] = [
    {
        openingTagRegex: /\{%\\s+widget\\s+/gmi,
        closingTagRegex: /\{%\\s+endwidget\\s+%\\}/gmi
    },
    {
        openingTagRegex: /\{%\\s+embed\\s+/gmi,
        closingTagRegex: /\{%\\s+endembed\\s+%\\}/gmi
    }
];

function removeTagsWithChildrenBlocks(content: string): string {
    return tagsWithChildrenBlocks.reduce((partialContent: string, tag: ITag): string => {
        return removeTag(partialContent, tag.openingTagRegex, tag.closingTagRegex);
    }, content);
}

function removeTag(input: string, openingTagRegex: RegExp, closingTagRegex: RegExp): string {
    const inputLastCharIndex = input.length - 1;
    const closingTagIndex = getClosingTagIndex(input, closingTagRegex, inputLastCharIndex);
    const openingTagIndex = getOpeningTagIndex(input.substring(0, closingTagIndex), openingTagRegex, 0);

    if (openingTagIndex === 0 && closingTagIndex === inputLastCharIndex) {
        return input;
    }

    return removeTag(eraseCode(input, openingTagIndex, closingTagIndex), openingTagRegex, closingTagRegex);
}

function eraseCode(input: string, openingTagIndex: number = 0, closingTagIndex: number = null): string {
    return input.replace(input.substring(openingTagIndex, closingTagIndex), '');
}

function getOpeningTagIndex(input: string, regex: RegExp, defaultIndex: number): number {
    const match = getLastMatch(input, regex);

    if (!match) {
        return defaultIndex;
    }

    return match.index;
}

function getClosingTagIndex(input: string, regex: RegExp, defaultIndex: number): number {
    const match = getFirstMatch(input, regex);

    if (!match) {
        return defaultIndex;
    }

    return match.index + match[0].length;
}

function getFirstMatch(input: string, regex: RegExp): RegExpExecArray {
    const matches = matchAll(input, regex);
    return matches.length > 0 ? matches[0] : null;
}

function getLastMatch(input: string, regex: RegExp): RegExpExecArray {
    const matches = matchAll(input, regex);
    return matches.length > 0 ? matches[matches.length - 1] : null;
}

function matchAll(input: string, regex: RegExp): RegExpExecArray[] {
    let match = regex.exec(input);
    const matches = [];

    while (match !== null) {
        matches.push(match);
        match = regex.exec(input);
    }

    return matches;
}

const createDeprecation = (note: string): IDeprecation => {
    const [description, code] = note.split('#}');
    return {
        description: description.trim(),
        code: code.trim() + '...'
    }
}

const createDefine = (declaration: string): IDefine => ({
    name: declaration.match(defineNameRegex)[0],
    contract: declaration.match(defineContractRegex)[0],
    declaration
})

const createBlock = (name: string): IBlock => ({
    name,
    comment: null
})

export const parse: TParser<ITwigApi> = async (file: string): Promise<IParserOutput<ITwigApi>> => {
    if (!file) {
        return null;
    }

    try {
        const content = readFileSync(file, 'utf8');
        const deprecationNotes = content.match(deprecationNoteRegex) || [];
        const deprecations = deprecationNotes.map(createDeprecation);
        const contentWithoutTagsWithChildrenBlocks = removeTagsWithChildrenBlocks(content);
        const declarations = contentWithoutTagsWithChildrenBlocks.match(defineDeclarationRegex) || [];
        const defines = declarations.map(createDefine);
        const blockNames = contentWithoutTagsWithChildrenBlocks.match(blockNameRegex) || [];
        const blocks = blockNames.map(createBlock);

        return {
            content,
            api: {
                defines,
                blocks,
                deprecations
            }
        }
    } catch (error) {
        return {
            content: null,
            api: null,
            log: {
                errors: [error.stack]
            }
        }
    }
}
