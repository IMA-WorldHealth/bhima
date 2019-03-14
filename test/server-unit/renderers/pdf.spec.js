/* eslint global-require: "off" */
const { expect } = require('chai');
const rewire = require('rewire');
const path = require('path');
const fs = require('mz/fs');

const pdf = rewire('../../../server/lib/renderers/pdf');
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

const fixturesPath = path.resolve('test/fixtures');
const htmlFile = path.join(fixturesPath, '/pdf-sample.html');
const pdfFile = path.join(fixturesPath, '/pdf-sample.pdf');

function PDFRenderUnitTest() {
  it('#pdf.render() renders a valid PDF file', async () => {
    const result = await pdf.render(data, template, {});
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
    const slicedRendered = sliceOutRandomMetadata(sliceOutHeaderInfo(rendered));
    const slicedCached = sliceOutRandomMetadata(sliceOutHeaderInfo(cached));

    expect(slicedRendered).to.deep.equal(slicedCached);
  });
}

/**
 * @function sliceOutHeader
 *
 * @description
 * Removes the header form the PDF before comparison. The header contains the
 * CreationDate and ModDate properties, which will differ between the PDFs and
 * fail the test without actually being a problem with the rendering.
 *
 * @param {buffer} buffer - the PDF passed in as a buffer
 * @returns {buffer} the original PDF w/o the header seaction
 */
function sliceOutHeaderInfo(buffer) {
  const start = buffer.indexOf('<</Creator');
  const end = buffer.indexOf('>>', start) + 1;
  const firstPart = buffer.slice(0, start);
  const secondPart = buffer.slice(end);
  return Buffer.concat([firstPart, secondPart]);
}

/**
 * @function hasValidPdfVersion
 *
 * @description
 * Checks if the pdf version string exists in the string passed in
 *
 * @param {string} fileInString the pdf file contents
 * @returns {boolean} true if the contents are a PDF.
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

// the actual HTML renderer is mocked here.  Remember, it takes in three arguments:
// context, template, and options and returns and HTML string.  We'll make it just
// return the template.
function noop(context, tmpl) {
  return Promise.resolve(tmpl);
}

describe('PDF renderer', PDFRenderUnitTest);
