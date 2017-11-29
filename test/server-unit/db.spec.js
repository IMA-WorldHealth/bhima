const path = require('path');

const env = path.resolve(__dirname, '../../.env.development');

require('dotenv').config({ path : env });

const db = require('../../server/lib/db');

const { expect } = require('chai');

const _ = require('lodash');

// console.log(process.env);

const dbTest = function () {

  it('Should check the connection to mysql', function (done) {
    var fx = db.pool.getConnection(function (err, result) {
      if (err) {
        done(err);
        return;
      }
      expect(true).to.equal(true);
      done();
    });

  });

  it('#Should try to retrieve data from a specific table (unit)', function (done) {
     db.exec('SELECT * FROM unit LIMIT 2', {})
      .then((rows) => {
        expect(rows).to.have.lengthOf(2);
        done();
        return;
      })
      .catch((error) => {
       done(error);
       return;
      });
  });

};

describe('db/index.js', dbTest);
