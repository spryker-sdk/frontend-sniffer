const { TestOutcome } = require('../api');

const name = exports.name = 'deprecation-warning';

exports.test = async (data) => {
    const result = new TestOutcome(name);

    data.components.forEach(component => {
        if (component.isDeprecated) {
            result.addWarning(`${component.name} is deprecated`);
        }
    });

    return result;
}
