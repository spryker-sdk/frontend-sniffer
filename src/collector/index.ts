import { combineLatest, Observable } from 'rxjs';
import { getObservable as getApplicationObservable } from './application';
import { getObservable as getStylesObservable } from './styles';
import { getObservable as getComponentsObservable } from './components';
import { IApplicationFile } from './application/parser';
import { IStyleFile } from './styles/parser';
import { IParsedComponent } from './components/parser';
import { info } from '../log';
import { config } from './config';

export type TCollectorObservableOutput = [IApplicationFile[], IStyleFile[], IParsedComponent[]];

export interface ICollectorOutput {
    applicationFiles: IApplicationFile[]
    styleFiles: IStyleFile[]
    components: IParsedComponent[]
}

export const collect = (): Promise<ICollectorOutput> => new Promise<ICollectorOutput>((resolve, reject) => {
    info.print('\nRunning collector...');
    config.load();

    return combineLatest(
        getApplicationObservable(),
        getStylesObservable(),
        getComponentsObservable()
    ).subscribe((observableOutput: TCollectorObservableOutput) => resolve({
        applicationFiles: observableOutput[0],
        styleFiles: observableOutput[1],
        components: observableOutput[2]
    }))
})
