const excludedPatterns = [
    '!config',
    '!data',
    '!deploy',
    '!node_modules',
    '!public',
    '!test'
]

const createScanConfig = (dirs) => ({
    application: {
        dirs,
        patterns: [
            '**/Theme/default/app/*',
            ...excludedPatterns
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: true,
            onlyDirectories: false
        }
    },

    styles: {
        dirs,
        patterns: [
            '**/Theme/default/styles/settings/*',
            '**/Theme/default/styles/helpers/*',
            '**/Theme/default/styles/basics/*',
            '**/Theme/default/styles/utils/*',
            '!shared.scss',
            '!basic.scss',
            '!util.scss',
            ...excludedPatterns
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: true,
            onlyDirectories: false
        }
    },

    components: {
        dirs,
        patterns: [
            '**/Theme/default/components/atoms/*',
            '**/Theme/default/components/molecules/*',
            '**/Theme/default/components/organisms/*',
            ...excludedPatterns
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: false,
            onlyDirectories: true
        }
    }
})

exports.core = {
    scan: createScanConfig([
        './vendor/spryker-shop',
        './vendor/spryker/spryker-shop'
    ])
}

exports.project = {
    scan: createScanConfig([
        './src/Pyz/Yves'
    ])
}
