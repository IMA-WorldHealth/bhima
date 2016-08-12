(function (angular) {
  'use strict';

  /**
   * @ngdoc service
   * @name CashflowService
   * @description
   * The `CashflowService` component provide a mean to get cashflow data by requesting
   * to the /finance/cashflow API
   */
   angular.module('bhima.services')
   .factory('CashflowService', CashflowService);

   // dependencies injection
   CashflowService.$inject = ['PrototypeApiService'];

   // service definition
   function CashflowService(PrototypeApiService) {
     var service = new PrototypeApiService('/finance/cashflow/');

     return service;
   }

})(angular);
