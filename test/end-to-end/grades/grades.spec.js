const helpers = require('../shared/helpers');
const GradePage = require('./grades.page');
const chai = require('chai');

describe('Grades Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/grades'));

  const Page = new GradePage();

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


  it('successfully creates a new grade', () => {
    Page.createGrade(grade);
  });

  it('successfully edits a grade', () => {
    Page.editGrade(grade.text, updateGrade);
  });

  it('don\'t create when incorrect grade name', () => {
    Page.errorOnCreateGrade();
  });

  it('successfully delete a grade', () => {
    Page.deleteGrade(updateGrade.text);
  });

});
