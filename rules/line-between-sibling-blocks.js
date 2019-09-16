const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'line-between-sibling-blocks';
    }

    test(data) {
        const { formatMessage, addError } = this.outcome;
        let currentIndex = 0;
        const contentParser = content => {
            const blockRegExp = /{%[' ']{0,}(block|widget|embed)[a-zA-Z0-9 _\.\[\]\':\{\}\-\~\,\(\)\?\n\r]{1,}%}/igm;
            const includingRegExp = /{%[' ']{0,}include[a-zA-Z0-9 _\.\[\]\':\{\}\-\~\,\(\)\?\n\r]{1,}%}/igm;
            const closingTagRegExp = /{%[' ']{0,}(endblock|endwidget|endembed)[' ']{0,}%}/igm;
            const blockTags = content.match(blockRegExp);
            const includes = content.match(includingRegExp);
            const closingTags = content.match(closingTagRegExp);
            const blockTagsData = blockTags ? organizeData(content, blockTags) : null;
            const includesData = includes ? organizeData(content, includes) : null;
            const closingTagsList = closingTags ? organizeData(content, closingTags) : null;

            return {
                blockTagsData,
                includesData,
                closingTagsList,
            }
        };

        const findEntryIndex = (startIndex, content, entry) => {
            const index = content.slice(startIndex).indexOf(entry);

            return startIndex + index;
        };

        const organizeData = (content, tags) => tags.map((tag, index, arr) => {
                const entryIndex = findEntryIndex(currentIndex, content, tag);
                currentIndex = entryIndex + tag.length;

                if (index === arr.length - 1) {
                    currentIndex = 0;
                }

                return {
                    data: tag,
                    index: entryIndex,
                }
            });

        this.filterModulesData(data, 'twig').forEach(twigFileData => {
            const { files, type, name } = twigFileData;
            const { twig } = files;
            const { path, api } = twig;
            const { external } = api;
            const blockNames = (external && external.blocks) ? external.blocks : null;
            const getValidationString = (closingTagData, nextBlockData) =>
                twig.content.slice(closingTagData.index + closingTagData.data.length, nextBlockData.index);

            if (!blockNames) {
                return;
            }

            const structureData = contentParser(twig.content);
            const { blockTagsData, includesData, closingTagsList } = structureData;
            const getClosestElement = previousBlock => item => item.index > previousBlock.index;
            const checkSymbolsBetweenBlocks = (endOfTopBlock, nextBlock) => {
                if (!nextBlock) {
                    return;
                }

                const stringBetweenBlocks = getValidationString(endOfTopBlock, nextBlock);
                const countLineBreaks = 3;
                const symbolRegExp = /[a-zA-Z0-9\'\"\>]/;
                const stringsArrayLength = stringBetweenBlocks.split('\n').length;

                if (symbolRegExp.test(stringBetweenBlocks)) {
                    return;
                }

                if (stringsArrayLength < countLineBreaks) {
                    addError(formatMessage(`Please add empty line before ${nextBlock.data}`, type, name, path));
                }

                if (stringsArrayLength > countLineBreaks) {
                    addError(formatMessage(`Please remove unnecessary empty lines before ${nextBlock.data}`, type, name, path));
                }
            };

            if (closingTagsList) {
                closingTagsList.forEach(closingTagData => {
                    const closestBlock = blockTagsData.find(getClosestElement(closingTagData));
                    const closestInclude = includesData ? includesData.find(getClosestElement(closingTagData)) : null;

                    checkSymbolsBetweenBlocks(closingTagData, closestBlock);
                    checkSymbolsBetweenBlocks(closingTagData, closestInclude);
                });
            }

            if (includesData) {
                includesData.forEach(include => {
                    const closestBlock = blockTagsData.find(getClosestElement(include));
                    const closestInclude = includesData.find(getClosestElement(include));

                    checkSymbolsBetweenBlocks(include, closestBlock);
                    checkSymbolsBetweenBlocks(include, closestInclude);
                });
            }
        });
    }
};
