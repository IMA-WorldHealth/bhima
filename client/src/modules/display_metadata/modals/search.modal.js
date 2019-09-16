angular.module('bhima.controllers')
  .controller('DisplayMetadataSearchModalController', DisplayMetadataSearchModalController);

DisplayMetadataSearchModalController.$inject = [
  '$uibModalInstance', 'Store', 'SurveyFormService', 'NotifyService', 'AppCache', 'ChoicesListManagementService',
];

/**
 * @class DisplayMetadataSearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the filter form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function DisplayMetadataSearchModalController(
  ModalInstance, Store, SurveyForm, Notify, AppCache, ChoicesList
  // ModalInstance, filters, Notify, Store, util,
  // MultiplePayroll, Currencies, Payroll, $translate, Session
) {
  const vm = this;
  vm.onSelectSurveyForm = onSelectSurveyForm;
  vm.searchQueries = {};
  vm.searchValues = {};
  vm.searchDateFrom = {};
  vm.searchDateTo = {};
  vm.multipleChoice = {};
  vm.onSelectList = onSelectList;
  vm.onSelectMultiple = onSelectMultiple;

  const cache = new AppCache('display_metadata');

  if (Object.keys(cache).length) {
    if (cache.collector.id) {
      onSelectSurveyForm(cache.collector);
    }
  }

  function onSelectList(list, value) {
    vm.searchValues[value] = list.id;
    vm.searchQueries[value] = list.label;
  }

  function onSelectMultiple(lists, value) {
    vm.multipleChoice[value] = lists;
  }

  function onSelectSurveyForm(collector) {
    vm.searchQueries.data_collector_id = collector.id;

    SurveyForm.read(null, { data_collector_management_id : collector.id })
      .then(surveyElements => {
        vm.formItems = surveyElements;
        return ChoicesList.read();
      })
      .then(choicesLists => {
        vm.choicesLists = choicesLists;
      })
      .catch(Notify.handleError);
  }
  const changes = new Store({ identifier : 'key' });

  const lastValues = {};

  // displayValues will be an id:displayValue pair
  const displayValues = {};

  vm.cancel = function cancel() { ModalInstance.close(); };

  // submit the filter object to the parent controller.
  vm.submit = function submit(form) {
    let _displayValue;
    if (form.$invalid) { return 0; }

    // push all searchQuery values into the changes array to be applied
    angular.forEach(vm.searchQueries, (_value, _key) => {
      if (angular.isDefined(_value)) {

        // default to the original value if no display value is defined
        _displayValue = displayValues[_key] || lastValues[_key];
        changes.post({ key : _key, value : _value, displayValue : _displayValue });
      }
    });


    const multipleChoiceLength = Object.keys(vm.multipleChoice).length;
    if (multipleChoiceLength) {
      Object.keys(vm.multipleChoice).forEach((key) => {
        for (let i = 0; i < vm.multipleChoice[key].length; i++) {
          vm.choicesLists.forEach(list => {
            if (list.id === vm.multipleChoice[key][i]) {
              vm.multipleChoice[key][i] = list.label;
            }
          });
        }
      });
    }

    const allChanges = {
      loggedChanges : changes.getAll(),
      collectorId : vm.searchQueries.data_collector_id,
      searchDateFrom : vm.searchDateFrom,
      searchDateTo : vm.searchDateTo,
      multipleChoice : vm.multipleChoice,
    };

    // return values to the controller
    return ModalInstance.close(allChanges);
  };
}
