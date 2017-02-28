angular.module('bhima.controllers')
  .controller('EnterpriseController', EnterpriseController);

EnterpriseController.$inject = [
  'EnterpriseService', 'CurrencyService', 'util', 'NotifyService', 'ProjectService', 'ModalService',
];

/**
 * Enterprise Controller
 */
function EnterpriseController(Enterprises, Currencies, util, Notify, Projects, Modal) {
  var vm = this;

  vm.enterprises = [];
  vm.enterprise = {};
  vm.maxLength = util.maxTextLength;
  vm.length50 = util.length50;
  vm.length20 = util.length20;
  vm.length100 = util.length100;
  vm.length30 = util.length30;
  vm.hasEnterprise = false;

  // bind methods
  vm.submit = submit;
  vm.onSelectGainAccount = onSelectGainAccount;
  vm.onSelectLossAccount = onSelectLossAccount;

  // fired on startup
  function startup() {

    // load enterprises
    Enterprises.read(null, { detailed: 1 })
      .then(function (enterprises) {
        vm.hasEnterprise = (enterprises.length > 0);
        vm.enterprises = vm.hasEnterprise ? enterprises : [];

        /**
         * @note: set the enterprise to the first one
         * this choice need the team point of view for to setting the default enterprise
         */
        vm.enterprise = vm.hasEnterprise ? vm.enterprises[0] : {};
        return refreshProjects();
      })
      .catch(Notify.handleError);

    // load currencies
    Currencies.read()
      .then(function (currencies) {
        vm.currencies = currencies;
      })
      .catch(Notify.handleError);
  }

  function onSelectGainAccount(account) {
    vm.enterprise.gain_account_id = account.id;
  }

  function onSelectLossAccount(account) {
    vm.enterprise.loss_account_id = account.id;
  }

  // form submission
  function submit(form) {

    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = (vm.hasEnterprise === false);
    var enterprise = cleanEnterpriseForm(vm.enterprise);

    promise = (creation) ?
      Enterprises.create(enterprise) :
      Enterprises.update(enterprise.id, enterprise);

    return promise
      .then(function () {
        Notify.success(creation ? 'FORM.INFO.SAVE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  function cleanEnterpriseForm(enterprise) {
    return {
      id : enterprise.id,
      name : enterprise.name,
      abbr : enterprise.abbr,
      phone : enterprise.phone,
      email : enterprise.email,
      location_id : enterprise.location_id,
      currency_id : enterprise.currency_id,
      po_box : enterprise.po_box,
      gain_account_id : enterprise.gain_account_id,
      loss_account_id : enterprise.loss_account_id
    };
  }

  /* ================================ PROJECT ================================ */

  vm.addProject = addProject;
  vm.editProject = editProject;
  vm.deleteProject = deleteProject;

  // refresh the displayed projects
  function refreshProjects() {
    return Projects.read(null, { complete : 1 })
      .then(function (projects) {
        vm.projects = projects;
      });
  }

  /**
   * @function editProject
   * @desc launch project modal for editing
   */
  function editProject(id) {
    var params = {
      action : 'edit',
      identifier : id,
      enterprise : vm.enterprise
    };

    Modal.openProjectActions(params)
    .then(function (value) {
      if (!value) { return; }

      refreshProjects();
      Notify.success('FORM.INFO.UPDATE_SUCCESS');
    })
    .catch(Notify.handleError);
  }

  /**
   * @function addProject
   * @desc launch project modal for adding new
   */
  function addProject() {
    var params = {
      action : 'create',
      enterprise : vm.enterprise
    };
    Modal.openProjectActions(params)
    .then(function (value) {
      if (!value) { return; }

      refreshProjects();
      Notify.success('FORM.INFO.CREATE_SUCCESS');
    })
    .catch(Notify.handleError);
  }

  /**
   * @function deleteProject
   * @desc delete an existing project
   * @param {number} id The project id
   */
  function deleteProject(id, pattern) {
    var params = {
      pattern: pattern,
      patternName: 'FORM.PATTERNS.PROJECT_NAME'
    };

    Modal.openConfirmDialog(params)
    .then(function (bool) {
      if (!bool) { return; }

      Projects.delete(id)
        .then(function () {
          Notify.success('FORM.INFO.DELETE_SUCCESS');
          return refreshProjects();
        })
        .catch(Notify.handleError);
    });
  }

  startup();
}
