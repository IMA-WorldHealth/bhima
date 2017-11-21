const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportClientsPage = require('./clients_report.page');

describe('Clients Report', () => {
  let Page;
  const key = 'clients_report';

  const dataset = {
    start_date : '01/01/2016',
    end_date : '31/12/2016',
    clients : ['Church Employees'],
    report_name : 'Clients Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportClientsPage(key);
  });

  it('preview a new clients report', () => {
    Page.showClientsReportPreview(dataset.start_date, dataset.end_date);
  });

  it('close the previewed report', () => {
    Page.closeClientsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveClientsReport(dataset.start_date, dataset.end_date, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedClientsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printClientsReport(dataset.start_date, dataset.end_date);
  });
});
