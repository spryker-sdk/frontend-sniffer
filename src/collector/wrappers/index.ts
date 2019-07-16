import { IParsedTemplates } from '../templates/parser';
import { IParsedComponent } from '../components/parser';
import { IParsedViewsResult } from '../views';

export interface IParsedModules {
    project?: {
        [key: string]: IParsedModulesByName
    }
    core?: {
        [key: string]: IParsedModulesByName
    }
}

interface IParsedModulesByName {
    template?: IParsedTemplates[]
    molecule?: IParsedComponent[]
    atom?: IParsedComponent[]
    organism?: IParsedComponent[]
    view?: IParsedViewsResult[]
}

type TModulePart = IParsedTemplates[] | IParsedComponent[] | IParsedViewsResult[];

export function getModuleWrapper(components, templates, views): IParsedModules {
    let modules: IParsedModules = {};
    const moduleCreation = (modulePart: TModulePart) => {
        const moduleLevels: string[] = Object.keys(modulePart);
        const modulesByName = (modulesByLevel, moduleLevel) =>  modulesByLevel.forEach((moduleByLevel) => {
            const moduleName: string = moduleByLevel['module'];
            const moduleType: string = moduleByLevel['type'];
            const isModulesByNameExist: boolean = modules[moduleLevel] && modules[moduleLevel][moduleName];
            const isModulesByTypeExist: boolean = isModulesByNameExist && modules[moduleLevel][moduleName][`${moduleType}s`];
            const moduleByLevelData: IParsedModules = modules[moduleLevel] ? modules[moduleLevel] : [];
            const moduleByNameData: IParsedModulesByName = isModulesByNameExist ? modules[moduleLevel][moduleName] : [];
            const moduleByTypeData: TModulePart = isModulesByTypeExist ? modules[moduleLevel][moduleName][`${moduleType}s`]: [];

            modules = {
                ...modules,
                [moduleLevel]: {
                   ...moduleByLevelData,
                   [moduleName]: {
                       ...moduleByNameData,
                       [`${moduleType}s`]: [
                           ...moduleByTypeData,
                           { ...moduleByLevel }
                       ]
                   }
                }
            }
        });

        moduleLevels.forEach((moduleLevel: string) => modulesByName(modulePart[moduleLevel], moduleLevel));
    };

    moduleCreation(components);
    moduleCreation(templates);
    moduleCreation(views);

    return modules;
}
