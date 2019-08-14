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
            let blockTagsData = blockTags;
            let includesData = includes;
            let closingTagsData = closingTags;


            if (blockTags) {
                blockTagsData = organizeData(content, blockTags);
            }

            if (includes) {
                includesData = organizeData(content, includes);
            }

            if (closingTags) {
                closingTagsData = organizeData(content, closingTags);
            }

            return {
                blockTagsData: blockTagsData,
                includesData: includesData,
                closingTagsData: closingTagsData,
            }
        };

        const findEntryIndex = (startIndex, content, entry) => {
            const index = content.slice(startIndex).indexOf(entry);

            return startIndex + index;
        };

        const organizeData = (content, tags) => {
            return tags.map((tag, index, arr) => {
                const entryIndex = findEntryIndex(currentIndex, content, tag);
                currentIndex = entryIndex + tag.length;

                if (index === arr.length - 1) {
                    currentIndex = 0;
                }

                return {
                    data: tag,
                    index: entryIndex,
                }
            })
        };

        this.filterModulesData(data, 'twig').forEach(twigFileData => {
            const { files, type, name } = twigFileData;
            const { twig } = files;
            const { path, api } = twig;
            const { external } = api;
            const blockNames = (external && external.blocks) ? external.blocks : null;
            const getValidationString = (closingTagData, nextBlockData) => {
                return files.twig.content.slice(closingTagData.index + closingTagData.data.length, nextBlockData.index);
            };

            if (!blockNames) {
                return;
            }

            const structureData = contentParser(files.twig.content);
            const {blockTagsData, includesData, closingTagsData} = structureData;
            const getClosestElement = (previousBlock) => {
                return item => item.index > previousBlock.index;
            };
            const checkSymbolsBetweenBlocks = (endOfTopBlock, nextBlock) => {
                if (!nextBlock) {
                    return;
                }

                const betweenBlocksString = getValidationString(endOfTopBlock, nextBlock);
                const countLineBreaks = 3;

                if (/[a-zA-Z0-9\'\"\>]/.test(betweenBlocksString)) {
                    return;
                }

                if (betweenBlocksString.split('\n').length < countLineBreaks) {
                    addError(formatMessage(`Please add empty line before ${nextBlock.data}`, type, name, path));
                }

                if (betweenBlocksString.split('\n').length > countLineBreaks) {
                    addError(formatMessage(`Please remove unnecessary empty lines before ${nextBlock.data}`, type, name, path));
                }
            };

            if (!closingTagsData && !includesData) {
                return;
            }

            if (closingTagsData) {
                closingTagsData.forEach(closingTagData => {
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
