const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-readme';
    }

    test(data) {
        const { errorMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;

            if (!files.readme || files.readme.exists) {
                return;
            }

            addError(errorMessage('README.md missing', type, name, path));
        });
    }
}
