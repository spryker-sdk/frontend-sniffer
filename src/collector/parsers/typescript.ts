import { EOL } from 'os';
import * as ts from 'typescript';
import { IParserLog, IParserOutput, TParser } from './base';

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
    name: string,
    description: string
    tags: ITag[]
    properties: any
    methods: IMethod[]
    accessors: any
}

export interface ITypescriptApi {
    classes: IClass[]
    functions: IFunction[]
}

export const VisibilityMap = {
    [ts.SyntaxKind.PublicKeyword]: 'public'
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
const isBaseType = (node: ts.TypeNode): boolean => !!BaseTypeMap[node.kind];
const isParameterOptional = (node: ts.ParameterDeclaration) => !!node.questionToken;
const hasParameterComment = (node: ts.ParameterDeclaration) =>
    (tag: ts.JSDocParameterTag): boolean => node.name.getText() === tag.name.getText();

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

        if (isBaseType(arrayTypeNode)) {
            BaseTypeMap[arrayTypeNode.elementType.kind] + '[]';
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
        description: node.comment || null
    };
}

function createParameter(node: ts.ParameterDeclaration, jsDocNode: ts.JSDocParameterTag = null): IParameter {
    return {
        name: node.name.getText(),
        description: !!jsDocNode ? jsDocNode.comment || null : null,
        type: createTypeString(node.type),
        isOptional: isParameterOptional(node)
    };
}

function createFunction(node: any): IFunction {
    return {
        name: node.name ? node.name.getText() : '',
        description: extractDescription(node),
        tags: extractTags(node),
        parameters: extractParameters(node),
        returnType: extractReturnValue(node),
        extractAsync: extractAsync(node)
    }
}

function createMethod(node: ts.MethodDeclaration): IMethod {
    return {
        ...createFunction(node),
        visibility: extractVisibility(node)
    }
}

function createClass(node: ts.ClassDeclaration): IClass {
    console.log(merge(crawlForGetAccessors(node), crawlForSetAccessors(node)));
    return {
        name: node.name ? node.name.getText() : '',
        description: extractDescription(node),
        tags: extractTags(node),
        properties: null,
        methods: crawlForMethods(node),
        accessors: merge(crawlForGetAccessors(node), crawlForSetAccessors(node))
    }
}

function createAccessors(node: ts.AccessorDeclaration): any {
    return {
        name: node.name ? node.name.getText() : '',
        description: extractDescription(node),
        parameters: extractParameters(node),
        returnType: extractReturnValue(node),
        accessorType: AccessorsMap[node.kind]
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
            .reduce(merge, results);
    }
}

const crawlForFunctions = createCrawler<IFunction, ts.SourceFile>(
    ts.SyntaxKind.FunctionDeclaration,
    createFunction
);

const crawlForMethods = createCrawler<IMethod, ts.ClassDeclaration>(
    ts.SyntaxKind.MethodDeclaration,
    createMethod
);

const crawlForClasses = createCrawler<IClass, ts.SourceFile>(
    ts.SyntaxKind.ClassDeclaration,
    createClass
);

const crawlForGetAccessors = createCrawler<any, ts.ClassDeclaration>(
    ts.SyntaxKind.GetAccessor,
    createAccessors
);

const crawlForSetAccessors = createCrawler<any, ts.ClassDeclaration>(
    ts.SyntaxKind.SetAccessor,
    createAccessors
);

function extractVisibility(node: ts.MethodDeclaration): string {
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

function extractReturnValue(node: ts.MethodDeclaration | ts.FunctionDeclaration): string {
    return createTypeString(node.type, extractAsync(node));
}

function extractAsync(node: ts.MethodDeclaration | ts.FunctionDeclaration): boolean {
    if (!node.modifiers) {
        return false;
    }

    return !!node
        .modifiers
        .find(is(ts.SyntaxKind.AsyncKeyword));
}

function extractParameters(node: ts.MethodDeclaration | ts.FunctionDeclaration): IParameter[] {
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

    return commentNode.comment || null;
}

export const parse: TParser<ITypescriptApi> = async (file: string): Promise<IParserOutput<ITypescriptApi>> => {
    if (!file) {
        return null;
    }

    try {
        const program = ts.createProgram([file], typescriptCompilerOptions);
        const log = runDiagnosticsForProgram(program);
        const sourceFile = program.getSourceFile(file);

        if (!sourceFile) {
            return {
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
            content: null,
            api: {
                external: {
                    classes: crawlForClasses(sourceFile),
                    functions: crawlForFunctions(sourceFile)
                },
                internal: null
            },
            log
        }
    } catch (error) {
        return {
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
