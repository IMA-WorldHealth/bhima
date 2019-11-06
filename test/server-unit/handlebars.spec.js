/* eslint global-require: "off" */
const { expect } = require('chai');
const moment = require('moment');
const hbs = require('../../server/lib/template');

// mock handlebars template file
const template = 'test/fixtures/file.handlebars';
const customHelpersTemplate = 'test/fixtures/custom-helpers.handlebars';

// mock data
const data = {
  developer : 'developer',
  message : 'You are a tourist :-)',
  developer_message : 'You are a developer',
};

// mock for custom helpers
const dateItem = new Date();
const ageItem = new Date();
const lookItem = { content : 'I am the content' };
const equalItem = 'developer';
const gtItem = 17;
const ltItem = 7;

function HanldebarsRenderUnitTest() {
  it('#handlebars.render() renders correctly template with corresponding data', async () => {
    let result;

    // check for defined `developer` return the developer's message
    result = await hbs.render(template, data);
    expect(result).to.equal(`<html>${data.developer_message}</html>`);


    // check for undefined `developer` return the tourist's message
    delete data.developer;
    result = await hbs.render(template, data);
    expect(result).to.equal(`<html>${data.message}</html>`);
  });

  it('#helpers.date() render a custom date format YYYY-MM-DD', async () => {
    const param = { dateItem };
    const result = await hbs.render(customHelpersTemplate, param);
    const out = String(result).trim();
    const value = moment(param).format('YYYY-MM-DD');
    expect(out).to.equal(value);
  });

  it('#helpers.age() render the difference of year between now and a given date', async () => {
    const param = { ageItem };
    const result = await hbs.render(customHelpersTemplate, param);
    const out = String(result).trim();
    const value = moment().diff(ageItem, 'years').toString();
    expect(out).to.equal(value);
  });

  it('#helpers.look() return a given property of an object', async () => {
    const param = { lookItem };
    const result = await hbs.render(customHelpersTemplate, param);
    const out = String(result).trim();
    const value = lookItem.content;
    expect(out).to.equal(value);
  });

  it('#helpers.equal() compare two value `a` and `b` {{#equal `a` `b`}}', async () => {
    const param = { equalItem };
    const result = await hbs.render(customHelpersTemplate, param);
    const out = String(result).trim();
    const value = 'true';
    expect(out).to.equal(value);
  });

  it('#helpers.gt() compare if a >= b {{#gt `a` `b`}}', async () => {
    // compare if 17 >= 10
    let param = { gtItem, gtValue : 10 };
    let result = await hbs.render(customHelpersTemplate, param);
    let out = String(result).trim();
    let value = 'true';
    expect(out).to.equal(value);

    // compare if 17 >= 20
    param = { gtItem, gtValue : 20 };
    result = await hbs.render(customHelpersTemplate, param);
    out = String(result).trim();
    value = 'false';
    expect(out).to.equal(value);
  });

  it('#helpers.lt() compare if a < b {{#lt `a` `b`}}', async () => {
    // compare if 7 < 10
    let param = { ltItem, ltValue : 10 };
    let result = await hbs.render(customHelpersTemplate, param);
    let out = String(result).trim();
    let value = 'true';
    expect(out).to.equal(value);

    // compare if 7 < 2
    param = { ltItem, ltValue : 2 };
    result = await hbs.render(customHelpersTemplate, param);
    out = String(result).trim();
    value = 'false';
    expect(out).to.equal(value);
  });
}

describe('handlebars renderer', HanldebarsRenderUnitTest);
