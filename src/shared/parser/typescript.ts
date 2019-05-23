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

export interface IMethod {
    name: string,
    description: string
    tags: ITag[]
    visibility: string
    parameters: IParameter[]
    returnType: string
    isAsync: boolean
}

export interface IClass {
    name: string,
    description: string
    tags: ITag[]
    methods: IMethod[]
}

export interface ITypescriptApi {
    classes: IClass[]
}

export const VisibilityMap = {
    [ts.SyntaxKind.PublicKeyword]: 'public',
    [ts.SyntaxKind.ProtectedKeyword]: 'protected',
    [ts.SyntaxKind.PrivateKeyword]: 'private'
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
const merge = (a: any[], b: any[]): any[] => [...a, ...b];
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

function createTypeString(node: ts.TypeNode, isAsync: boolean = false): string {
    if (!node) {
        return isAsync
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
            .map((type: ts.TypeNode) => createTypeString(type, isAsync))
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

function createIMethod(node: ts.MethodDeclaration): IMethod {
    return {
        name: node.name ? node.name.getText() : '',
        description: getDescription(node),
        tags: getTags(node),
        visibility: getVisibility(node),
        parameters: getParameters(node),
        returnType: getReturnValue(node),
        isAsync: isAsync(node)
    }
}

function createIClass(node: ts.ClassDeclaration): IClass {
    return {
        name: node.name ? node.name.getText() : '',
        description: getDescription(node),
        tags: getTags(node),
        methods: crawlForMethods(node)
    }
}

function createApi(classes: IClass[]): ITypescriptApi {
    return {
        classes
    }
}

function crawl(root: ts.Node): ITypescriptApi {
    return createApi(
        crawlForClasses(root)
    )
}

function crawlForClasses(node: ts.Node): IClass[] {
    const children = node
        .getChildren();

    const Iclasss = children
        .filter(is(ts.SyntaxKind.ClassDeclaration))
        .map(createIClass);

    return children
        .map(crawlForClasses)
        .reduce(merge, Iclasss);
}

function crawlForMethods(node: ts.ClassDeclaration): IMethod[] {
    const children = node
        .getChildren();

    const Imethods = children
        .filter(is(ts.SyntaxKind.MethodDeclaration))
        .map(createIMethod);

    return children
        .map(crawlForMethods)
        .reduce(merge, Imethods);
}

function getVisibility(node: ts.MethodDeclaration): string {
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

function getReturnValue(node: ts.MethodDeclaration): string {
    return createTypeString(node.type, isAsync(node));
}

function isAsync(node: ts.MethodDeclaration | ts.FunctionDeclaration): boolean {
    if (!node.modifiers) {
        return false;
    }

    return !!node
        .modifiers
        .find(is(ts.SyntaxKind.AsyncKeyword));
}

function getParameters(node: ts.MethodDeclaration | ts.FunctionDeclaration): IParameter[] {
    const parameterTags = <ts.JSDocParameterTag[]>ts
        .getAllJSDocTagsOfKind(node, ts.SyntaxKind.JSDocParameterTag);

    return node
        .parameters
        .map((parameterNode: ts.ParameterDeclaration) =>
            createParameter(parameterNode, parameterTags.find(hasParameterComment(parameterNode)))
        );
}

function getTags(node: ts.Node): ITag[] {
    return ts
        .getJSDocTags(node)
        .filter(isNot(ts.SyntaxKind.JSDocParameterTag))
        .map(createTag);
}

function getDescription(node: ts.Node): string {
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
                external: crawl(sourceFile),
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
