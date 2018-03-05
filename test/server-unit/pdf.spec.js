/* eslint global-require: "off" */
const { expect } = require('chai');
const rewire = require('rewire');
const util = require('util');
const path = require('path');
const fs = require('mz/fs');
const exec = util.promisify(require('child_process').exec);

const pdf = rewire('../../server/lib/renderers/pdf');
pdf.__set__('html', { render : noop });

// mock handlebars template file
const template = 'test/fixtures/file.handlebars';

// mock data
const data = {
  developer : 'developer',
  message : 'You are a tourist :-)',
  developer_message : 'You are a developer',
  lang : 'fr',
};

const timestamp = new Date().getTime();

const fixturesPath = path.resolve('test/fixtures');
const htmlFile = path.join(fixturesPath, '/pdf-sample.html');
const generatedFile = path.join(fixturesPath, '/pdf-sample.pdf');
const temporaryFile = path.join(fixturesPath, `/pdf-${timestamp}.pdf`);

function PDFRenderUnitTest() {
  it('#wkhtmltopdf() creates correctly a PDF file from an HTML', async () => {
    const wk = await exec(`wkhtmltopdf ${htmlFile} ${temporaryFile}`);
    fs.unlink(temporaryFile);
  });

  it('#pdf.render() renders a valid PDF file', async () => {
    const result = await pdf.render(data, template, {});
    const hasValidVersion = hasValidPdfVersion(result.toString());
    const isBuffer = isBufferInstance(result);
    expect(isBuffer && hasValidVersion).to.be.equal(true);
  });

  it('#pdf.render() renders as well #wkhtmltopdf the same PDF file from an HTML', async () => {

    // load the HTML template into memory as a giant string
    const tmpl = await fs.readFile(htmlFile, 'utf8');

    // give the giant string to the render method
    const rendered = await pdf.render({}, tmpl, {});
    const cached = await fs.readFile(generatedFile);

    expect(isBufferInstance(rendered)).to.equal(true);
    expect(isBufferInstance(cached)).to.equal(true);

    // pdf DateCreation must be ignored when comparing
    const slicedRendered = sliceOutCreationDate(rendered);
    const slicedCached = sliceOutCreationDate(cached);

    expect(slicedRendered).to.deep.equal(slicedCached);
  });
}

/**
 * sliceOutCreationDate
 * @description remove the CreationDate from the PDF buffer
 * @param {buffer} buffer
 */
function sliceOutCreationDate(buffer) {
  const start = buffer.indexOf('/CreationDate');
  const end = buffer.indexOf(')', start) + 1;
  const firstPart = buffer.slice(0, start);
  const secondPart = buffer.slice(end);
  return Buffer.concat([firstPart, secondPart]);
}

/**
 * hasValidPdfVersion
 * @description check if the pdf version is valid
 * @param {string} fileInString the pdf file in string
 */
function hasValidPdfVersion(fileInString) {
  const pdfHeader = fileInString.substr(0, 8); // This gets the first 8 bytes/characters of the file
  const regex = new RegExp(/%PDF-1.[0-7]/); // This Regular Expression is used to check if the file is valid
  const result = pdfHeader.match(regex);
  return !!(result.length);
}

/**
 * @description check if the given file is an instance of Buffer
 * @param {object} file
 */
function isBufferInstance(file) {
  return file instanceof Buffer;
}

// the actual HTML renderer is mocked here.  Remember, it takes in three arguments:
// context, template, and options and returns and HTML string.  We'll make it just
// return the template.
function noop(context, tmpl) {
  return Promise.resolve(tmpl);
}

describe('PDF renderer', PDFRenderUnitTest);
