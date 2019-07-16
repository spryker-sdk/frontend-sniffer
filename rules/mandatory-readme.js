const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-readme';
    }

    test(data) {
        parseOutputFieldHelper(data.modules).forEach(component => {
            if (!component.files.readme || component.files.readme.exists) {
                return;
            }

            this.outcome.addError(`README.md missing in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
        });
    }
}
