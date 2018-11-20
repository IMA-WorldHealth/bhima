/* global element, by */
/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class GradePage {
  constructor() {
    this.gridId = 'grade-grid';
    this.modal = $('[uib-modal-window]');
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create(grade) {
    FU.buttons.create();

    FU.input('GradeModalCtrl.grade.text', grade.text, this.modal);
    FU.input('GradeModalCtrl.grade.code', grade.code, this.modal);
    FU.input('GradeModalCtrl.grade.basic_salary', grade.basic_salary, this.modal);

    FU.modal.submit();
    notification.hasSuccess();
  }

  errorOnCreateGrade() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('GradeModalCtrl.grade.text', this.modal);
    FU.modal.cancel();
  }

  update(code, newGrade) {
    const row = new GridRow(code);
    row.dropdown().click();
    row.edit().click();

    FU.input('GradeModalCtrl.grade.text', newGrade.text, this.modal);
    FU.input('GradeModalCtrl.grade.code', newGrade.code, this.modal);
    FU.input('GradeModalCtrl.grade.basic_salary', newGrade.basic_salary, this.modal);

    FU.modal.submit();
    notification.hasSuccess();
  }

  remove(code) {
    const row = new GridRow(code);
    row.dropdown().click();
    row.remove().click();

    FU.modal.submit();
    notification.hasSuccess();
  }
}

module.exports = GradePage;
