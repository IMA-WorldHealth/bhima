angular.module('bhima.controllers')
    .controller('CategoriesPeopleModalController', CategoriesPeopleModalController);

CategoriesPeopleModalController.$inject = ['CategoriesPeopleService', 'SessionService', 'util',
    'NotifyService', 'ScrollService', 'bhConstants', 'uiGridConstants',
];


/**
 * Report group Controller
 *
 * @description
 
 */

function CategoriesPeopleModalController(CategoriesPeople, Session, util, Notify, ScrollTo, bhConstants, uiGridConstants) {

    var vm = this;
    /*
     listCategoriesPeople is an array that contains
     the table names and columns in whitch we will get the person name and email.
     We will display this list in the modal, once the user select an item will 
     get the selected index and redirect to anther modal
     */

    vm.listCategoriesPeople = CategoriesPeople.list;


    return vm;
}