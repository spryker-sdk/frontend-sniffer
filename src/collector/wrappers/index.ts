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
        const levels = Object.keys(modulePart);
        const modulesByName = (modulesByLevel, level) =>  modulesByLevel.forEach((moduleByLevel) => {
            const moduleName = moduleByLevel['module'];
            const moduleType = moduleByLevel['type'];
            const isModulesByNameExist = modules[level] && modules[level][moduleName];
            const isModulesByTypeExist = isModulesByNameExist && modules[level][moduleName][moduleType];
            const moduleByLevelData = modules[level] ? modules[level] : [];
            const moduleByNameData = isModulesByNameExist ? modules[level][moduleName] : [];
            const moduleByTypeData = isModulesByTypeExist ? modules[level][moduleName][moduleType]: [];

            modules = {
                ...modules,
                [level]: {
                   ...moduleByLevelData,
                   [moduleName]: {
                       ...moduleByNameData,
                       [moduleType]: [
                           ...moduleByTypeData,
                           {...moduleByLevel}
                       ]
                   }
                }
            }
        });

        levels.forEach(level => modulesByName(modulePart[level], level));
    };
    moduleCreation(components);
    moduleCreation(templates);
    moduleCreation(views);

    return modules;
}
