angular.module('bhima.controllers')
        .controller('EmailReportController', EmailReportController);

EmailReportController.$inject = ['$state', 'EmailReportService', 'ReportGroupService', 'SessionService', 'util',
    'NotifyService', 'ScrollService', 'bhConstants', 'uiGridConstants',
];


/**
 * Report group Controller
 *
 * @description
 
 */

function EmailReportController($state, EmailReportSvc, ReportGroupSvc, Session, util, Notify, ScrollTo, bhConstants, uiGridConstants) {

    var vm = this;
    /*
     emailReport is the object 
     that contains : name,email, frequence and report-group
     in UI form
     */
    vm.emailReport = {};
    vm.selectedEmailReport = {};
    vm.selectedEmailReport.selected = false;
    vm.save = save;
    vm.remove = remove;
    vm.frequencies = [];
    vm.report_groups = [];

    init();

    /*
     initialise importants values for the UI form
     such as the frequencies and report groups 
     that should be loaded from ReportGroupService
     
     */


    function init() {
        //loading frequencies
        vm.frequencies = EmailReportSvc.frequencies;

        //If the user has selected a profile, fill name and email field
        try {
            if ($state.params.data.email) {
                vm.emailReport.email = $state.params.data.email;
                vm.emailReport.name = $state.params.data.name;
            }
        } catch (ex) {

        }

        //IF the user want to edit an email report, action->edit
        try {

            if ($state.params.data.selectedEmailReport.id) {
                vm.emailReport = $state.params.data.selectedEmailReport;
                vm.selectedEmailReport = vm.emailReport;
                vm.selectedEmailReport.selected = true;
            }
        } catch (ex) {

        }


        //loading report groups
        ReportGroupSvc.read().then(function (reportGroups) {
            vm.report_groups = reportGroups;
 
        })
                .catch(Notify.handleError);


    }


// reset the form state
    function resetForm(RegistrationForm) {

        vm.emailReport = {};
        vm.selectedEmailReport = {};
        vm.selectedEmailReport.selected = false;

        RegistrationForm.$setPristine();
        RegistrationForm.$setUntouched();
        ScrollTo('anchor');
    }

//insertin a new email for reporting in the database
    function save(RegistrationForm) {

        // end propagation for invalid state - this could scroll to an $invalid element on the form
        if (RegistrationForm.$invalid) {
            return Notify.danger('FORM.ERRORS.INVALID');
        }


        if (vm.selectedEmailReport.selected === false) {

            //calling the EmailReportService create method
            return EmailReportSvc.create(vm.emailReport)
                    .then(function (confirmation) {
                        alert('saved successfully');
                        //fille the ui grid
                        load();
                        // reset the form state
                        resetForm(RegistrationForm);


                    })
                    .catch(Notify.handleError);

        } else {
            //calling the EmailReportService update method
            return EmailReportSvc.update(vm.emailReport)
                    .then(function (confirmation) {
                        alert('updated successfully');
                        //fille the ui grid
                        load();
                        // reset the form state
                        resetForm(RegistrationForm);


                    })
                    .catch(Notify.handleError);
        }


    }


    //delete a record
    function remove(RegistrationForm) {

        //calling the EmailReportService create method
        return EmailReportSvc.remove(vm.selectedEmailReport.id)
                .then(function (confirmation) {
                    alert('deleted successfully');
                    //fille the ui grid
                    load();
                    // reset the form state
                    resetForm(RegistrationForm);
                })
                .catch(Notify.handleError);
    }

//the ui grid

    vm.loading = false;
    vm.hasError = false;

    // grid columns
    var columns = [
        {field: 'name',
            displayName: 'Name',
            headerCellFilter: 'translate',
            aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {field: 'email',
            displayName: 'Email',
            headerCellFilter: 'translate'},
        {field: 'frequency',
            displayName: 'Frequency',
            headerCellFilter: 'translate',
        },
        {field: 'report_group',
            displayName: 'Report group',
            headerCellFilter: 'translate',
        },
        {
            field: 'action',
            displayName: '',
            cellTemplate: '/modules/email-report/templates/email-report-action-cell.html',
            enableFiltering: false,
            enableSorting: false,
            enableColumnMenu: false,
        }


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



//fill the grid
    function load(filters) {

        EmailReportSvc.read().then(function (reportGroups) {
            vm.loading = false;
            vm.gridOptions.data = reportGroups;

        })
                .catch(Notify.handleError);
    }

    load();



    return vm;
}