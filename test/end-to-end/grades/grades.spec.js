const { expect } = require('chai');
const helpers = require('../shared/helpers');
const GradePage = require('./grades.page');

describe('Grades Management', () => {

  // navigate to the page
  before(() => helpers.navigate('#!/grades'));

  const page = new GradePage();

  const grade = {
    text : 'New Grade',
    code : 'E2G',
    basic_salary : 150,
  };

  const updateGrade = {
    text : 'Update Grade',
    code : 'EUG',
    basic_salary : 450,
  };


  it('begins with 3 grades', async () => {
    expect(await page.count()).to.equal(3);
  });

  it('successfully creates a new grade', async () => {
    await page.create(grade);
  });

  it('successfully edits a grade', async () => {
    await page.update(grade.code, updateGrade);
  });

  it(`doesn't create a record when grade name is incorrect`, async () => {
    await page.errorOnCreateGrade();
  });

  it('successfully delete a grade', async () => {
    await page.remove(updateGrade.code);
  });
});
