const { join } = require('path');

module.exports = {
    scan: {
        dirs: [
            join(__dirname, '../rules'),
        ],
        patterns: [
            '*.js'
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: true,
            onlyDirectories: false
        }
    },

    enable: [
        'correct-scss-component-structure',
        'correct-tag-name',
        'correct-twig-block-name',
        'correct-twig-component-structure',
        'correct-typescript-component-structure',
        'deprecation-warning',
        'line-between-sibling-blocks',
        'mandatory-object-comma',
        'mandatory-readme',
        'mandatory-z-index-variable',
    ]
};
