angular.module('bhima.controllers')
    .controller('CategoriesPeopleListController', CategoriesPeopleListController);

CategoriesPeopleListController.$inject = ['$state', 'EmailReportService', 'CategoriesPeopleService', 'SessionService', 'util',
    'NotifyService', 'ScrollService', 'bhConstants', 'uiGridConstants',
];


/**
 * Report group Controller
 *
 * @description
 
 */

function CategoriesPeopleListController($state, EmailReportSvc, CategoriesPeople, Session, util, Notify, ScrollTo, bhConstants, uiGridConstants) {

    var vm = this;
    //emailReport is the object that contains : name,email, frequence and report-group


    vm.listCategoriesPeople = CategoriesPeople.list;
    vm.selectedCategory = {};



    vm.loading = false;
    vm.hasError = false;

    function load(filters) {
        /*
         category people index is save in the localStorage as expained after
         if there's no index, we can use it, in the most case when the user refresh the page
         */
        if (!$state.params.index_current_category) {
            $state.params.index_current_category = localStorage.getItem('index_current_category');
        }

        //if a categry of peoplo has been selected from the list, 
        //we can use that index in order to create an sql request whitch return a list of people
        if ($state.params.index_current_category) {

            var index = $state.params.index_current_category;

            //saving the index in the localstorage because the user can refresh the page
            // and state can be deleted
            localStorage.setItem('index_current_category', index);


            var currentCategory = CategoriesPeople.list[index];

            /*
             we know now in what table in the database we request
             */
            var sql = "SELECT " + currentCategory.Columns[0] + " , " + currentCategory.Columns[1] + " FROM " + currentCategory.table;


            //Let specify the grid informations : columns,datas ...
            //the ui grid

            // grid columns
            var columns = [
                {
                    field: currentCategory.Columns[0],
                    displayName: 'Name',
                    headerCellFilter: 'translate',
                    aggregationType: uiGridConstants.aggregationTypes.count,
                },
                {
                    field: currentCategory.Columns[1],
                    displayName: 'Email',
                    headerCellFilter: 'translate'
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


            //the user select a profile in the grid
            vm.getSelectedRows = function () {
                vm.mySelectedRows = vm.gridApi.selection.getSelectedRows();
                if (vm.mySelectedRows.length > 0) {
                    var row = vm.mySelectedRows[0];

                    var name = row[currentCategory.Columns[0]];
                    var email = row[currentCategory.Columns[1]];

                    $state.go('emailreport', { data: { name: name, email: email } });

                }
            }

            //
            EmailReportSvc.read_people(sql).then(function (people) {
                vm.loading = false;

                vm.gridOptions.data = people;

            })
                .catch(Notify.handleError);

        }

    }


    load();
    return vm;
}