const excludedPatterns = [
    '!config',
    '!data',
    '!deploy',
    '!node_modules',
    '!public',
    '!test'
]

const createScanConfig = (dirs, cwdPattern) => ({
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
            `${cwdPattern}Theme/default/styles/settings/*`,
            `${cwdPattern}Theme/default/styles/helpers/*`,
            `${cwdPattern}Theme/default/styles/basics/*`,
            `${cwdPattern}Theme/default/styles/utils/*`,
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
            `${cwdPattern}Theme/default/components/atoms/*`,
            `${cwdPattern}Theme/default/components/molecules/*`,
            `${cwdPattern}Theme/default/components/organisms/*`,
            ...excludedPatterns
        ],
        options: {
            followSymlinkedDirectories: false,
            absolute: true,
            onlyFiles: false,
            onlyDirectories: true
        }
    },

    views: {
        dirs,
        patterns: [
            '**/Theme/default/views/*',
            '**/Theme/default/templates/*',
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
    scan: createScanConfig(['./'], '**/vendor/**/spryker-shop/**/')
}

exports.project = {
    scan: createScanConfig(['./'], '**/src/Pyz/Yves/**/')
}
