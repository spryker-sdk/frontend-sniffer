const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-typescript-component-structure';
    }

    test(data) {
        parseOutputFieldHelper(data.components).forEach(component => {
            const { files, type, name, path } = component;

            if (files.typescript.exists) {
                if (!component.files.typescript.api.external) {
                    return;
                }

                const { typescript } = component.files;
                const { external } = typescript.api;
                const { classes } = external;
                const { name: typescriptFileName } = typescript;

                if (name !== typescriptFileName.slice(0, typescriptFileName.lastIndexOf('.ts'))) {
                    this.outcome.addError(`There is wrong name of typescript file in ${type} ${bold(name)}:\n${dim(path)}`);
                }

                classes.forEach(singleClass => {
                    const { name: className } = singleClass;
                    const camelCaseToDash = string => string.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                    const convertedClassName = camelCaseToDash(className);

                    if (name !== convertedClassName) {
                        this.outcome.addError(`There is wrong class name in typescript file in ${type} ${bold(name)}:\n${dim(path)}`);
                    }
                });
            }
        });
    }
};
