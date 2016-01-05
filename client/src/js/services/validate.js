angular.module('bhima.services')
.factory('validate', ['$q', 'connect', function($q, connect) {
  var modelLabel = 'model';

  var validateTests = [
    {flag: 'required', message : 'Required data not found!', method : hasData}
  ];

  function clear(dependencies, limit) {
    var list = limit || Object.keys(dependencies);
    list.forEach(function(modelKey) {
      dependencies[modelKey].processed = false;
    });
  }

  function refresh(dependencies, limit) {
    var list = limit || Object.keys(dependencies);

    list.forEach(function(modelKey) {
      dependencies[modelKey].processed = false;
    });
    return process(dependencies, limit);
  }

  function process(dependencies, limit) {

    var validate, deferred = $q.defer(), list = filterList((limit || Object.keys(dependencies)), dependencies);
    dependencies[modelLabel] = dependencies[modelLabel] || {};

    fetchModels(list, dependencies).then(function(model) {
      packageModels(list, dependencies, model);

      validate = validateModels(list, dependencies);
      // console.log('ran tests', validate);
      if (validate.success) { return deferred.resolve(dependencies.model); }

      console.info('%c[validate]', 'color: blue; font-weight: bold;', 'Reminder that models have been tested and results should be handled');
      console.group('Validation results');
      console.log('Key Reference: \'%s\'', validate.reference);
      console.log('Flag Reference: \'%s\'', validate.flag);
      console.log('Passed: %s', validate.success);
      console.log('Message: \'%s\'', validate.message);
      console.groupEnd();
      deferred.reject(validate);

    }, function(error) { deferred.reject(error); });

    return deferred.promise;
  }

  function filterList(list, dependencies) {
    var fList;

    fList = list.filter(function(key) {
      if (dependencies[key].processed ||  key === modelLabel) {
        return false; //processed requests || model store
      }
      return true;
    });
    return fList;
  }

  function validateModels(list, dependencies) {
    var validateStatus = new Status();

    list.some(function(modelKey) {
      var model = dependencies.model[modelKey], details = dependencies[modelKey], modelTests = details.test || [], modelTestStatus = false;

      //Check for standard test flags
      validateTests.forEach(function(testObject) {
        if (details[testObject.flag]) {
          modelTests.push(testObject);
        }
      });

      //Run each test
      modelTestStatus = modelTests.some(function(testObject) {
        var testFailed, testMethod = testObject.method;
        testFailed = !testMethod(model.data);
        if (testFailed) {
          validateStatus.setFailed(testObject, modelKey);
        }
        return testFailed;
      });
      return modelTestStatus;
    });
    return validateStatus;
  }

  function packageModels(list, dependencies, model) {
    list.forEach(function(key, index) {
      dependencies.model[key] = model[index];
      dependencies[key].processed = true;
    });
  }

  function fetchModels(list, dependencies) {
    var deferred = $q.defer(), promiseList = [];

    list.forEach(function(key) {
      var dependency = dependencies[key], args = [dependency.query];

      //Hack to allow modelling reports with unique identifier - not properly supported by connect
      if (dependency.identifier) {
        args.push(dependency.identifier);
      }

      promiseList.push(connect.req.apply(connect.req, args));
    });

    $q.all(promiseList).then(function (populatedQuerry) {
      deferred.resolve(populatedQuerry);
    }, function(error) {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  // FIXME: unused
  /*
  var testSuite = {
    'enterprise' : {method: testRequiredModel, args: ['enterprise'], result: null},
    'fiscal' : {method: testRequiredModel, args: ['fiscal_year'], result: null}
  };

  function testRequiredModel (tableName, primaryKey) {
    var deferred = $q.defer();
    var testDataQuery = {
      tables : {}
    };

    primaryKey = (primaryKey || 'id');
    testDataQuery.tables[tableName] = {
      columns: [primaryKey]
    };

    //download data to test
    connect.req(testDataQuery)
    .then(function (res) {

      //run test on data
      deferred.resolve(isNotEmpty(res.data));
    }, function () {

      //download failed
      deferred.reject();
    });
    return deferred.promise;
  }
  */

  function hasData(modelData) {
    return (modelData.length > 0);
  }

  function Status() {

    function setFailed(testObject, reference) {
      this.success = false;
      this.message = testObject.message;
      this.flag = testObject.flag;
      this.reference = reference;
    }

    this.setFailed = setFailed;
    this.success = true;
    this.validModelError = true;
    this.message = null;
    this.reference = null;
    this.flag = null;

    return this;
  }

  return {
    process : process,
    clear   : clear,
    refresh : refresh
  };
}]);
