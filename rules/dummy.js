const { TestOutcome } = require('../api');

const name = exports.name = 'dummy';
exports.test = async (data) => new TestOutcome(name);
