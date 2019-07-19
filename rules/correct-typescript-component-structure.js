const { Rule, parseOutputFieldHelper, isSnifferDisabled } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-typescript-component-structure';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;

            if (!files.typescript || !files.typescript.exists || !files.typescript.api.external) {
                return;
            }

            const { name: typescriptFileName, disabledSnifferRules, api } = files.typescript;
            const { classes } = api.external;

            if (isSnifferDisabled(disabledSnifferRules, this.getName())) {
                return;
            }


            if (name !== typescriptFileName.slice(0, typescriptFileName.lastIndexOf('.ts'))) {
                addError(formatMessage('There is wrong name of typescript file in', type, name, path));
            }

            classes.forEach(singleClass => {
                const { name: className } = singleClass;
                const camelCaseToDash = string => string.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                const convertedClassName = camelCaseToDash(className);

                if (name !== convertedClassName) {
                    addError(formatMessage('There is wrong class name in typescript file in', type, name, path));
                }
            });
        });
    }
};
