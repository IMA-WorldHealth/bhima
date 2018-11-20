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


  it('begins with 2 grades', () => {
    expect(page.count()).to.eventually.equal(2);
  });

  it('successfully creates a new grade', () => {
    page.create(grade);
  });

  it('successfully edits a grade', () => {
    page.update(grade.code, updateGrade);
  });

  it('doesn\'t create a record when grade name is incorrect', () => {
    page.errorOnCreateGrade();
  });

  it('successfully delete a grade', () => {
    page.remove(updateGrade.code);
  });

});
