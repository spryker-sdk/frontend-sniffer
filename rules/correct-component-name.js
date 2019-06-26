const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-component-name';
    }

    checkTwigFile(component) {
        const { twig } = component.files;
        const {name: twigFileName} = twig;
        const configDefinition = twig.api.external.definitions.filter(definition => definition.name === 'config')[0];
        const { type, name, path } = component;
        let contract;
        let configNameStringIndex;
        let configName;

        if (configDefinition) {
            contract = configDefinition.contract;
            configNameStringIndex = contract.indexOf('name:');

            if (configNameStringIndex >= 0) {
                const contractStringFromNameProperty = contract.slice(configNameStringIndex + contract.slice(configNameStringIndex).indexOf('\'') + 1);
                configName = contractStringFromNameProperty.slice(0, contractStringFromNameProperty.indexOf('\''));
            }
        }

        if (name !== twigFileName.slice(0, twigFileName.lastIndexOf('.twig'))) {
            this.outcome.addError(`There is wrong name of twig file in ${type} ${bold(name)}:\n${dim(path)}`);
        }

        if (!configDefinition) {
            this.outcome.addError(`There is no config block in twig file of ${type} ${bold(name)}:\n${dim(path)}`);
        }

        if (configNameStringIndex && configNameStringIndex < 0) {
            this.outcome.addError(`There is no name property in config block of ${type} ${bold(name)}:\n${dim(path)}`);
        }

        if (configName && configName !== name) {
            this.outcome.addError(`There is wrong name property in config block of twig file in ${type} ${bold(name)}:\n${dim(path)}`);
        }
    }

    checkScssFile(component) {
        const { sass } = component.files;
        const { mixins } = sass.api.external;
        const {name: scssFileName} = sass;
        const { type, name, path } = component;

        if (name !== scssFileName.slice(0, scssFileName.lastIndexOf('.scss'))) {
            this.outcome.addError(`There is wrong name of scss file in ${type} ${bold(name)}:\n${dim(path)}`);
        }

        mixins.forEach(mixin => {
            const { name: mixinName } = mixin;
            const indexNameInMixinName = mixinName.indexOf(name);

            if (indexNameInMixinName < 0) {
                this.outcome.addError(`There is wrong name of mixin in scss file of ${type} ${bold(name)}:\n${dim(path)}`);
            }
        });
    }

    checkTypescriptFile(component) {
        if (!component.files.typescript.api.external) {
            return
        };

        const { typescript } = component.files;
        const { external } = typescript.api;
        const { classes } = external;
        const {name: typescriptFileName} = typescript;
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

    test(data) {
        data.components.forEach(component => {
            const { files } = component;

            if (files.twig.exists) {
                this.checkTwigFile(component);
            }

            if (files.sass.exists) {
                this.checkScssFile(component);
            }

            if (files.typescript.exists) {
                this.checkTypescriptFile(component);
            }
        });
    }
};
