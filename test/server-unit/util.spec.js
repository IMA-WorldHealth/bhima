const util = require('../../server/lib/util');

const { expect } = require('chai');
const _ = require('lodash');

describe('util.js', () => {
  it('#take() should take values from one key of each object in an array of objects', () => {
    const objects = [{ id : 1 }, { id : 2 }, { id : 3 }];
    const expected = [1, 2, 3];
    const filter = util.take('id');
    const ids = _.flatMap(objects, filter);
    expect(ids).to.deep.equal(expected);
  });

  it('#requireModuleIfExists() should require module if it exists', () => {
    const exists = util.loadModuleIfExists('chai');
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

  it('#roundDecimal() should round a number to the specified number of decimal places', () => {
    let value = 12.125;
    expect(util.roundDecimal(value, 2)).to.equal(12.13);
    expect(util.roundDecimal(value, 3)).to.equal(value);
    expect(util.roundDecimal(value, 0)).to.equal(12);

    value = 12.00;
    expect(util.roundDecimal(value, 2)).to.equal(value);
    expect(util.roundDecimal(value, 3)).to.equal(value);
    expect(util.roundDecimal(value, 0)).to.equal(value);
  });

  it('#roundDecimal() defaults to 4 decimal places precision', () => {
    const value = 12.11111;
    expect(util.roundDecimal(value)).to.equal(12.1111);
  });

  it('Should rename an object\'s keys', () => {
    const a = [{ id : 1 }];
    const keyMap = { id : 'hello' };
    const result = util.renameKeys(a, keyMap);
    expect(result).to.deep.equal([{ hello : 1 }]);
  });

  it('Should retain an emo', () => {
    const a = [];
    const keyMap = { id : 'hello' };
    const result = util.renameKeys(a, keyMap);
    expect(result).to.deep.equal([]);
  });
});
