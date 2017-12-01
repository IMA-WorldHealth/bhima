/* eslint global-require:off */
const { expect } = require('chai');

function DatabaseUnitTests() {
  let db;
  before(() => {
    db = require('../../server/lib/db');
  });


  it('should check the connection to mysql', (done) => {
    db.pool.getConnection(err => {
      if (err) {
        done(err);
        return;
      }
      expect(true).to.equal(true);
      done();
    });
  });

  it('#should try to retrieve data from a specific table (unit)', (done) => {
    db.exec('SELECT * FROM unit LIMIT 2')
      .then(rows => {
        expect(rows).to.have.lengthOf(2);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
}

describe('lib/db/index.js', DatabaseUnitTests);
