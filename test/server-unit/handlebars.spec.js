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
const ageItem  = new Date();
const lookItem = { content : 'I am the content' };
const equalItem = 'developer';
const gtItem = 17;
const ltItem = 7;

function HanldebarsRenderUnitTest() {
    it('#handlebars.render() renders correctly template with corresponding data', async () => {
        let result;

        // check for defined `developer` return the developer's message
        result = await hbs.render(template, data);
        const isDeveloper = (result === data.developer_message);
        expect(isDeveloper).to.be.true;


        // check for undefined `developer` return the tourist's message
        delete data.developer;
        result = await hbs.render(template, data);
        const isTourist = (result === data.message)
        expect(isTourist).to.be.true;
    });

    it('#helpers.date() render a custom date format YYYY-MM-DD', async () => {
        const data = { dateItem };
        const result = await hbs.render(customHelpersTemplate, data);
        const out = String(result).trim();
        const value = moment(data).format('YYYY-MM-DD');
        expect(out).to.equal(value);
    });

    it('#helpers.age() render the difference of year between now and a given date', async () => {
        const data = { ageItem };
        const result = await hbs.render(customHelpersTemplate, data);
        const out = String(result).trim();
        const value = moment().diff(ageItem, 'years').toString();
        expect(out).to.equal(value);
    });

    it('#helpers.look() return a given property of an object', async () => {
        const data = { lookItem };
        const result = await hbs.render(customHelpersTemplate, data);
        const out = String(result).trim();
        const value = lookItem.content;
        expect(out).to.equal(value);
    });

    it('#helpers.equal() compare two value `a` and `b` {{#equal `a` `b`}}', async () => {
        const data = { equalItem };
        const result = await hbs.render(customHelpersTemplate, data);
        const out = String(result).trim();
        const value = 'true';
        expect(out).to.equal(value);
    });

    it('#helpers.gt() compare if a >= b {{#gt `a` `b`}}', async () => {
        // compare if 17 >= 10
        let data = { gtItem, gtValue : 10 };
        let result = await hbs.render(customHelpersTemplate, data);
        let out = String(result).trim();
        let value = 'true';
        expect(out).to.equal(value);

        // compare if 17 >= 20
        data = { gtItem, gtValue : 20 };
        result = await hbs.render(customHelpersTemplate, data);
        out = String(result).trim();
        value = 'false';
        expect(out).to.equal(value);
    });

    it('#helpers.lt() compare if a < b {{#lt `a` `b`}}', async () => {
        // compare if 7 < 10
        let data = { ltItem, ltValue : 10 };
        let result = await hbs.render(customHelpersTemplate, data);
        let out = String(result).trim();
        let value = 'true';
        expect(out).to.equal(value);

        // compare if 7 < 2
        data = { ltItem, ltValue : 2 };
        result = await hbs.render(customHelpersTemplate, data);
        out = String(result).trim();
        value = 'false';
        expect(out).to.equal(value);
    });
}

describe('handlebars renderer', HanldebarsRenderUnitTest);