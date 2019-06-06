import { dim, bold } from 'colors';
import { TRuleTest } from '../rule';
import { TestOutcome } from '../test-outcome';
import { ICollectorOutput } from '../../collector';
import { IParsedComponent } from 'src/collector/components/parser';

export const name: string = 'mandatory-readme';

export const test: TRuleTest = async (data: ICollectorOutput): Promise<TestOutcome> => {
    const result = new TestOutcome(name);

    data.components.forEach((component: IParsedComponent) => {
        if (component.files.readme.exists) {
            return;
        }

        result.addError(`README.md missing in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
    });

    return result;
}
