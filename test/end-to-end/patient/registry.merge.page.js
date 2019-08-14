/* global element, by */

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');

function PatientMergePage() {
  const page = this;
  const gridId = 'patient-registry';

  page.gridId = gridId;

  page.openMergeTool = async function openMergeTool() {
    await element(by.css('[data-action="open-tools"]')).click();
    await element(by.css('[data-method="merge-patient"]')).click();
  };

  page.gridSelectRows = async function gridSelectRows(...lines) {
    for (const line of lines) { // eslint-disable-line
      await GU.selectRow(gridId, line); // eslint-disable-line
    }
  };

  page.selectPatientToKeep = async function selectPatientToKeep(reference) {
    await element(by.css(`[data-reference="${reference}"]`)).click();
  };

  page.merge = async function merge() {
    await FU.buttons.submit();
  };
}

module.exports = PatientMergePage;
