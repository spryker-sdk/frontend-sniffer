import { EOL } from 'os';
import * as ts from 'typescript';
import { IParserLog, IParserOutput, TParser } from './base';
import { snifferDisabledRules } from './common';

export interface ITag {
    name: string
    description: string
}

export interface IParameter {
    name: string
    description: string
    type: string
    isOptional: boolean
}

export interface IFunction {
    name: string,
    description: string
    tags: ITag[]
    parameters: IParameter[]
    returnType: string
    extractAsync: boolean
}

export interface IMethod extends IFunction {
    visibility: string
}

export interface IClass {
    name: string
    description?: string
    tags?: ITag[]
    properties: IProperty[]
    methods: IMethod[]
    accessors: IAccessor[]
}

export interface IProperty {
    name: string
    description: string
    returnType: string
    visibility: string
    isReadonly: boolean
}

export interface IAccessor {
    name: string
    description: string
    returnType: string
    parameters: IParameter[]
    accessorType: string
    visibility: string
}

export type TDeclarationVariants = ts.MethodDeclaration | ts.FunctionDeclaration | ts.PropertyDeclaration | ts.AccessorDeclaration

export interface ITypescriptExternalApi {
    classes: IClass[]
    functions: IFunction[]
}

export interface ITypescriptInternalApi {
    classes: IClass[]
}

export const VisibilityMap = {
    [ts.SyntaxKind.PublicKeyword]: 'public',
    [ts.SyntaxKind.ProtectedKeyword]: 'protected',
    [ts.SyntaxKind.PrivateKeyword]: 'private'
}

export const AccessorsMap = {
    [ts.SyntaxKind.GetAccessor]: 'get',
    [ts.SyntaxKind.SetAccessor]: 'set'
}

export const BaseTypeMap = {
    [ts.SyntaxKind.VoidKeyword]: 'void',
    [ts.SyntaxKind.NullKeyword]: 'null',
    [ts.SyntaxKind.AnyKeyword]: 'any',
    [ts.SyntaxKind.ObjectKeyword]: 'object',
    [ts.SyntaxKind.BooleanKeyword]: 'boolean',
    [ts.SyntaxKind.StringKeyword]: 'string',
    [ts.SyntaxKind.NumberKeyword]: 'number'
}

const is = (kind: ts.SyntaxKind) => (node: ts.Node): boolean => node.kind === kind;
const isNot = (kind: ts.SyntaxKind) => (node: ts.Node): boolean => node.kind !== kind;
const merge = (a: any, b: any): any => [...a, ...b];
const isVisibility = (node: ts.Modifier): boolean => !!VisibilityMap[node.kind];
const isReadonly = (node: ts.PropertyDeclaration): boolean => !!node.modifiers &&
    !!node.modifiers.filter(node => node.kind === ts.SyntaxKind.ReadonlyKeyword).length;
const isBaseType = (node: ts.TypeNode): boolean => !!BaseTypeMap[node.kind];
const isParameterOptional = (node: ts.ParameterDeclaration) => !!node.questionToken;
const hasParameterComment = (node: ts.ParameterDeclaration) =>
    (tag: ts.JSDocParameterTag): boolean => node.name.getText() === tag.name.getText();
const mergeAccessors = (node: ts.ClassDeclaration, isInternal: boolean): IAccessor[] =>
    merge(crawlForGetAccessors(isInternal)(node), crawlForSetAccessors(isInternal)(node));
const hasPublicVisibility = (node: TDeclarationVariants) => VisibilityMap[ts.SyntaxKind.PublicKeyword] === extractVisibility(node);

const typescriptCompilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2015
}

function runDiagnosticsForProgram(program: ts.Program): IParserLog {
    const compilerDiagnostics = program.getSemanticDiagnostics();

    if (compilerDiagnostics.length === 0) {
        return null;
    }

    const log: IParserLog = {}

    compilerDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
        const message = `${ts.flattenDiagnosticMessageText(diagnostic.messageText, EOL)}`;

        if (!diagnostic.file) {
            log.warnings = [
                ...(log.warnings || []),
                message
            ]

            return;
        }

        const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const locatedMessage = `(${location.line + 1}:${location.character + 1}) ${message}`;

        log.warnings = [
            ...(log.warnings || []),
            locatedMessage
        ]
    });

    return log;
}

function createTypeString(node: ts.TypeNode, extractAsync: boolean = false): string {
    if (!node) {
        return extractAsync
            ? `Promise<${BaseTypeMap[ts.SyntaxKind.VoidKeyword]}>`
            : BaseTypeMap[ts.SyntaxKind.VoidKeyword]
    }

    if (isBaseType(node)) {
        return BaseTypeMap[node.kind];
    }

    if (is(ts.SyntaxKind.TypeReference)(node)) {
        const typeReferenceNode = <ts.TypeReferenceNode>node;
        return typeReferenceNode.typeName.getText();
    }

    if (is(ts.SyntaxKind.ArrayType)(node)) {
        const arrayTypeNode = <ts.ArrayTypeNode>node;

        if (isBaseType(arrayTypeNode.elementType)) {
            return BaseTypeMap[arrayTypeNode.elementType.kind] + '[]';
        }
        const typeReferenceNode = <ts.TypeReferenceNode>arrayTypeNode.elementType;
        return typeReferenceNode.typeName.getText() + '[]';
    }

    if (is(ts.SyntaxKind.UnionType)(node)) {
        return (<ts.UnionTypeNode>node)
            .types
            .map((type: ts.TypeNode) => createTypeString(type, extractAsync))
            .join('|');
    }

    return null;
}

function createTag(node: ts.JSDocTag): ITag {
    return {
        name: node.tagName.text,
        description: node.comment as string || null
    };
}

function createParameter(node: ts.ParameterDeclaration, jsDocNode: ts.JSDocParameterTag = null): IParameter {
    return {
        name: node.name.getText(),
        description: !!jsDocNode ? jsDocNode.comment as string || null : null,
        type: createTypeString(node.type),
        isOptional: isParameterOptional(node)
    };
}

function createFunction(node: ts.MethodDeclaration | ts.FunctionDeclaration): IFunction {
    return {
        name: node.name ? node.name.getText() : '',
        description: extractDescription(node),
        tags: extractTags(node),
        parameters: extractParameters(node),
        returnType: extractReturnValue(node),
        extractAsync: extractAsync(node)
    }
}

function createMethod(isInternal = false) {
    return function (node: ts.MethodDeclaration): IMethod {
        const isMethodInScope = isInternal !== hasPublicVisibility(node);

        if (isMethodInScope) {
            return {
                ...createFunction(node),
                visibility: extractVisibility(node)
            };
        }

        return;
    }
}

function createClass(isInternal = false) {
    return function(node: ts.ClassDeclaration): IClass {
        const commonClassOutput = {
            name: node.name ? node.name.getText() : '',
            properties: crawlForProperty(isInternal)(node),
            methods: crawlForMethods(isInternal)(node),
            accessors: mergeAccessors(node, isInternal)
        };

        if (isInternal) {
            return commonClassOutput;
        }

        return {
            ...commonClassOutput,
            description: extractDescription(node),
            tags: extractTags(node)
        }
    }
}

function createAccessors(isInternal = false) {
    return function(node: ts.AccessorDeclaration): IAccessor {
        const isAccessorInScope = isInternal !== hasPublicVisibility(node);

        if (isAccessorInScope) {
            return {
                name: node.name ? node.name.getText() : '',
                description: extractDescription(node),
                parameters: extractParameters(node),
                returnType: extractReturnValue(node),
                accessorType: AccessorsMap[node.kind],
                visibility: extractVisibility(node)
            }
        }

        return;
    }
}

function createProperty(isInternal = false) {
    return function (node: ts.PropertyDeclaration): IProperty {
        const isPropertyInScope = isInternal !== hasPublicVisibility(node);

        if (isPropertyInScope) {
            return {
                name: node.name ? node.name.getText() : '',
                description: extractDescription(node),
                returnType: extractReturnValue(node),
                visibility: extractVisibility(node),
                isReadonly: isReadonly(node)
            };
        }

        return;
    }
}

function createCrawler<O, I extends ts.Node = ts.Node>(
    kind: ts.SyntaxKind,
    creator: (node: ts.Node) => O,
    filter: (node: ts.Node) => boolean = () => true
) {
    return function crawler(node: I): O[] {
        const children = node
            .getChildren();

        const results = children
            .filter(is(kind))
            .filter(filter)
            .map(creator);

        return children
            .map(crawler)
            .reduce(merge, results)
            .filter(item => Boolean(item));
    }
}

const crawlForFunctions = createCrawler<IFunction, ts.SourceFile>(
    ts.SyntaxKind.FunctionDeclaration,
    createFunction
);

const crawlForMethods = (isInternal: boolean) => createCrawler<IMethod, ts.ClassDeclaration>(
    ts.SyntaxKind.MethodDeclaration,
    createMethod(isInternal)
);

const crawlForClasses = (isInternal = false) => createCrawler<IClass, ts.SourceFile>(
    ts.SyntaxKind.ClassDeclaration,
    createClass(isInternal)
);

const crawlForProperty = (isInternal: boolean) => createCrawler<IProperty, ts.ClassDeclaration>(
    ts.SyntaxKind.PropertyDeclaration,
    createProperty(isInternal)
);

const crawlForGetAccessors = (isInternal: boolean) => createCrawler<IAccessor, ts.ClassDeclaration>(
    ts.SyntaxKind.GetAccessor,
    createAccessors(isInternal)
);

const crawlForSetAccessors = (isInternal: boolean) => createCrawler<IAccessor, ts.ClassDeclaration>(
    ts.SyntaxKind.SetAccessor,
    createAccessors(isInternal)
);

function extractVisibility(node: TDeclarationVariants): string {
    if (!node.modifiers) {
        return VisibilityMap[ts.SyntaxKind.PublicKeyword];
    }

    const visibility = node
        .modifiers
        .find(isVisibility);

    if (!visibility) {
        return VisibilityMap[ts.SyntaxKind.PublicKeyword];
    }

    return VisibilityMap[visibility.kind];
}

function extractReturnValue(node: TDeclarationVariants): string {
    return createTypeString(node.type, extractAsync(node));
}

function extractAsync(node: TDeclarationVariants): boolean {
    if (!node.modifiers) {
        return false;
    }

    return !!node
        .modifiers
        .find(is(ts.SyntaxKind.AsyncKeyword));
}

function extractParameters(node: ts.MethodDeclaration | ts.FunctionDeclaration | ts.AccessorDeclaration): IParameter[] {
    const parameterTags = <ts.JSDocParameterTag[]>ts
        .getAllJSDocTagsOfKind(node, ts.SyntaxKind.JSDocParameterTag);

    return node
        .parameters
        .map((parameterNode: ts.ParameterDeclaration) =>
            createParameter(parameterNode, parameterTags.find(hasParameterComment(parameterNode)))
        );
}

function extractTags(node: ts.Node): ITag[] {
    return ts
        .getJSDocTags(node)
        .filter(isNot(ts.SyntaxKind.JSDocParameterTag))
        .map(createTag);
}

function extractDescription(node: ts.Node): string {
    const commentNode = <ts.JSDoc>node
        .getChildren()
        .find(is(ts.SyntaxKind.JSDocComment));

    if (!commentNode) {
        return null;
    }

    return commentNode.comment as string || null;
}

export const parse: TParser<ITypescriptExternalApi, ITypescriptInternalApi> = async (file: string): Promise<IParserOutput<ITypescriptExternalApi, ITypescriptInternalApi>> => {
    if (!file) {
        return null;
    }

    try {
        const program = ts.createProgram([file], typescriptCompilerOptions);
        const log = runDiagnosticsForProgram(program);
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            return {
                disabledSnifferRules: null,
                content: null,
                api: {
                    external: null,
                    internal: null
                },
                log: {
                    ...log,
                    errors: [
                        ...log.errors,
                        'Error retrieving source file.'
                    ]
                }
            }
        }

        return {
            disabledSnifferRules: snifferDisabledRules(sourceFile.text),
            content: null,
            api: {
                external: {
                    classes: crawlForClasses()(sourceFile),
                    functions: crawlForFunctions(sourceFile)
                },
                internal: {
                    classes: crawlForClasses(true)(sourceFile)
                }
            },
            log
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
