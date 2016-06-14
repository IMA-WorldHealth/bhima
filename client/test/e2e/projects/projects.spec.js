/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Projects', function () {
  const path = '#/projects';
  const project = {
    name : 'Test Project D',
    abbr : 'TPD'
  };

  // navigate to the project module before starting
  before(() => helpers.navigate(path));

  const defaultProject = 3;
  const projectRank = helpers.random(defaultProject);
  const deleteSuccess = 3;
  const deleteError = 1;

  it('creates a new project', function () {

    // switch to the create form
    FU.buttons.create();

    FU.input('ProjectCtrl.project.name', project.name);
    FU.input('ProjectCtrl.project.abbr', project.abbr);
    FU.select('ProjectCtrl.project.enterprise_id', 'Test');
    FU.select('ProjectCtrl.project.zs_id', 'Zone Sante A');

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    components.notification.hasSuccess();
  });


  it('edits a project', function () {

    element(by.id('project-upd-' + projectRank)).click();

    // modify the project name
    FU.input('ProjectCtrl.project.name', 'Updated');

    element(by.model('ProjectCtrl.project.locked')).click();
    FU.buttons.submit();

    // make sure the success message appears
    components.notification.hasSuccess();
  });

  it('unlock a project', function () {
    element(by.id('project-upd-' + projectRank)).click();

    // submit the page to the server
    FU.buttons.submit();

    // make sure the success message appears
    components.notification.hasSuccess();
  });


  it('blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    FU.buttons.create();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('ProjectCtrl.project.name');
    FU.validation.error('ProjectCtrl.project.abbr');
    FU.validation.error('ProjectCtrl.project.enterprise_id');
    FU.validation.error('ProjectCtrl.project.zs_id');

    // the following fields are not required
    FU.validation.ok('ProjectCtrl.project.locked');
  });

  it('deletes a project', function () {
    element(by.id('project-del-' + deleteSuccess)).click();

    // click the alert asking for permission
    components.modalAction.confirm();

    // make sure that the delete message appears
    components.notification.hasSuccess();
  });

  it('does not delete a project that has foreign key conditions', function () {

    // try to delete an element that is used in other tables
    element(by.id('project-del-' + deleteError)).click();

    // accept the alert
    components.modalAction.confirm();

    // the module should show an error message (and none others)
    components.notification.hasError();
  });
});
