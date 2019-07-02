const { dim, bold } = require('colors');
const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'correct-twig-component-structure';
    }

    test(data) {
        data.components.forEach(component => {
            const { files } = component;

            if (files.twig.exists) {
                const { twig } = files;
                const { name: twigFileName } = twig;
                const configDefinition = twig.api.external.definitions.filter(definition => definition.name === 'config')[0];
                const { type, name, path } = component;
                let configName;
                let configNameStringIndex;

                if (configDefinition) {
                    const { contract } = configDefinition;
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

                    return;
                }

                if (configNameStringIndex && configNameStringIndex < 0) {
                    this.outcome.addError(`There is no name property in config block of ${type} ${bold(name)}:\n${dim(path)}`);

                    return;
                }

                if (configName && configName !== name) {
                    this.outcome.addError(`There is wrong name property in config block of twig file in ${type} ${bold(name)}:\n${dim(path)}`);
                }
            }
        });
    }
};
