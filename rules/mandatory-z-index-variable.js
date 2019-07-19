const { Rule, parseOutputFieldHelper, isSnifferDisabled } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'mandatory-z-index-variable';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;

            if (!files.sass || !files.sass.exists) {
                return;
            }

            const { disabledSnifferRules, content } = files.sass;

            if (isSnifferDisabled(disabledSnifferRules, this.getName())) {
                return;
            }

            const zIndexRegularExpression = /z-index:[\sA-Za-z0-9-\+\$]+[;}]/gi;
            const zIndexRules = content.match(zIndexRegularExpression);

            if (!zIndexRules) {
                return;
            }

            zIndexRules.forEach(rule => {
                const zIndexValue = rule.slice(rule.indexOf(':') + 1);

                if (!isNaN(parseInt(zIndexValue))) {
                    addError(formatMessage('Value of z-index property shouldn\'t be a number in', type, name, path));
                }
            });
        });
    }
}
