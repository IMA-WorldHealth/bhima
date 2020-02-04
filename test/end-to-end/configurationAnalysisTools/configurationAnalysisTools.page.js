/* global element, by */
/* eslint  */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');
const components = require('../shared/components');

class ConfigurationAnalysisToolsPage {
  constructor() {
    this.gridId = 'configuration-analysis-tools-grid';
    this.modal = $('[uib-modal-window]');
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  async create(configuration) {
    await FU.buttons.create();

    await FU.input('ConfigurationAnalysisToolsModalCtrl.reference.label', configuration.label, this.modal);
    await components.accountReferenceSelect.set(configuration.account_reference_id, 'account_reference_id');
    await components.analysisToolTypeSelect.set(configuration.analysis_tool_type_id, 'analysis_tool_type_id');
    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateConfigurationAnalysis() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('ConfigurationAnalysisToolsModalCtrl.reference.label', this.modal);
    await FU.modal.cancel();
  }

  async update(code, configuration) {
    const row = new GridRow(code);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('ConfigurationAnalysisToolsModalCtrl.reference.label', configuration.label, this.modal);
    await components.accountReferenceSelect.set(configuration.account_reference_id, 'account_reference_id');
    await components.analysisToolTypeSelect.set(configuration.analysis_tool_type_id, 'analysis_tool_type_id');
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

module.exports = ConfigurationAnalysisToolsPage;
