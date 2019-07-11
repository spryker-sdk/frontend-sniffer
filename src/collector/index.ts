import { forkJoin } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable, IStyleFilesResult } from './styles';
import { getObservable as getComponentsObservable, IParsedComponentResult } from './components';
import { getObservable as getTwigsObservable, IParsedTwigResult } from './twigs';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { IParsedTwig } from './twigs/parser';
import { info } from '../logger';
import { getModuleWrapper } from './wrappers/module';

export type TCollectorObjectFields = IStyleFilesResult | IParsedComponentResult;

export type TCollectorObservableOutput = {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFilesResult
    components: IParsedComponentResult
    twigs: IParsedTwigResult
};

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: {
        project?: IStyleFile[]
        core?: IStyleFile[]
    }
    components: {
        project?: IParsedComponent[]
        core?: IParsedComponent[]
    }
    twigs: {
        project?: IParsedTwig[]
        core?: IParsedTwig[]
    }
}

export const collect = (): Promise<ICollectorOutput> => new Promise<any>((resolve, reject) => {
    info.print('\nRunning collector...');

    return forkJoin({
        applicationFiles: getApplicationObservable(),
        styleFiles: getStylesObservable(),
        components: getComponentsObservable(),
        twigs: getTwigsObservable(),
    }).subscribe((observableOutput: TCollectorObservableOutput) => {
        const modules = getModuleWrapper(observableOutput.components, observableOutput.twigs);

        return resolve({
            applicationFiles: observableOutput.applicationFiles,
            styleFiles: observableOutput.styleFiles,
            modules: modules,
        });
    })
});
