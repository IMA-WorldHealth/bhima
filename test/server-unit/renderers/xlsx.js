const { expect } = require('chai');
const _ = require('lodash');
const xlsx = require('../../../server/lib/renderers/xlsx');

describe('util.js', () => {

  it('Should return a xlsx buffer', (done) => {
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

  it('Should work for an empty object', (done) => {
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

  it('Should check the number of rows to write in the xlsx file', () => {
    const data = {
      rows : [{ Firstname : 'Alice', Lastname : 'Bob' }],
    };
    const result = xlsx.find(data);
    expect(result.length).to.be.equal(1);
  });

  it('Should check the number of rows to write in the xlsx file by specifying a key', () => {
    const data = {
      students : [
        { name : 'Alice' },
        { name : 'Bob' }],
    };
    // rowsDataKey is the specific key where the renderer will get data to write in the expected file
    // it is used when the provided array doesn't have this key "rows"
    const options = { rowsDataKey : 'students' };
    const result = xlsx.find(data, options);
    expect(result.length).to.be.equal(2);
    expect(data.students).to.deep.equal(result);
  });

  it('Should remove unuseful columns for the user such as uuid', () => {
    const data = {
      students : [
        { uuid : '7a9480cc-b2cd-4975-a1dc-e8c167070481', name : 'Alice' },
        { uuid : '1459ce89-5d67-4019-84d8-b2bcb808eacb', name : 'Bob' }],
    };
    const formatedData = [
      { name : 'Alice' },
      { name : 'Bob' },
    ];

    const options = { rowsDataKey : 'students', ignoredColumns : ['uuid'] };
    const result = xlsx.find(data, options);
    expect(result).to.deep.equal(formatedData);
  });


});
