const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-z-index-variable';
    }

    test(data) {
        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files } = component;

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
                    this.outcome.addError(`Value of z-index property shouldn't be a number in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                }
            });
        });
    }
}
