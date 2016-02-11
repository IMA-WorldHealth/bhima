/**
 * @param {string} level-select The method that will be called on selection of a village, this method should accept a 32 char UUID
 * 
 * Note : Directive should have a separate template and link method;
 *  - Angular doesn't allow you to template ng-model
 *  - I'm too stuborn to let that win, and (simplify everything) just hard-code in location selects
 *  - This doesn't need to be this generic, and should be refactored if required
 */

angular.module('bhima.directives')
.component('bhLocationSelect', {
  bindings : {
    locationId : '=',  // two-way binding
    onChange : '@',    // callback binding
  },
  controller : LocationSelectComponent,
  templateUrl : 'partials/templates/bhLocationSelect.tmpl.html'
});

LocationSelectComponent.$inject =  [];

/**
 * Location Select Component - bhLocationSelect
 *
 * This component allows easy selection and validation of locations to be used
 * throughout bhima.
 *
 */
function LocationSelectComponent() {
}

/*
.directive('locationSelect', ['appstate', 'connect', '$compile',  function (appstate, connect, $compile) {
  return {
    restrict : 'A',
    replace : true,
    transclue : true,
    link : function (scope, element, attrs) {
      
      var submitCallback = attrs.selectVillage;
      var defaultVillageTag = attrs.defaultVillage;
      var initialLocationTag = attrs.initialLocation;
  
      // Verify location parameters
      if (!submitCallback) { 
        throw new Error('[locationSelect] Location select must define village selection callback');
      }
      if (!scope[submitCallback]) { 
        throw new Error('[locationSelect] Village selection callback not found on scope');
      }

      scope.locationSelect = scope.locationSelect || {};

      var namespace = scope.locationSelect[submitCallback] = {};

      // TODO rename variables etc. with useful names 
      var locationIndex = {};
      var locationConfig = namespace.locationConfig = {
        village : {
          dependency : 'sector',
          label : 'LOCATION.VILLAGE',
          column : 'name',
          id : 'village'
        },
        sector : {
          dependency : 'province',
          label : 'LOCATION.SECTOR',
          column : 'name',
          id : 'sector'
        }, province : {
          dependency : 'country',
          label : 'LOCATION.PROVINCE',
          column : 'name',
          id : 'province'
        },
        country : {
          dependency : null,
          label : 'LOCATION.COUNTRY',
          column : 'country_en',
          id : 'country'
        }
      };
      var locationStore = namespace.locationStore = {};
      var initialised = false;

      appstate.register('enterprise', settup);
      
      function settup(enterprise) {
        var metaTemplate;
        var defaultLocation = scope[defaultVillageTag] || enterprise.location_id;
        indexLocationDependencies();
        defineLocationRequests();
      
        metaTemplate = generateTemplate('locationConfig');
        element.html($compile(metaTemplate)(scope));

        scope.$watch(defaultVillageTag, refreshDefaultVillage);
        scope.$watch(initialLocationTag, setInitialLocation);

        fetchInitialLocation(defaultLocation)
          .then(function (result) { 
            return initialiseLocation(result);          
          });
      }

      function setInitialLocation(nval, oval) {
	if (nval) {
          // Request new location 
          fetchInitialLocation(nval)
            .then(function (result) { 
              return initialiseLocation(result);
            });
	}
      }

      function refreshDefaultVillage(nval, oval) { 

        if (initialised) { 
          
          if (nval) { 

            // Request new location 
            fetchInitialLocation(nval)
            .then(function (result) { 
              return initialiseLocation(result);          
            });
          }
        }
      }

      function fetchInitialLocation(villageUuid) {
        return connect.fetch('/location/detail/' + villageUuid);
      }

      function initialiseLocation(defaultLocation) {
        defaultLocation = defaultLocation[0];
        
        Object.keys(locationConfig).forEach(function (key) {
          locationStore[key] = {model : {}, value : {}};
          // modelMap.push(locationStore[key].value);
          locationStore[key].value = defaultLocation[formatKeyId(key)];
        });

        // Initial request, update config with no dependency
        fetchLocationData(lookupDependency(null), null);
      }

      function submitVillage(uuid) { 
        initialised = true;
        scope[submitCallback](uuid);
        return;
      }
      
      function fetchLocationData(key, uuidDependency) {
        var config = locationConfig[key];
        var model, requires; 
        var requiredDependencyFailed;

        model = locationStore[key].model;
        requires = lookupDependency(key);
        
        // Conditions
        requiredDependencyFailed = !uuidDependency && config.dependency;
       
        // Clear results and stop propegation 
        if (requiredDependencyFailed) {
          
          model = locationStore[key].model = { data : [] };
         
          // FIXME hardcoded 
          if (requires) {
            fetchLocationData(requires, null);
          } else { 
            submitVillage(null);
          }
          return ;
        }
        
        if (config.dependency) {
          config.request.where = [key + '.' + formatKeyId(config.dependency) + '=' + uuidDependency];
        }

        // TODO Refactor : fetch and assign data from one function, each method 
        // responsible for only one thing
        // TODO Error / exception handling
        connect.req(config.request).then(function (result) {
          return assignLocationData(key, result);
        });
      }

      function assignLocationData(key, result) {
        var currentLocationValue, validCurrentLocation, locationsFound;
        var store = locationStore[key];
        var requiresCurrentKey = lookupDependency(key);
      
        store.model = result;
        currentLocationValue = store.value;

        // Conditions 
        validCurrentLocation = angular.isDefined(store.model.get(store.value));
        locationsFound = store.model.data.length;
        
        if (!validCurrentLocation) {
          store.value = null;
        }
        if (locationsFound && !validCurrentLocation) {
          store.value = store.model.data[0].uuid;
        }

               
        // Propegate selection
        if (requiresCurrentKey) {
          fetchLocationData(requiresCurrentKey, store.value);
        } else { 
          submitVillage(store.value);   
        }
      }

      function indexLocationDependencies() {
        Object.keys(locationConfig).forEach(function (key) {
          locationIndex[locationConfig[key].dependency] = key;
        });
      }
      
      function defineLocationRequests() {
        Object.keys(locationConfig).forEach(function (key) {
          var config = locationConfig[key];
          var request = {
            identifier : 'uuid',
            tables : {},
            order : [config.column]
          };
          request.tables[key] = {
            columns : ['uuid', config.column]
          };
          
          if (config.dependency) {
            request.tables[key].columns.push(formatKeyId(config.dependency));
          }
          config.request = request;
        });
      }
    
      function lookupModel(key) { 
        return locationStore[key].model || {};
      }

      // Search will only ever have to hit 4 elements, convenience method
      function lookupDependency(currentKey) {
        return locationIndex[currentKey];
      }

      function formatKeyId(key) {
        var uuidSuffix = '_uuid';
        return key.concat(uuidSuffix);
      }

      function generateTemplate(configLabel) { 
        var config = namespace[configLabel]; 
        var directiveStructure = '{{TEMPLATE_COMPONENTS}}';
        var compile = '';

        // Such meta templating
        var componentStructure = 
          '<div ng-class="{\'has-error\' : locationSelect.<%NAMESPACE%>.locationStore.<%CONFIGID%>.model.data.length===0}">' + 
          '<label class="control-label" for="location-select-<%CONFIGID%>">' + 
          '{{\"<%CONFIGLABEL%>\" | translate}}</label>' + 
          '<select ng-disabled="locationSelect.<%NAMESPACE%>.session.locationSearch || locationSelect.<%NAMESPACE%>.locationStore.<%CONFIGID%>.model.data.length===0" ng-model="locationSelect.<%NAMESPACE%>.locationStore.<%CONFIGID%>.value" ng-options="<%CONFIGID%>.uuid as <%CONFIGID%>.<%CONFIGCOLUMN%> for <%CONFIGID%> in locationSelect.<%NAMESPACE%>.locationStore.<%CONFIGID%>.model.data | orderBy : \'name\'" ng-change=<%CONFIGCHANGE%> class="form-control" id="location-select-<%CONFIGID%>"></select>' + 
          // '<span ng-if="locationSelect.<%NAMESPACE%>.locationStore.<%CONFIGID%>.model.data.length===0" class="glyphicon glyphicon-remove form-control-feedback"></span>' + 
          '</div>'; 
        var configurationList = Object.keys(config).reverse();
        
        configurationList.forEach(function (key) { 
          var configObject = config[key];
          var component = componentStructure;

          var changeSubmit = lookupDependency(key) ? 
            '\"locationSelect.<%NAMESPACE%>.fetchLocationData(\'' + lookupDependency(key) + '\', locationSelect.<%NAMESPACE%>.locationStore.' + configObject.id + '.value)\"' : 
            '\"locationSelect.<%NAMESPACE%>.submitVillage(locationSelect.<%NAMESPACE%>.locationStore.' + configObject.id + '.value)\"';  

          changeSubmit = changeSubmit.replace(/<%NAMESPACE%>/g, submitCallback);
          
          component = component.replace(/<%CONFIGID%>/g, configObject.id);
          component = component.replace(/<%CONFIGLABEL%>/g, configObject.label);
          component = component.replace(/<%CONFIGCOLUMN%>/g, configObject.column);
          component = component.replace(/<%CONFIGDEPEND%>/g, lookupDependency(key));
          component = component.replace(/<%NAMESPACE%>/g, submitCallback);
          component = component.replace(/<%CONFIGCHANGE%>/g, changeSubmit);

          compile = compile.concat(component);
        });

        return compile; 
      }
      
      namespace.lookupModel = lookupModel;
      namespace.fetchLocationData = fetchLocationData;
      namespace.submitVillage = submitVillage;
    }
  };
}]);
*/
