const { dim, bold } = require('colors');
const { TestOutcome } = require('../api');

const name = exports.name = 'mandatory-readme';

exports.test = async (data) => {
    const result = new TestOutcome(name);

    data.components.forEach(component => {
        if (component.files.readme.exists) {
            return;
        }

        result.addError(`README.md missing in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
    });

    return result;
}
