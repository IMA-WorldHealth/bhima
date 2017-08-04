angular.module('bhima.controllers')
  .controller('CategoriesPeopleListController', CategoriesPeopleListController);

CategoriesPeopleListController.$inject = [
  '$state', 'EmailReportService', 'CategoriesPeopleService', 'SessionService', 'util',
  'NotifyService', 'ScrollService', 'bhConstants', 'uiGridConstants', 'appcache',
];


/**
 * Report group Controller
 *
 * @description
 *CategoriesPeopleListController give the possibility to select a group of people
 * from de database, they can be users, patients, donators..
 * Once this list is displayed in a table , the user can select one of theme
 * for eache person the application can get automaticly his email and name
 *
 * This selection is usefull if the use don't know a person email or name but he is registered
 * in the database
 */

function CategoriesPeopleListController($state, EmailReportSvc, CategoriesPeople,
   Session, util, Notify, ScrollTo, bhConstants, uiGridConstants, AppCache) {

  var vm = this;
  // emailReport is the object that contains : name,email, frequence and report-group
  vm.listCategoriesPeople = CategoriesPeople.list;
  vm.selectedCategory = {};

  vm.loading = false;
  vm.hasError = false;

  function load() {

    // we will use cash to save the current category index
    const cash = AppCache('current_category');
    /*
     category people index is save in the localStorage as expained after
     if there's no index, we can use it, in the most case when the user refresh the page
     */
    if (!$state.params.index_current_category) {
      $state.params.index_current_category = cash.index;
    }

    // if a categry of people has been selected from the list,
    // we can use that index in order to create an sql request whitch return a list of people
    if ($state.params.index_current_category) {

      const index = $state.params.index_current_category;

      // saving the index in the localstorage because the user can refresh the page
      // and state can be deleted

      // let save the category index
      cash.index = index;

      const currentCategory = CategoriesPeople.list[index];
      vm.selectedCategory = currentCategory;
      /*
       we know now in what table in the database we request
      */

      const sqlParams = currentCategory;

      // Let specify the grid informations : columns,datas ...
      // the ui grid

      // grid columns
      const columns = [
        {
          field: currentCategory.Columns[0],
          displayName: 'FORM.LABELS.NAME',
          headerCellFilter: 'translate',
          aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          field: currentCategory.Columns[1],
          displayName: 'FORM.LABELS.EMAIL',
          headerCellFilter: 'translate',
        },
      ];

      // options for the UI grid
      vm.gridOptions = {
        appScopeProvider: vm,
        enableColumnMenus: false,
        columnDefs: columns,
        enableSorting: true,
        showColumnFooter: true,
        fastWatch: true,
        flatEntityAccess: true,
      };

      vm.gridOptions.multiSelect = false;

      vm.gridOptions.onRegisterApi = function (gridApi) {
        vm.gridApi = gridApi;
      };


      // the user select a profile in the grid
      vm.getSelectedRows = function () {
        vm.mySelectedRows = vm.gridApi.selection.getSelectedRows();
        if (vm.mySelectedRows.length > 0) {
          const row = vm.mySelectedRows[0];
          const name = row[currentCategory.Columns[0]];
          const email = row[currentCategory.Columns[1]];
          $state.go('emailreport', { data : { name : name, email : email } });
        }
      };

      EmailReportSvc.readPeople(sqlParams).then(function (people) {
        vm.loading = false;
        vm.gridOptions.data = people;
      })
        .catch(Notify.handleError);
    }
  }

  // once the user enter this page  the list will be displayed , thanks to this function below
  load();
  return vm;
}
