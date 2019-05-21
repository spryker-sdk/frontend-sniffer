import { join, dirname, basename } from 'path';
import { IFile, getFile } from '../shared/file';

export enum EComponentType {
    Atom = 'atom',
    Molecule = 'molecule',
    Organism = 'organism'
}

export interface IComponent<M extends IFile = IFile, W extends IFile = IFile, S extends IFile = IFile, T extends IFile = IFile> {
    namespace: string
    path: string
    name: string
    type: EComponentType
    module: string
    isDeprecated: boolean
    deprecationNote?: string
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

export function getComponent(path: string): IComponent {
    const name = basename(path);
    const deprecated = getFile(join(path, 'DEPRECATED.md'));

    return {
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
            twig: getFile(join(path, `${name}.twig`)),
            sass: getFile(join(path, `${name}.scss`)),
            typescript: getFile(join(path, `${name}.ts`))
        }
    }
}
