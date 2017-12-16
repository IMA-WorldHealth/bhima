angular.module('bhima.services')
  .service('PatientService', PatientService);

PatientService.$inject = [
  'SessionService', '$uibModal', 'DocumentService', 'VisitService',
  'FilterService', 'appcache', 'PeriodService', 'PrototypeApiService',
  '$httpParamSerializer', 'LanguageService', 'bhConstants',
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
function PatientService(
  Session, $uibModal, Documents, Visits, Filters, AppCache, Periods, Api,
  $httpParamSerializer, Languages, bhConstants
) {
  var baseUrl = '/patients/';
  var service = new Api(baseUrl);

  var patientFilters = new Filters();
  var filterCache = new AppCache('patient-filters');

  service.filters = patientFilters;
  service.create = create;
  service.groups = groups;
  service.updateGroups = updateGroups;

  service.invoicingFees = invoicingFees;
  service.subsidies = subsidies;
  service.openSearchModal = openSearchModal;
  service.searchByName = searchByName;

  // document exposition definition
  service.Documents = Documents;
  service.Visits = Visits;
  service.latest = latest;
  service.balance = balance;
  service.download = download;


  /**
   * @method latest
   *
   * @description
   * This method returns the latest invoice that was billed to a patient.
   *
   * @param {String} uuid The patient's UUID
   */
  function latest(uuid) {
    var path = 'patients/:uuid/invoices/latest';
    return service.$http.get(path.replace(':uuid', uuid))
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @method balance
   *
   * @description
   * This method returns the balance of a patient's account.
   *
   * @param {String} uuid The patient's UUID
   */
  function balance(uuid) {
    var path = 'patients/:uuid/finance/balance';
    return service.$http.get(path.replace(':uuid', uuid))
      .then(service.util.unwrapHttpResponse);
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
      finance : finance,
    };

    // Assign implicit information
    formatPatientRequest.medical.project_id = Session.project.id;

    return service.$http.post(baseUrl, formatPatientRequest)
      .then(service.util.unwrapHttpResponse);
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

    return service.$http.get(path)
      .then(service.util.unwrapHttpResponse);
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

    return service.$http.post(path, options)
      .then(service.util.unwrapHttpResponse);
  }

  function searchByName(options) {
    var opts = angular.copy(options || {});

    var target = baseUrl.concat('search/name');

    return service.$http.get(target, { params : opts })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * Fetches all invoicing fees subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select invoicing fees for
   * @return  {Object}                Promise object returning an array of invoicing
   *                                  fees
   */
  function invoicingFees(patientUuid) {
    var path = patientAttributePath('services', patientUuid);
    return service.$http.get(path)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * Fetches all subsidies subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select subsidies for
   * @return  {Object}                Promise object returning an array of subsidies
   */
  function subsidies(patientUuid) {
    var path = patientAttributePath('subsidies', patientUuid);
    return service.$http.get(path)
      .then(service.util.unwrapHttpResponse);
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
      assignments : formatted,
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

  patientFilters.registerDefaultFilters(bhConstants.defaultFilters);

  patientFilters.registerCustomFilters([
    { key : 'display_name', label : 'FORM.LABELS.NAME' },
    { key : 'sex', label : 'FORM.LABELS.GENDER' },
    { key : 'hospital_no', label : 'FORM.LABELS.HOSPITAL_NO' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'dateBirthFrom', label : 'FORM.LABELS.DOB', comparitor: '>', valueFilter : 'date' },
    { key : 'dateBirthTo', label : 'FORM.LABELS.DOB', comparitor: '<', valueFilter : 'date' },
    { key : 'dateRegistrationFrom', label : 'FORM.LABELS.DATE_REGISTRATION', comparitor: '>', valueFilter : 'date' },
    { key : 'dateRegistrationTo', label : 'FORM.LABELS.DATE_REGISTRATION', comparitor: '<', valueFilter : 'date' },
    { key : 'debtor_group_uuid', label : 'FORM.LABELS.DEBTOR_GROUP' },
    { key : 'patient_group_uuid', label : 'PATIENT_GROUP.PATIENT_GROUP' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'defaultPeriod', label : 'TABLE.COLUMNS.PERIOD' },
  ]);

  if (filterCache.filters) {
    // load cached filter definition if it exists
    patientFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(patientFilters.formatHTTP());

    // assign default period filter
    var periodDefined =
      service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);

    if (!periodDefined) {
      patientFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      patientFilters.assignFilter('limit', 100);
    }
  }

  service.removeFilter = function removeFilter(key) {
    patientFilters.resetFilterState(key);
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = patientFilters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    patientFilters.loadCache(filterCache.filters || {});
  };

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl : 'modules/patients/registry/search.modal.html',
      size : 'md',
      keyboard : false,
      animation : false,
      backdrop : 'static',
      controller : 'PatientRegistryModalController as $ctrl',
      resolve : {
        filters : function paramsProvider() { return params; },
      },
    }).result;
  }

  function download(type) {
    var filterOpts = patientFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  return service;
}
