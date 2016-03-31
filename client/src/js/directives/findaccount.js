angular.module('bhima.directives')
.directive('findAccount', ['$compile', 'validate', 'messenger', 'appcache', 
	function($compile, validate, messenger, Appcache) {
  	return {
    	restrict: 'A',
    	templateUrl : 'partials/templates/findaccount.tmpl.html',
    	link : function(scope, element, attrs) {
      	var dependencies = {},
          searchCallback = null,
          resetCallback = null,
          selectedAccount = null,
          submitCallback = scope[attrs.onSubmit];

      	if (!submitCallback) { throw new Error('Account search account directive must implement onSubmit callback function'); }
      	scope.findAccount = {
					valid : null,
					enableReset : false,
					enableSubmit : true
				};
      // Get optional callback functions
      	if ('onSearchComplete' in attrs) {
					searchCallback = scope[attrs.onSearchComplete];
				}
      	if ('onReset' in attrs) {
					resetCallback = scope[attrs.onReset];
				}
      // See if the reset button should be shown
      	if ('enableReset' in attrs) {
					scope.findAccount.enableReset = true;
				}
      // See if the submit button should be shown
      	if ('hideSubmit' in attrs) {
					scope.findAccount.enableSubmit = false;
				}

      // Define the database query
      	dependencies.accounts = {
					query : {
          	tables : {
            	'account' :{
              	columns : ['*']
          		}
          	}
					}
   		  };
 
      // See if where clauses are given
      if ('where' in attrs) {
				dependencies.accounts.query.where = scope[attrs.where]();
			}

      //TODO Downloads all accounts for now - this should be swapped for an asynchronous search
      validate.process(dependencies).then(function (models) {
				scope.accounts = models.accounts.data;
      });


      function getAccount(accountId) {
				if (isNaN(accountId)) {
	  			return null;
				}
				var data = scope.accounts.filter(function (obj) { 
	  			return obj.id === scope.accountId; 
				});

				
				if (data.length !== 1) {
	  			throw new Error('Error in findAccount directive: account not found!');
	  		}
				return data[0];
      }

      function formatAccount(account) {
				if (account) {
	  			if (!isNaN(account)) {
	    			var data = getAccount(scope.accountId);
	    			if (data) {
	      			selectedAccount = data;
	      			scope.accountId = data.label + ' [' + data.number + ']';
	      			scope.findAccount.valid = true;
	      		}
	  			}
				}
				if (selectedAccount) {
	  			return selectedAccount.label + ' [' + selectedAccount.number + ']';
	  		} else {
	  			return account ? account.label : '';
				}
      }

      function requestAccount() {
				var account = getAccount(scope.accountId);
				if (account && searchCallback) {
	  			searchCallback(account);
				}
      }

      function clearForm() {
	  		scope.accountId = null;
	  		selectedAccount = null;
	  		scope.findAccount.valid = false;
			}

      function submitAccount() {
				submitCallback(selectedAccount);
				clearForm();
      }

      function resetSearch() {
				clearForm();
				if (resetCallback) {
	  			resetCallback();
				}
      }

      scope.findAccount.format = formatAccount;
      scope.findAccount.request = requestAccount;
      scope.findAccount.submit = submitAccount;
      scope.findAccount.reset = resetSearch;
    }
  };
}]);
