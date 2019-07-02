const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-typescript-component-structure';
    }

    test(data) {
        data.components.forEach(component => {
            const { files } = component;

            if (files.typescript.exists) {
                if (!component.files.typescript.api.external) {
                    return;
                }

                const { typescript } = component.files;
                const { external } = typescript.api;
                const { classes } = external;
                const { name: typescriptFileName } = typescript;
                const { type, name, path } = component;

                if (name !== typescriptFileName.slice(0, typescriptFileName.lastIndexOf('.ts'))) {
                    this.outcome.addError(`There is wrong name of typescript file in ${type} ${bold(name)}:\n${dim(path)}`);
                }

                classes.forEach(singleClass => {
                    const { name: className } = singleClass;
                    const letterArray = className.split('');
                    const convertedLetterArray = letterArray.map(letter => (/^[A-Z]/.test(letter)) ? `-${letter.toLowerCase()}` : letter);
                    const convertedClassName = convertedLetterArray.join('').slice(1);

                    if (name !== convertedClassName) {
                        this.outcome.addError(`There is wrong class name in typescript file in ${type} ${bold(name)}:\n${dim(path)}`);
                    }
                });
            }
        });
    }
};
