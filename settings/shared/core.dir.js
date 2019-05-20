const { join } = require('path');
const cwd = process.cwd();

exports.default = [
    join(cwd, '../suite-nonsplit/project/vendor/spryker/spryker-shop'),
    join(cwd, './vendor/spryker/spryker-shop'),
    join(cwd, './vendor/spryker-shop')
]
