const xlsx = require('../../server/lib/renderers/xlsx');

const { expect } = require('chai');
const _ = require('lodash');

describe('util.js', () => {

  it('Shoul return a xlsx buffer', (done) => {
    const data = {
      rows : [{ Firstname : 'Alice', Lastname : 'Bob' }],
    };
    xlsx.render(data)
      .then(reportStream => {
        expect(_.isBuffer(reportStream)).to.be.equal(true);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Shoul works for an empty object', (done) => {
    const data = {};
    xlsx.render(data)
      .then(reportStream => {
        expect(_.isBuffer(reportStream)).to.be.equal(true);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});
