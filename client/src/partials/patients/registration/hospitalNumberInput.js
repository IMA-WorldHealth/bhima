angular.module('bhima.directives')
.directive('hospitalNumber', HospitalNumber);
  
HospitalNumber.$inject = [ '$q', '$http' ];

function HospitalNumber($q, $http) { 
  
  return { 
    require : 'ngModel',
    scope : { 
      registeredValue : '='
    },
    link : function (scope, elm, attrs, ctrl) { 

      ctrl.$asyncValidators.hospitalNumber = function (modelValue, viewValue) { 
        var deferred;
        var path = '/patients/checkHospitalId/';

        if (ctrl.$isEmpty(modelValue)) { 
          return $q.when();
        }
        
        // Ignore the current registered patients hospital number, this should not be flagged as existing 
        // as it belongs to the current patient
        if (modelValue === scope.registeredValue) { 
          return $q.when();
        }

        deferred = $q.defer();
        
        $http.get(path.concat(modelValue))
          .then(function (result) { 
            var hospitalNumberStatus = result.data;

            if (hospitalNumberStatus.registered) { 
              deferred.reject();
            } else { 
              deferred.resolve();
            }
          })
          .catch(function (error) { 

            // TODO Pass error back up through to controller to handle generic errors
            deferred.reject();
          });
        
        return deferred.promise;
      };
    }
  };
}
