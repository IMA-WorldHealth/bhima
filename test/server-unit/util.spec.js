const { expect } = require('chai');
const _ = require('lodash');
const path = require('path');

const util = require('../../server/lib/util');

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
      { name : 'alice', dob : new Date('2015-03-25 12:00:00') },
      { name : 'bob', dob : new Date('2015-03-30 12:00:00') },
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

  it('should calculate an age from a date', () => {
    const now = new Date();

    const fourYearsAgo = now.getFullYear() - 4;
    const old = new Date(fourYearsAgo, now.getMonth(), now.getDate());

    expect(util.calculateAge(old)).to.equal(4);
  });

  it('#formatCsvToJson should return a json from a csv file', () => {
    /**
     * The structure of the sample csv file (ohada-accounts.csv)
     * =========================================================
     * "account_number",  "account_label",    "account_type", "account_parent"
     * "10",              "CAPITAL",          "title",        "1"
     * "12",              "REPORT A NOUVEAU", "title",        "1"
     */
    const filePath = 'test/fixtures/ohada-accounts.csv';
    const promise = util.formatCsvToJson(path.resolve(filePath));
    return promise
      .then(csvObjectArray => {
        const [first, second] = csvObjectArray;
        expect(csvObjectArray).to.be.an('array');

        // check the value contained in the csv file
        expect(first).to.have.property('account_number', '10');
        expect(first).to.have.property('account_label', 'CAPITAL');
        expect(first).to.have.property('account_type', 'title');
        expect(first).to.have.property('account_parent', '1');

        expect(second).to.have.property('account_number', '12');
        expect(second).to.have.property('account_label', 'REPORT A NOUVEAU');
        expect(second).to.have.property('account_type', 'title');
        expect(second).to.have.property('account_parent', '1');

        // check properties of each element of the array correspond to column of the file
        csvObjectArray.forEach(csvObject => {
          expect(csvObject).to.be.an('object');
          expect(csvObject).to.have.property('account_number');
          expect(csvObject).to.have.property('account_label');
          expect(csvObject).to.have.property('account_type');
          expect(csvObject).to.have.property('account_parent');
        });
      });
  });
});
