import { readFile } from 'fs';
import { promisify } from 'util';
import { parse as parseSass } from 'sast';
import visit from 'unist-util-visit';
import visitParents from 'unist-util-visit-parents';
import is from 'unist-util-is';
import find from 'unist-util-find';
import findBefore from 'unist-util-find-before';
import { IParserOutput, TParser } from './base';

export interface ISassApi {
    variables: any[]
    mixins: any[]
    functions: any[]
    modifiers: any[]
}

const read = promisify(readFile);

function getChildren(node: any): any {
    if (!node || !node.children) {
        return [];
    }

    return node.children;
}

function extractComment(node: any, parentNode: any) {
    const closestSpaceNode = findBefore(parentNode, node, 'space');
    const commentNode = findBefore(parentNode, node, foundNode => {
        const upperRange = [foundNode.position.end.line, foundNode.position.end.line + 1];
        const lowerRange = [node.position.start.line - 1, node.position.start.line];

        return is('multilineComment', foundNode)
            && upperRange.includes(closestSpaceNode.position.start.line)
            && lowerRange.includes(closestSpaceNode.position.end.line)
    });

    if (!commentNode) {
        return null;
    }

    const text = commentNode.value
        .replace(/\n\s*\*\s*/g, '\n')
        .replace(/^\*\n/, '')
        .replace(/\n\s*$/, '')
        .trim();

    const [rawDescription, ...rawTags] = text.split('@');
    const description = rawDescription
        .replace(/\n$/, '')
        .trim();

    const tags = rawTags
        .map(rawTag => {
            const tag = rawTag
                .replace(/\n/g, ' ')
                .trim();

            const [tagType, ...tagDescription] = tag.split(' ');

            return {
                type: tagType,
                description: tagDescription.join(' ')
            }
        });

    return {
        description,
        tags
    }
}

function extractSharedVariables(stylesheetNode: any) {
    return getChildren(stylesheetNode)
        .filter(child => is('declaration', child))
        .map(declarationNode => extractVariable(declarationNode, stylesheetNode));
}

function extractVariable(declarationNode: any, parentNode: any) {
    return {
        ...extractArgument(declarationNode),
        comment: extractComment(declarationNode, parentNode)
    }
}

function extractArgument(declarationNode: any) {
    const variableNode = find(declarationNode, { type: 'variable' });
    const nameNode = find(variableNode, { type: 'ident' });
    const valueNode = find(declarationNode, { type: 'value' });
    const amountNode = find(valueNode, node => is('number', node) || is('string', node));
    const unitNode = find(valueNode, { type: 'ident' });
    const amount = !!amountNode ? amountNode.value : '';
    const unit = !!unitNode ? unitNode.value : '';

    return {
        name: nameNode.value,
        value: amount + unit
    }
}

function extractEmptyArgument(variableNode: any) {
    const nameNode = find(variableNode, { type: 'ident' });

    return {
        name: nameNode.value,
        value: null
    }
}

function extractSharedMixins(stylesheetNode: any) {
    const mixinSet = new Set();

    visit(stylesheetNode, 'mixin', (node, index, parent) => {
        if (!node || !node.children) {
            return;
        }

        mixinSet.add({ node, parent });
    });

    const mixins = Array.from(mixinSet);
    return mixins.map(data => extractMixin(data.node, data.parent));
}

function extractMixin(mixinNode: any, parentNode: any): any {
    const comment = extractComment(mixinNode, parentNode);

    const name = getChildren(mixinNode)
        .find(child => is('ident', child))
        .value;

    const argumentsNode = find(mixinNode, { type: 'arguments' });
    const args = getChildren(argumentsNode)
        .filter(childNode => is('variable', childNode) || is('declaration', childNode))
        .map(childNode => {
            if (is('variable', childNode)) {
                return extractEmptyArgument(childNode);
            }

            return extractArgument(childNode);
        });

    let hasContent = false;

    visit(mixinNode, { value: 'content' }, (child, index, parent) => {
        if (is('atkeyword', parent)) {
            hasContent = true;
        }
    });

    return {
        comment,
        name,
        arguments: args,
        hasContent
    }
}

function extractSharedFunctions(stylesheetNode: any) {
    const functionSet = new Set();

    visitParents(stylesheetNode, 'function', (node, parents) => {
        if (!node || !node.children || !parents || parents.legth < 2) {
            return;
        }

        const parent = parents[parents.length - 1];
        const grandParent = parents[parents.length - 2];
        functionSet.add({ node, parent, grandParent });
    });

    const functions = Array.from(functionSet);
    return functions.map(data => extractFunction(data.node, data.parent, data.grandParent));
}

function extractFunction(functionNode: any, parentNode: any, grandParentNode: any): any {
    const comment = extractComment(parentNode, grandParentNode);

    const name = getChildren(functionNode)
        .find(child => is('ident', child))
        .value;

    const argumentsNode = find(functionNode, { type: 'arguments' });
    const args = getChildren(argumentsNode)
        .filter(childNode => is('variable', childNode) || is('declaration', childNode))
        .map(childNode => {
            if (is('variable', childNode)) {
                return extractEmptyArgument(childNode);
            }

            return extractArgument(childNode);
        });

    return {
        comment,
        name,
        arguments: args
    }
}

function extractBlockModifiers(stylesheetNode: any) {
    const modifierMap = new Map<string, any>();

    visitParents(stylesheetNode, 'selector', (selectorNode, ancestorNodes) => {
        const nameNode = find(selectorNode, { type: 'ident' });

        if (!nameNode) {
            return;
        }

        const isModifier = /^--/.test(nameNode.value);
        const name = nameNode
            .value
            .replace(/^--/, '');

        if (!name || !isModifier) {
            return;
        }

        const rulesetNodes = ancestorNodes.filter(ancestorNode => is('ruleset', ancestorNode));

        if (rulesetNodes.length > 2) {
            return;
        }

        const parentNode = ancestorNodes[ancestorNodes.length - 1];
        const grandparentNode = ancestorNodes[ancestorNodes.length - 2];
        const comment = extractComment(parentNode, grandparentNode);

        if (modifierMap.has(name) && !comment) {
            return;
        }

        modifierMap.set(name, {
            comment,
            name
        });
    });

    return Array.from(modifierMap.values());
}

export const parse: TParser<ISassApi> = async (file: string): Promise<IParserOutput<ISassApi>> => {
    if (!file) {
        return null;
    }

    try {
        const content = await read(file, { encoding: 'utf8' });
        const stylesheetNode = parseSass(content, { syntax: 'scss' });

        return {
            content,
            api: {
                variables: extractSharedVariables(stylesheetNode),
                mixins: extractSharedMixins(stylesheetNode),
                functions: extractSharedFunctions(stylesheetNode),
                modifiers: extractBlockModifiers(stylesheetNode)
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
