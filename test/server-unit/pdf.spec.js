/* eslint global-require: "off" */
const { expect } = require('chai');
const rewire = require('rewire');
const util = require('util');
const path = require('path');
const fs = require('mz/fs');
const exec = util.promisify(require('child_process').exec);

/**
 * Mock an HTML renderer without the complexity of BHIMA's bundle one
 */
const mockHTMLRenderer = (data, template) => {
  // eslint-disable-next-line
  const compiled = require('handlebars').compile(template);
  return Promise.resolve(compiled(data));
};

const pdf = rewire('../../server/lib/renderers/pdf');
pdf.__set__('html', { render : mockHTMLRenderer });


// mock handlebars template file
const template = 'test/fixtures/file.handlebars';
const templateWithBarcode = 'pdf-template-with-barcode.handlebars';

// mock data
const data = {
  developer : 'developer',
  message : 'You are a tourist :-)',
  developer_message : 'You are a developer',
  lang : 'fr',
};

const random = Math.ceil(Math.random() * (10 ** 9));

const fixturesPath = path.resolve('test/fixtures');
const artifactsPath = path.resolve('test/artifacts');
const htmlFile = path.join(fixturesPath, '/pdf-sample.html');
const pdfFile = path.join(fixturesPath, '/pdf-sample.pdf');
const temporaryFile = path.join(artifactsPath, `/pdf-${random}.pdf`);

function PDFRenderUnitTest() {
  it('wkhtmltopdf is installed and creates a PDF from an HTML file', async () => {
    await exec(`wkhtmltopdf ${htmlFile} ${temporaryFile}`);
    fs.unlink(temporaryFile);
  });

  it('#pdf.render() renders a valid PDF file', async () => {
    const htmlString = await fs.readFile(template, 'utf8');
    const result = await pdf.render(data, htmlString, {});
    const hasValidVersion = hasValidPdfVersion(result.toString());
    const isBuffer = isBufferInstance(result);
    expect(isBuffer && hasValidVersion).to.be.equal(true);
  });

  it('#pdf.render() renders an identical PDF given an HTML template', async () => {
    // load the HTML template into memory as a giant string
    const tmpl = await fs.readFile(htmlFile, 'utf8');

    // give the giant string to the render method
    const rendered = await pdf.render({}, tmpl, {});
    const cached = await fs.readFile(pdfFile);

    expect(isBufferInstance(rendered)).to.equal(true);
    expect(isBufferInstance(cached)).to.equal(true);

    // pdf DateCreation must be ignored when comparing
    const slicedRendered = sliceOutCreationDate(rendered);
    const slicedCached = sliceOutCreationDate(cached);

    expect(sliceOutRandomMetadata(slicedRendered)).to.deep.equal(sliceOutRandomMetadata(slicedCached));
  });

  it('#pdf.render() templates in a barcode to the pdf file', async () => {
    const tmpl = await fs.readFile(path.join(fixturesPath, templateWithBarcode), 'utf8');
    const params = { main : 'This is a test', value : 'hi' };
    const result = await pdf.render(params, tmpl, {});
    const hasValidVersion = hasValidPdfVersion(result.toString());
    const isBuffer = isBufferInstance(result);
    expect(isBuffer && hasValidVersion).to.be.equal(true);
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
 * @function sliceOutRandomMetadata
 * @description
 * Slices out random binary data at the end of the PDF.
 *
 * @param {Buffer} buffer
 */
function sliceOutRandomMetadata(buffer) {
  const start = buffer.indexOf('\nxref\n0 17');
  const end = buffer.indexOf('%%EOF');
  const firstPart = buffer.slice(0, start);
  const secondPart = buffer.slice(end);
  return Buffer.concat([firstPart, secondPart]);
}

/**
 * @description check if the given file is an instance of Buffer
 * @param {object} file
 */
function isBufferInstance(file) {
  return file instanceof Buffer;
}

describe('PDF renderer', PDFRenderUnitTest);
