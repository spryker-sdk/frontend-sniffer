const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'deprecation-warning';
    }

    test(data) {
        parseOutputFieldHelper(data.components).forEach(component => {
            if (component.isDeprecated) {
                this.outcome.addWarning(`${component.name} is deprecated`);
            }
        });
    }
}
