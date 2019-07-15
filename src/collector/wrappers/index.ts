import { IParsedTemplates } from '../templates/parser';
import { IParsedComponent } from '../components/parser';
import { IParsedViewsResult } from '../views';

export interface IParsedModules {
    project?: {
        [key: string]: {
            template?: IParsedTemplates[]
            molecule?: IParsedComponent[]
            atom?: IParsedComponent[]
            organism?: IParsedComponent[]
            view?: IParsedViewsResult[]
        }
    }
    core?: {
        [key: string]: {
            template?: IParsedTemplates[]
            molecule?: IParsedComponent[]
            atom?: IParsedComponent[]
            organism?: IParsedComponent[]
            view?: IParsedViewsResult[]
        }
    }
}

export function getModuleWrapper(components, templates, views): IParsedModules {
    let modules = {};
    const moduleCreation = (modulePart) => {
        const moduleLevels = Object.keys(modulePart);
        const modulesByName = (modulesByLevel, moduleLevel) =>  modulesByLevel.forEach((moduleByLevel) => {
            const moduleName = moduleByLevel['module'];
            const moduleType = moduleByLevel['type'];
            const isModulesByNameExist = modules[moduleLevel] && modules[moduleLevel][moduleName];
            const isModulesByTypeExist = isModulesByNameExist && modules[moduleLevel][moduleName][`${moduleType}s`];
            const moduleByLevelData = modules[moduleLevel] ? modules[moduleLevel] : [];
            const moduleByNameData = isModulesByNameExist ? modules[moduleLevel][moduleName] : [];
            const moduleByTypeData = isModulesByTypeExist ? modules[moduleLevel][moduleName][`${moduleType}s`]: [];

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

        moduleLevels.forEach(moduleLevel => modulesByName(modulePart[moduleLevel], moduleLevel));
    };

    moduleCreation(components);
    moduleCreation(templates);
    moduleCreation(views);

    return modules;
}
