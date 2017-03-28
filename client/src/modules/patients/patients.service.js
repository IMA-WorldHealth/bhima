angular.module('bhima.services')
.service('PatientService', PatientService);

PatientService.$inject = [
  '$http', 'util', 'SessionService', '$uibModal',
  'DocumentService', 'VisitService', 'FilterService',
];

/**
 * @module PatientService
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /patients API.
 *
 * @example
 * function Controller(Patients) {
 *   // returns patient details
 *   Patients.read(uuid).then(callback);
 *
 *   // creates a patient
 *   Patients.create(medicalDetails, financeDetails).then(callback);
 *  }
 */
function PatientService($http, util, Session, $uibModal,
  Documents, Visits, Filters) {
  var service = this;
  var baseUrl = '/patients/';
  var filter = new Filters();

  service.read = read;
  service.create = create;
  service.update = update;
  service.groups = groups;
  service.updateGroups = updateGroups;

  service.billingServices = billingServices;
  service.subsidies = subsidies;
  service.openSearchModal = openSearchModal;

  // uses the "search" endpoint to pass query strings to the database
  service.search = search;
  service.searchByName = searchByName;
  service.formatFilterParameters = formatFilterParameters;

  // document exposition definition
  service.Documents = Documents;
  service.Visits = Visits;
  service.latest = latest;
  service.balance = balance;

  /**
   * This method returns information on a patient given the patients UUID. This
   * route provides almost all of the patients attributes.
   *
   * @param {String|Null} uuid   The patient's UUID  (could be null)
   * @return {Object}       Promise object that will return patient details
   */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
      .then(util.unwrapHttpResponse);
  }


  function latest(uuid) {
    var path = 'patients/:uuid/invoices/latest';
    return $http.get(path.replace(':uuid', uuid))
      .then(util.unwrapHttpResponse);
  }

  /**
   * This method returns the patient balance
   * @param {String} uuid The patient's UUID
   */
  function balance(uuid) {
    var path = 'patients/:uuid/finance/balance';
    return $http.get(path.replace(':uuid', uuid))
     .then(util.unwrapHttpResponse);
  }

  /**
   * This method accepts information recorded by a controllers form, formats it
   * for submission and forwards it to the server /patients/create API. It can
   * be used for creating new patient records in the database.
   *
   * @param {Object} medical   A patients medical information.
   * @param {Object} finance   A patients financial information.
   * @returns {Object}          Promise object returning success/failure confirmation.
   */
  function create(medical, finance) {
    var formatPatientRequest = {
      medical : medical,
      finance : finance
    };

    // Assign implicit information
    formatPatientRequest.medical.project_id = Session.project.id;

    return $http.post(baseUrl, formatPatientRequest)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, definition) {
    return $http.put(baseUrl.concat(uuid), definition)
      .then(util.unwrapHttpResponse);
  }

  /**
   * This method is responsible for fetching patient groups. If a patient UUID
   * is provided the method will only get the groups for that patient. If no
   * value is passed it will request all of the patient groups.
   *
   * @param {String} patientUuid    The patient's UUID - used to subselect groups
   * @return {Object}               Promise object that will return the groups requested
   */
  function groups(patientUuid) {
    var path;

    // if a patient ID has been specified - return only the patient groups for that patient
    if (angular.isDefined(patientUuid)) {
      path = baseUrl.concat(patientUuid, '/groups');
    } else {

      // no Patient ID is specified - return a list of all patient groups
      path = baseUrl.concat('groups');
    }

    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Responsible for assigning groups to a patient entity based on the groups
   * provided. Note: This process will clear all previous groups and leave the
   * patient subscribed to only the groups passed to this method.
   *
   * @param {String} uuid              The target patient's UUID
   * @param {Array}  subscribedGroups  An array of group UUIDs
   * @return {Object}                   Promise object returning success/ failure
   *                                    confiramtion.
   */
  function updateGroups(uuid, subscribedGroups) {
    var options = formatGroupOptions(subscribedGroups);
    var path = baseUrl.concat(uuid, '/groups');

    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Uses query strings to generically search for patients.
   *
   * @method search
   *
   * @param {object} options - a JSON of options to be parsed by Angular's
   * paramSerializer
   */
  function search(options) {
    options = angular.copy(options || {});

    var target = baseUrl.concat('search');

    return $http.get(target, { params : options })
      .then(util.unwrapHttpResponse);
  }

  function searchByName(options) {
    options = angular.copy(options || {});

    var target = baseUrl.concat('search/name');

    return $http.get(target, { params : options })
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetches all billing services subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select billing services for
   * @return  {Object}                Promise object returning an array of billing
   *                                  services
   */
  function billingServices(patientUuid) {
    var path = patientAttributePath('services', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetches all subsidies subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select subsidies for
   * @return  {Object}                Promise object returning an array of subsidies
   */
  function subsidies(patientUuid) {
    var path = patientAttributePath('subsidies', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /* ----------------------------------------------------------------- */
  /** Utility Methods */
  /* ----------------------------------------------------------------- */
  function formatGroupOptions(groupFormOptions) {
    var groupUuids = Object.keys(groupFormOptions);

    var formatted = groupUuids.filter(function (groupUuid) {

      // Filter out UUIDs without a true subscription
      return groupFormOptions[groupUuid];
    });

    return {
      assignments : formatted
    };
  }

  /**
   * Combine and return the patient entity with a service/attribute - returns a
   * correctly formatted path.
   *
   * @param   {String} path   Entity path (e.g 'services')
   * @param   {String} uuid   UUID of patient to format services request
   * @return  {String}        Formatted URL for patient service
   */
  function patientAttributePath(path, patientUuid) {
    var root = '/patients/';
    return root.concat(patientUuid, '/', path);
  }


  /**
   * This function prepares the headers patient properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in it's own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'display_name', displayName: 'FORM.LABELS.NAME' },
      { field: 'sex', displayName: 'FORM.LABELS.GENDER' },
      { field: 'hospital_no', displayName: 'FORM.LABELS.HOSPITAL_NO' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'dateBirthFrom', displayName: 'FORM.LABELS.DOB', comparitor: '>', ngFilter:'date' },
      { field: 'dateBirthTo', displayName: 'FORM.LABELS.DOB', comparitor: '<', ngFilter:'date' },
      { field: 'dateRegistrationFrom', displayName: 'FORM.LABELS.DATE_REGISTRATION', comparitor: '>', ngFilter:'date' },
      { field: 'dateRegistrationTo', displayName: 'FORM.LABELS.DATE_REGISTRATION', comparitor: '<', ngFilter:'date' },
      { field: 'debtor_group_uuid', displayName: 'FORM.LABELS.DEBTOR_GROUP' },
      { field: 'patient_group_uuid', displayName: 'PATIENT_GROUP.PATIENT_GROUP' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', ngFilter : 'translate' },
    ];


    // returns columns from filters
    return columns.filter(function (column) {
      var LIMIT_UUID_LENGTH = 6;
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;

        if (column.field === 'debtor_group_uuid' || column.field === 'patient_group_uuid') {
          column.value = column.value.slice(0, LIMIT_UUID_LENGTH);
        }

        if (column.field === 'defaultPeriod') {
          column.value = filter.lookupPeriod(value).label;
        }

        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl: 'modules/patients/registry/search.modal.html',
      size: 'md',
      keyboard: false,
      animation: false,
      backdrop: 'static',
      controller: 'PatientRegistryModalController as ModalCtrl',
      resolve : {
        params : function paramsProvider() { return params; }
      }
    }).result;
  }

  return service;
}
