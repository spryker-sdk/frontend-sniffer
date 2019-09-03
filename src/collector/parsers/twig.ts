import { readFileSync } from 'fs';
import { IParserOutput, TParser } from './base';
import { snifferDisabledRules } from './common';

export interface ICommentTag {
    name: string
    description: string
}

export interface IComment {
    description: string
    tags: ICommentTag[]
}

export interface IDefinition {
    name: string
    contract: string
    declaration: string
}

export interface IMacro {
    signature: string
    comment: IComment
}

export interface IBlock {
    name: string
    comment: IComment
}

export interface ITwigApi {
    definitions: IDefinition[]
    macros: IMacro[]
    blocks: IBlock[]
}

interface ITagWidthChildrenMeta {
    openingTagRegex: RegExp
    closingTagRegex: RegExp
}

const allowedDefinitions = [
    'config',
    'data',
    'attributes'
];

const contentRegex = /(\{|\}|\.|\n|\w|:|~|\s|t|,|\[|\]|\||\(|\)|\?|(('|"|\{#).*('|"|#\}))|)+/;
const defineNameRegex = new RegExp(`(?<=\\{%\\s+define\\s+)(${allowedDefinitions.join('|')})`, 'i');
const defineOpeningTagRegex = new RegExp(`\\{%\\s+define\\s+(${allowedDefinitions.join('|')})\\s+=\\s+\\{`);
const defineClosingTagRegex = /\}\s*%\}/;
const defineDeclarationRegex = new RegExp(`${defineOpeningTagRegex.source}${contentRegex.source}${defineClosingTagRegex.source}`, 'gmi');
const defineContractRegex = new RegExp(`(?<=${defineOpeningTagRegex.source})${contentRegex.source}(?=${defineClosingTagRegex.source})`, 'gmi');

const blockAndCommentRegex = /(\{#[^#]+#\}\n?)?\{%(\s|-)*block.+%\}/gmi;
const blockNameRegex = /(?<=\{%(\s|-)*block\s+)\w+(?=(\s|-)*%\})/gmi;
const macroAndCommentRegex = /(\{#[^#]+#\}\n?)?\{%\s*macro.+%\}/gmi;
const macroSignatureRegex = /(?<=\{%\s*macro\s+)(\w|\(|\)|\s|,)+(?=\s*%\})/gmi;
const commentRegex = /(?<=\{#)(.|\n)+(?=#\})/gmi;

const tagsWithChildrenBlocks: ITagWidthChildrenMeta[] = [
    {
        openingTagRegex: /\{%\s*widget/gmi,
        closingTagRegex: /\{%\s*endwidget\s*%\}/gmi
    },
    {
        openingTagRegex: /\{%\s*embed/gmi,
        closingTagRegex: /\{%\s*endembed\s*%\}/gmi
    }
];

function removeTagsWithChildrenBlocks(content: string): string {
    return tagsWithChildrenBlocks.reduce((partialContent: string, tag: ITagWidthChildrenMeta): string => {
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

function extractDefinitions(content: string): IDefinition[] {
    const declarations = content.match(defineDeclarationRegex) || [];
    return declarations.map((declaration: string) => ({
        name: declaration.match(defineNameRegex)[0],
        contract: declaration.match(defineContractRegex)[0],
        declaration
    }))
}

function extractBlocks(content: string): IBlock[] {
    const blocksAndComments = content.match(blockAndCommentRegex) || [];
    return blocksAndComments
        .map((blockAndComment: string) => {
            const blockName = blockAndComment.match(blockNameRegex) || [];

            if (blockName.length === 0) {
                return null
            }

            return {
                name: blockName[0],
                comment: extractComment(content)
            }
        })
}

function extractMacros(content: string): IMacro[] {
    const macrosAndComments = content.match(macroAndCommentRegex) || [];
    return macrosAndComments
        .map((macroAndComment: string) => {
            const macroSignature = macroAndComment.match(macroSignatureRegex) || [];

            if (macroSignature.length === 0) {
                return null
            }

            return {
                signature: macroSignature[0],
                comment: extractComment(content)
            }
        })
}

function extractComment(content: string): IComment {
    const comment = content.match(commentRegex) || [];

    if (comment.length === 0) {
        return null
    }

    const descriptionLastCharIndex = comment[0].indexOf('@');
    return {
        description: comment[0].substring(0, descriptionLastCharIndex),
        tags: extractCommentTags(comment[0].substring(descriptionLastCharIndex))
    }
}

function extractCommentTags(content: string): ICommentTag[] {
    const tags = content.split('@') || [];

    if (tags.length === 0) {
        return null
    }

    return tags.map((tag: string) => {
        const separatorIndex = tag.indexOf(' ');
        return {
            name: tag.substring(0, separatorIndex),
            description: tag.substring(separatorIndex)
        }
    })
}

export const parse: TParser<ITwigApi> = async (file: string): Promise<IParserOutput<ITwigApi>> => {
    if (!file) {
        return null;
    }

    try {
        const content = readFileSync(file, 'utf8');
        const cleanedContent = removeTagsWithChildrenBlocks(content);

        return {
            disabledSnifferRules: snifferDisabledRules(content),
            content,
            api: {
                external: {
                    definitions: extractDefinitions(content),
                    macros: extractMacros(content),
                    blocks: extractBlocks(cleanedContent)
                },
                internal: null
            },
        }
    } catch (error) {
        return {
            disabledSnifferRules: null,
            content: null,
            api: {
                external: null,
                internal: null
            },
            log: {
                errors: [error.stack]
            }
        }
    }
}
