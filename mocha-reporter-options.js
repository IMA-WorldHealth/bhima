module.exports = {
  reporterEnabled : 'spec, xunit',
  xunitReporterOptions : {
    suiteName : process.env.SUITE_NAME || 'BHIMA Test',
    output : process.env.MOCHA_OUTPUT || 'xunit.xml',
  },
};
