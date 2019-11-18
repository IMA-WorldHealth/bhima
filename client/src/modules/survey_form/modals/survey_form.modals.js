angular.module('bhima.controllers')
  .controller('SurveyFormModalController', SurveyFormModalController);

SurveyFormModalController.$inject = [
  '$state', 'SurveyFormService', 'NotifyService', 'appcache', 'DataCollectorManagementService',
];

/**
 * SURVEY FORM Modal Controller
 */

function SurveyFormModalController($state, SurveyForm, Notify, AppCache, DataCollectorManagement) {
  const vm = this;
  const cache = AppCache('SurveyFormModal');

  vm.surveyForm = {};
  vm.stateParams = {};

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.clear = clear;
  vm.selectType = selectType;
  vm.onSelectList = onSelectList;
  vm.onSelectSurvey = onSelectSurvey;
  vm.checkVariableName = checkVariableName;
  vm.check = true;

  function selectType(type) {
    vm.surveyForm.type = type.id;
    vm.selectList = (type.is_list) ? 1 : 0;
    vm.selectOne = ((type.id === 3) && type.is_list) ? 1 : 0;
  }

  function onSelectList(list) {
    vm.surveyForm.choice_list_id = list.id;
  }

  function onSelectSurvey(survey) {
    vm.surveyForm.filter_choice_list_id = survey.id;
  }

  function checkVariableName() {
    if (vm.surveyForm.name) {
      vm.check = SurveyForm.validVariable(vm.surveyForm.name);
    }
  }

  if ($state.params.collectorId) {
    vm.surveyForm.data_collector_management_id = $state.params.collectorId;

    DataCollectorManagement.read($state.params.collectorId)
      .then(data => {
        vm.dataCollector = data;
      })
      .catch(Notify.handleError);
  }

  if ($state.params.creating || $state.params.id) {
    cache.stateParams = $state.params;
    vm.stateParams = cache.stateParams;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  if (!vm.isCreating) {
    SurveyForm.read(vm.stateParams.id)
      .then(data => {
        vm.selectList = data.choice_list_id;
        vm.surveyForm = data;

        vm.check = SurveyForm.validVariable(vm.surveyForm.name);
      })
      .catch(Notify.handleError);
  }

  // load SURVEY FORM
  SurveyForm.read()
    .then(surveyForms => {
      vm.surveyForms = surveyForms;
    })
    .catch(Notify.handleError);

  // submit the data to the server from all two forms (update, create)
  function submit(surveyForm) {
    vm.hasNoChange = surveyForm.$submitted && surveyForm.$pristine && !vm.isCreating;

    if (surveyForm.$invalid || !vm.check) { return null; }
    if (surveyForm.$pristine) { return null; }

    if (parseInt(vm.surveyForm.type, 10) !== 9) {
      vm.surveyForm.calculation = null;
    }

    vm.surveyForm.name = vm.surveyForm.name.trim();

    const promise = (vm.isCreating)
      ? SurveyForm.create(vm.surveyForm)
      : SurveyForm.update(vm.surveyForm.id, vm.surveyForm);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('survey_form', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function clear(value) {
    vm.surveyForm[value] = null;
  }

  function closeModal() {
    $state.go('survey_form');
  }
}
