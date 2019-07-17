const { Rule, parseOutputFieldHelper, isSnifferDisabled } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-twig-component-structure';
    }

    test(data) {
        const { errorMessage, addError } = this.outcome;

        parseOutputFieldHelper(data.modules).forEach(component => {
            const { files, type, name, path } = component;

            if (!files.twig.exists) {
                return;
            }

            const isComponent = Boolean(type === 'atom') || Boolean(type === 'molecule') || Boolean(type === 'organism');

            if (!isComponent) {
                return;
            }

            const {
                disabledSnifferRules,
                name: twigFileName,
                content,
                api: { external: { definitions, blocks } }
            } = files.twig;

            if (isSnifferDisabled(disabledSnifferRules, this.getName())) {
                return;
            }

            const configDefinition = definitions.filter(definition => definition.name === 'config')[0];
            const shouldBlockBodyExist = blocks.length ? !blocks.filter(block => block.name === 'body').length : false;
            const extendStrings = content.match(/{%[' ']{0,}extends /);
            const configNameStringIndex  = configDefinition && configDefinition.contract.includes('name:');
            const extendsIndex = extendStrings && content.indexOf(extendStrings[0]);
            const removeAllCommentsFromString = (content, extendsIndex) => {
                const contentBeforeExtend = content.substring(0, extendsIndex);
                const contentWithoutComments = contentBeforeExtend.replace(/\{*. [^#]* \#\}(\r?\n|\r)/g, '');

                return Boolean(contentWithoutComments.length);
            };
            const isCommentsBeforeExtend = extendsIndex ? removeAllCommentsFromString(content, extendsIndex) : false;
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
                addError(errorMessage('There is wrong name of twig file in', type, name, path));
            }

            if (!configDefinition) {
                addError(errorMessage('There is no config block in twig file of', type, name, path));
            }

            if (configDefinition && !configNameStringIndex) {
                addError(errorMessage('There is no name property in config block of', type, name, path));
            }

            if (configName && configName !== name) {
                addError(errorMessage('There is wrong name property in config block of twig file in', type, name, path));
            }

            if (!extendStrings) {
                addError(errorMessage('It is no extends in twig file of', type, name, path));
            }

            if (extendsIndex && isCommentsBeforeExtend) {
                addError(errorMessage('Twig file should begin with extend in', type, name, path));
            }

            if (!isAtomicDesignEntityExtension && !isModelComponentExtension) {
                addError(errorMessage('Component template should extend atom, molecule, organism or model component', type, name, path));
            }

            if (isModelComponentExtension && shouldBlockBodyExist) {
                addError(errorMessage('If template extend model component and has blocks, block body must be in', type, name, path));
            }
        });
    }
};
