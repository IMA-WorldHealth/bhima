const helpers = require('../shared/helpers');
const DataCollectorManagement = require('./dataCollectorManagement.page');

describe('Data Collector Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/data_collector_management'));

  const Page = new DataCollectorManagement();

  const newDataCollector = {
    label : 'Consultations externes',
    description : '2. CONSULTATIONS / 2.1. Consultations externes',
    version_number : '1',
    color : 'burlywood',
    is_related_patient : '1',
  };

  const updateDataCollector = {
    label : 'Consultations aux urgences',
    version_number : '1',
    color : 'chartreuse',
  };

  it('successfully creates a new Data Collector Management', async () => {
    await Page.create(newDataCollector);
  });

  it('successfully edits a Data Collector Management', async () => {
    await Page.edit(newDataCollector.label, updateDataCollector);
  });

  it('don\'t create when incorrect Data Collector Management', async () => {
    await Page.errorOnCreate();
  });

  it('successfully delete a Data Collector Management', async () => {
    await Page.delete(updateDataCollector.label);
  });
});
