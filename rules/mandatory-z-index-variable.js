const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-z-index-variable';
    }

    test(data) {
        const { defaultErrorMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;

            if (!files.sass || !files.sass.exists) {
                return;
            }

            const { sass } = files;
            const zIndexRegularExpression = /z-index:[\sA-Za-z0-9-\+\$]+[;}]/gi;
            const zIndexRules = sass.content.match(zIndexRegularExpression);

            if (!zIndexRules) {
                return;
            }

            zIndexRules.forEach(rule => {
                const zIndexValue = rule.slice(rule.indexOf(':') + 1);

                if (!isNaN(parseInt(zIndexValue))) {
                    addError(defaultErrorMessage('Value of z-index property shouldn\'t be a number in', type, name, path));
                }
            });
        });
    }
}
