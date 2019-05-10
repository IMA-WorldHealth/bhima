/* global element, by */
/* eslint  */

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

  async create(grade) {
    await FU.buttons.create();

    await FU.input('GradeModalCtrl.grade.text', grade.text, this.modal);
    await FU.input('GradeModalCtrl.grade.code', grade.code, this.modal);
    await FU.input('GradeModalCtrl.grade.basic_salary', grade.basic_salary, this.modal);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateGrade() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('GradeModalCtrl.grade.text', this.modal);
    await FU.modal.cancel();
  }

  async update(code, newGrade) {
    const row = new GridRow(code);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('GradeModalCtrl.grade.text', newGrade.text, this.modal);
    await FU.input('GradeModalCtrl.grade.code', newGrade.code, this.modal);
    await FU.input('GradeModalCtrl.grade.basic_salary', newGrade.basic_salary, this.modal);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(code) {
    const row = new GridRow(code);
    await row.dropdown().click();
    await row.remove().click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }
}

module.exports = GradePage;
