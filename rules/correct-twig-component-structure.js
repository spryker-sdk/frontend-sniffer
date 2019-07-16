const { dim, bold } = require('colors');
const { Rule, parseOutputFieldHelper } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-twig-component-structure';
    }

    test(data) {
        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;
            const errorMessage = message => `${message} ${type} ${bold(name)}:\\n${dim(path)}`;

            if (!files.twig.exists) {
                return;
            }

            const isComponent = Boolean(type === 'atom') || Boolean(type === 'molecule') || Boolean(type === 'organism');

            if (!isComponent) {
                return;
            }

            const { twig } = files;
            const { name: twigFileName, content, api } = twig;
            const configDefinition = api.external.definitions.filter(definition => definition.name === 'config')[0];
            const blocks = api.external.blocks;
            const shouldBlockBodyExist = blocks.length ? !blocks.filter(block => block.name === 'body').length : false;
            const extendStrings = content.match(/{%[' ']{0,}extends /);
            const configNameStringIndex  = configDefinition && configDefinition.contract.includes('name:');
            const extendsIndex = extendStrings && content.indexOf(extendStrings[0]);
            let configName;
            let isAtomicDesignEntityExtension = false;
            let isModelComponentExtension = false;

            if (configNameStringIndex) {
                const { contract } = configDefinition;
                const contractStringFromNameProperty = contract.slice(configNameStringIndex + contract.slice(configNameStringIndex).indexOf('\'') + 1);
                configName = contractStringFromNameProperty.slice(0, contractStringFromNameProperty.indexOf('\''));
            }

            if (extendStrings) {
                const croppedContentFromExtends = content.slice(extendsIndex);
                const indexOfTheEndOfExtendsString = croppedContentFromExtends.indexOf(croppedContentFromExtends.match(/%[' ']{0,}\}/)[0]);
                const extendsString = croppedContentFromExtends.slice(0, indexOfTheEndOfExtendsString);

                isAtomicDesignEntityExtension = /atom[' ']{0,}\(|molecule[' ']{0,}\(|organism[' ']{0,}\(/.test(extendsString);
                isModelComponentExtension = /model[' ']{0,}\([' ']{0,}\'component/.test(extendsString);
            }

            if (name !== twigFileName.slice(0, twigFileName.lastIndexOf('.twig'))) {
                this.outcome.addError(errorMessage('There is wrong name of twig file in'));
            }

            if (!configDefinition) {
                this.outcome.addError(errorMessage('There is no config block in twig file of'));
            }

            if (configDefinition && !configNameStringIndex) {
                this.outcome.addError(errorMessage('There is no name property in config block of'));
            }

            if (configName && configName !== name) {
                this.outcome.addError(errorMessage('There is wrong name property in config block of twig file in'));
            }

            if (!extendStrings) {
                this.outcome.addError(errorMessage('It is no extends in twig file of'));
            }

            if (extendsIndex) {
                this.outcome.addError(errorMessage('Twig file should begin with extend in'));
            }

            if (!isAtomicDesignEntityExtension && !isModelComponentExtension) {
                this.outcome.addError(errorMessage('Component template should extend atom, molecule, organism or model component'));
            }

            if (isModelComponentExtension && shouldBlockBodyExist) {
                this.outcome.addError(errorMessage('If template extend model component and has blocks, block body must be in'));
            }
        });
    }
};
