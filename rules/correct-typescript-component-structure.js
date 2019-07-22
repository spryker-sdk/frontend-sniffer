const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-typescript-component-structure';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;

        this.filterModulesData(data, 'typescript').forEach(component => {
            const { files, type, name, path } = component;

            if(!files.typescript.api.external) {
                return;
            }

            const { name: typescriptFileName, api } = files.typescript;
            const { classes } = api.external;


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
