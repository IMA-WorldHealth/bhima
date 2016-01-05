angular.module('bhima.directives')
.directive('findConvention', FindConventionDirective);

FindConventionDirective.$inject = [
  '$compile', 'validate', 'messenger', 'appcache', '$parse'
];

/**
  * Find Convention Directive
  * This directive allows a user to find a convention via a typeahead input box
  */
function FindConventionDirective ($compile, validate, messenger, Appcache, $parse) {
  return {
    restrict    : 'A',
    scope : {
      callback : '=onSearchComplete'
    },
    templateUrl : '/partials/templates/findconvention.tmpl.html',
    link : function(scope, element, attrs) {
      var dependencies   = {}, conventionList = scope.conventionList = [],
          searchCallback = scope[attrs.onSearchComplete] || $parse(scope.callback),
          cache = new Appcache('conventionSearchDirective'),
          stateMap = { 'name' : searchName };

      if (!searchCallback) { throw new Error('Convention Search directive must implement data-on-search-complete'); }

      dependencies.debtor_group = {
        required : true,
        query : {
          tables : {
            debitor_group : { columns : ['uuid', 'name', 'account_id', 'phone','email']}
          }
        }
      };

      scope.findConvention = {
        state: 'name',
        submitSuccess: false
      };

      // Expose
      scope.validateNameSearch         = validateNameSearch;
      scope.findConvention.refresh     = resetSearch;
      scope.submitDebitorGroup         = submitDebitorGroup;
      scope.findConvention.updateState = updateState;

      // Loading data
      validate.process(dependencies).then(findConvention);
      cache.fetch('cacheState').then(loadDefaultState);

      function findConvention(model) {
        scope.findConvention.model = model;
        extractMetaData(model.debtor_group.data);
        var conventions = extractMetaData(model.debtor_group.data);
        conventionList = scope.conventionList = angular.copy(conventions);
      }

      function searchName(value) {
        if (typeof(value)==='string') {
          return messenger.danger('Submitted an invalid convention');
        }
        scope.findConvention.debtor_group = value;
        searchCallback(value);
        scope.findConvention.submitSuccess = true;
      }

      function submitDebitorGroup (value) {
        stateMap[scope.findConvention.state](value);
      }

      function extractMetaData(conventionData) {
        conventionData.forEach(function(convention) {
          convention.name = convention.name;
        });
        return conventionData;
      }

      function validateNameSearch(value) {
        if (!value) { return true; }

        if (typeof(value) === 'string') {
          scope.findConvention.valid = false;
          return true;
        }
        scope.findConvention.valid = true;
      }

      function resetSearch() {
        scope.findConvention.valid = false;
        scope.findConvention.submitSuccess = false;
        scope.findConvention.debtor_group = '';
      }

      function updateState(newState) {
        scope.findConvention.state = newState;
        cache.put('cacheState', {state: newState});
      }

      // FIXME Configure component on this data being available, avoid glitching interface
      function loadDefaultState(defaultState) {
        if (defaultState) {
          scope.findConvention.state = defaultState.state;
          return;
        }
      }

    }
  };
}
