const util = require('../../server/lib/util');
const { expect } = require('chai');
var _ = require('lodash');

const newLocal = function () {
  it('#take() should take values from one key of each object in an array of objects', () => {
    const objects = [{ id : 1 }, { id : 2 }, { id : 3 }];
    const expected = [1, 2, 3];
    var filter = util.take('id');
    var ids = _.flatMap(objects, filter);
    expect(ids).to.deep.equal(expected);
  });

  it('#requireModuleIfExists() should require module if it exists', () => {
    var exists = util.loadModuleIfExists('chai');
    expect(exists).to.equal(true);
  });

  it('#dateFormatter() should format each javascript datetime value in a array of objects', () => {
    const rows = [
      { name : 'alice', dob : new Date('2015-03-25') },
      { name : 'bob', dob : new Date('2015-03-30') },
    ];
    const expected = [
      { name : 'alice', dob : '25/03/2015' },
      { name : 'bob', dob : '30/03/2015' },
    ];

    const dateFormat = 'DD/MM/YYYY';
    const formated = util.dateFormatter(rows, dateFormat);
    expect(formated).to.deep.equal(expected);
  });

// resolveObject

};

describe('util.js', newLocal);
