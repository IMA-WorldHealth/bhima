const { expect } = require('chai');
const csv = require('../../server/lib/renderers/csv');

describe('test/server-unit renderers/csv.js', () => {

  const data = [
    { id : 1, name : 'jniles', score : 12 },
    { id : 2, name : 'mbayopanda', score : 37 },
    {
      id : 3, name : 'lomamech', dob : new Date(2019, 10, 3, 5, 2, 1), score : 18,
    },
    {
      id : 4, name : 'jeremielodi', dob : new Date(2010, 11, 6, 1, 2, 3), score : 72,
    },
  ];

  it('exposes render, extension, and headers properties', () => {
    expect(csv.headers).to.be.a('object');
    expect(csv.render).to.be.a('function');
    expect(csv.extension).to.be.a('string');
  });

  it('#render() should return a known string output for known input', async () => {

    const renderedRaw = await csv.render({ csv : data });

    // Remove BOM from rendered csv data (if present)
    const rendered = renderedRaw.replace(/^\uFEFF/, '');

    const output = `
id,name,score,dob
1,jniles,12,undefined
2,mbayopanda,37,undefined
3,lomamech,18,03/11/2019 5:02:1
4,jeremielodi,72,06/12/2010 1:02:3`.trim();

    expect(rendered).to.equal(output);
  });

  it('#render() uses options.csvKey to determine which array to process', async () => {
    const otherData = [{ id : 3, check : true }];
    const renderedRaw = await csv.render({ rows : data, csv : otherData }, null, { csvKey : 'rows' });

    // Remove BOM from rendered csv data (if present)
    const rendered = renderedRaw.replace(/^\uFEFF/, '');

    const output = `
id,name,score,dob
1,jniles,12,undefined
2,mbayopanda,37,undefined
3,lomamech,18,03/11/2019 5:02:1
4,jeremielodi,72,06/12/2010 1:02:3`.trim();

    expect(rendered).to.equal(output);
  });

  it('#render() does not remove empty rows', async () => {
    const cloned = [...data, {}];
    const renderedRaw = await csv.render({ csv : cloned });
    // Remove BOM from rendered csv data (if present)
    const rendered = renderedRaw.replace(/^\uFEFF/, '');
    const output = `
id,name,score,dob
1,jniles,12,undefined
2,mbayopanda,37,undefined
3,lomamech,18,03/11/2019 5:02:1
4,jeremielodi,72,06/12/2010 1:02:3
undefined,undefined,undefined,undefined`.trim();

    expect(rendered).to.equal(output);
  });

  it('#render() should convert dates if dates are passed in by default', async () => {
    const ds = [{ start : new Date(2019, 4, 2, 7, 2, 33) }];
    const renderedRaw = await csv.render({ csv : ds });
    // Remove BOM from rendered csv data (if present)
    const rendered = renderedRaw.replace(/^\uFEFF/, '');
    const output = `
start
02/05/2019 7:02:33`.trim();

    expect(rendered).to.equal(output);
  });

  it('#render() should not convert dates if dates are passed with the suppressDefaultFormatting option', async () => {
    const start = new Date(Date.UTC(2019, 2, 5, 7, 2, 33));

    const ds = [{ start }];
    const renderedRaw = await csv.render({ csv : ds }, null, { suppressDefaultFormatting : true });
    // Remove BOM from rendered csv data (if present)
    const rendered = renderedRaw.replace(/^\uFEFF/, '');
    const output = `
start
${start.toString()}`.trim();

    expect(rendered).to.equal(output);
  });

});
