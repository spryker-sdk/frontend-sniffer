import {IFile} from "../file";
import { IComponent } from '../components/component';

export interface IStructureObject<M extends IComponent = IComponent> {
    atoms: M[],
    molecules: M[],
    organisms: M[],
    templates: any,
    views: any,
}

export function getModuleWrapper(components, templates) {
    const keys = Object.keys(components);
    const modules = {};

    keys.forEach(key => {
        const modulesObject = {};
        const wrapStructureToObject = (structures, obj) => {
            structures[key].forEach(structure => {
                const { module: moduleName, type } = structure;

                if (!obj[moduleName] && type) {
                    obj[moduleName] = {
                        atoms: [],
                        molecules: [],
                        organisms: [],
                        templates: [],
                        views: [],
                    };

                    obj[moduleName][`${type}s`].push(structure);
                }
            });

            return obj
        };

        wrapStructureToObject(components, modulesObject);
        wrapStructureToObject(templates, modulesObject);

        modules[key] = [...Object.keys(modulesObject).reduce((accumulator, currentModuleName) => {
            accumulator.push({[currentModuleName]: modulesObject[currentModuleName]});

            return accumulator
        }, [])]
    });

    return modules;
}
