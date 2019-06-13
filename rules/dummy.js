const { Rule } = require('../api');

module.exports = class extends Rule {
    getName() {
        return 'dummy';
    }

    test(data) { }
}
