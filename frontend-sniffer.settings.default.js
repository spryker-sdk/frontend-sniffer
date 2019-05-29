const { join } = require('path');

exports.root = join(process.cwd(), '../suite-nonsplit/project');

const defaultDirs = [
    join(exports.root, './vendor/spryker/spryker-shop'),
    join(exports.root, './vendor/spryker-shop')
]

const excludedPatterns = [
    '!config',
    '!data',
    '!deploy',
    '!node_modules',
    '!public',
    '!test'
]

exports.core = {}
exports.core.global = {}
exports.core.global.application = {
    dirs: [
        ...defaultDirs
    ],
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
}
exports.core.global.style = {
    dirs: [
        ...defaultDirs
    ],
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
}
exports.core.component = {
    dirs: [
        ...defaultDirs
    ],
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

exports.project = {}
exports.project.global = {}
exports.project.global.application = {}
exports.project.global.style = {}
exports.project.components = {}
