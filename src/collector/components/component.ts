import { readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, dirname, basename } from 'path';
import { IFile, getFile } from '../file';

export enum EComponentType {
    Atom = 'atom',
    Molecule = 'molecule',
    Organism = 'organism'
}

export interface IComponent<M extends IFile = IFile, W extends IFile = IFile, S extends IFile = IFile, T extends IFile = IFile> {
    id: string
    namespace: string
    path: string
    name: string
    type: EComponentType
    module: string
    isDeprecated: boolean
    files: {
        _index: IFile
        _style: IFile
        deprecated: M
        readme: M
        twig: W
        sass: S
        typescript: T
    }
}

export function extractCorrectTwigFileName(defaultFileName: string, directoryFiles: string[]) {
    const twigFileNameInComponent = directoryFiles.filter(fileName => fileName.includes('.twig'))[0];
    if (!directoryFiles.includes(defaultFileName) && twigFileNameInComponent) {
        return twigFileNameInComponent;
    }

    return defaultFileName;
}

export function extractCorrectScssFileName(defaultFileName: string, directoryFiles: string[]) {
    const scssFileNameInComponent = directoryFiles.filter(fileName =>
        fileName.includes('.scss') && fileName !== 'style.scss'
    )[0];

    if (!directoryFiles.includes(defaultFileName) && scssFileNameInComponent) {
        return scssFileNameInComponent;
    }

    return defaultFileName;
}

function extractCorrectScriptFileName(defaultFileName: string, directoryFiles: string[]) {
    const scriptFileNameInComponent = directoryFiles.filter(fileName =>
        fileName.includes('.ts') && fileName !== 'index.ts'
    )[0];

    if (!directoryFiles.includes(defaultFileName) && scriptFileNameInComponent) {
        return scriptFileNameInComponent;
    }

    return defaultFileName;
}

export function getComponent(path: string): IComponent {
    const name = basename(path);
    const deprecated = getFile(join(path, 'DEPRECATED.md'));
    const directoryFiles = readdirSync(path);

    return {
        id: createHash('md5').update(path).digest('hex'),
        namespace: 'SprykerShop',
        path,
        name,
        type: <EComponentType>basename(dirname(path)).slice(0, -1),
        module: basename(join(path, '../../../../..')),
        isDeprecated: deprecated.exists,
        files: {
            _index: getFile(join(path, 'index.ts')),
            _style: getFile(join(path, 'style.scss')),
            deprecated,
            readme: getFile(join(path, 'README.md')),
            twig: getFile(join(path, extractCorrectTwigFileName(`${name}.twig`, directoryFiles))),
            sass: getFile(join(path, extractCorrectScssFileName(`${name}.scss`, directoryFiles))),
            typescript: getFile(join(path, extractCorrectScriptFileName(`${name}.ts`, directoryFiles))),
        }
    }
}
