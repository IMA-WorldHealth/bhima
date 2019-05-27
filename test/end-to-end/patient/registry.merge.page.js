/* global element, by */

// const FU = require('../../shared/FormUtils');
// const GU = require('../../shared/GridUtils');

function PatientMergePage() {
  const page = this;
  const gridId = 'patient-registry';

  page.gridId = gridId;

  page.openMergeTool = async function openMergeTool() {
    element(by.css('[data-action="open-tools"]')).click();
    element(by.css('[data-action="merge-patient"]')).click();
  };
}

module.exports = PatientMergePage;
