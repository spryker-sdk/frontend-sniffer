const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-twig-component-structure';
    }

    test(data) {
        parseOutputFieldHelper(data.components).forEach(component => {
            const { files, type, name, path } = component;

            if (files.twig.exists) {
                const { twig } = files;
                const { name: twigFileName, content, api } = twig;
                const configDefinition = api.external.definitions.filter(definition => definition.name === 'config')[0];
                const blocks = api.external.blocks;
                const extendStrings = content.match(/{%[' ']{0,}extends /);
                let extendsIndex;
                let configName;
                let configNameStringIndex;
                let isAtomicDesignEntityExtention;
                let isModelComponentExtention;

                if (configDefinition) {
                    const { contract } = configDefinition;
                    configNameStringIndex = contract.indexOf('name:');

                    if (configNameStringIndex >= 0) {
                        const contractStringFromNameProperty = contract.slice(configNameStringIndex + contract.slice(configNameStringIndex).indexOf('\'') + 1);
                        configName = contractStringFromNameProperty.slice(0, contractStringFromNameProperty.indexOf('\''));
                    }
                }

                if (extendStrings) {
                    extendsIndex = content.indexOf(extendStrings[0]);

                    const croppedContentFromExtends = content.slice(extendsIndex);
                    const indexOfTheEndOfExtendsString = croppedContentFromExtends.indexOf(croppedContentFromExtends.match(/%[' ']{0,}\}/)[0]);
                    const extendsString = croppedContentFromExtends.slice(0, indexOfTheEndOfExtendsString);

                    isAtomicDesignEntityExtention = /atom[' ']{0,}\(|molecule[' ']{0,}\(|organism[' ']{0,}\(/.test(extendsString);
                    isModelComponentExtention = /model[' ']{0,}\([' ']{0,}\'component/.test(extendsString);
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

                if (!extendStrings) {
                    this.outcome.addError(`It is no extends in twig file of ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                }

                if (extendsIndex) {
                    this.outcome.addError(`Twig file should begin with extend in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                }

                if (extendStrings && !isAtomicDesignEntityExtention && !isModelComponentExtention) {
                    this.outcome.addError(`Component template should extend atom, molecule, organism or model component in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                }

                if (extendStrings && isModelComponentExtention && blocks.length && !blocks.filter(block => block.name === 'body').length) {
                    this.outcome.addError(`If template extend model component and has blocks, block body must be in ${component.type} ${bold(component.name)}:\n${dim(component.path)}`);
                }
            }
        });
    }
};
