import { forkJoin } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable, IStyleFilesResult } from './styles';
import { getObservable as getComponentsObservable, IParsedComponentResult } from './components';
import { getObservable as getTemplatesObservable, IParsedTemplatesResult } from './templates';
import { getObservable as getViewsObservable, IParsedViewsResult } from './views';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { getModuleWrapper, IParsedModules } from './wrappers';
import { info } from '../logger';

export type TCollectorObjectFields = IStyleFilesResult | IParsedComponentResult;

export type TCollectorObservableOutput = {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFilesResult
    components: IParsedComponentResult
    templates: IParsedTemplatesResult
    views: IParsedViewsResult
};

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: {
        project?: IStyleFile[]
        core?: IStyleFile[]
    }
    modules: IParsedModules
}

export const collect = (): Promise<ICollectorOutput> => new Promise<any>((resolve, reject) => {
    info.print('\nRunning collector...');

    return forkJoin({
        applicationFiles: getApplicationObservable(),
        styleFiles: getStylesObservable(),
        components: getComponentsObservable(),
        templates: getTemplatesObservable(),
        views: getViewsObservable(),
    }).subscribe((observableOutput: TCollectorObservableOutput) => {
        const { components, templates, views } = observableOutput;
        const modules = getModuleWrapper(components, templates, views);

        return resolve({
            applicationFiles: observableOutput.applicationFiles,
            styleFiles: observableOutput.styleFiles,
            modules
        });
    })
});
