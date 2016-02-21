/**
 * The cash box finder component
 *
 * @module components/bhCashBoxFinder
 *
 * @description a component to deal with cash box, it let you choose a cash box
 * 
 **/
 
 //A cash box finder component controller
 
 function cashBoxFinderController (CashboxService, $translate){
 	
 	var ctrl = this;
  var filter = null;
 	ctrl.types = [{label : 'CASH_BOX_TYPE.PRIMARY', is_auxillary : 0, is_bank :  0, full : 1},
 					      {label : 'CASH_BOX_TYPE.AUXILLARY', is_auxillary : 1, is_bank : 0, full : 1}
 				       ];
 	ctrl.selectedType = ctrl.types[0];


 	function init () {
 		ctrl.selectedCash = null;
 		ctrl.cashBoxValue = null;
	 	ctrl.session = {
	 		state : 'finding'
	 	};
    filter = {
      is_auxillary : ctrl.selectedType.is_auxillary,
      is_bank : ctrl.selectedType.is_bank,
      full : ctrl.selectedType.full
    };

	 	fetchcash(filter);
 	}

 	function setType (type){
  	ctrl.selectedType = type;
    filter = {
      is_auxillary : ctrl.selectedType.is_auxillary,
      is_bank : ctrl.selectedType.is_bank,
      full : ctrl.selectedType.full
    };
  	fetchcash(filter);
  }

  	function selectCashBox (item){
  		ctrl.selectedCash = item;
  		ctrl.cashBoxValue = item.account_id;
  		ctrl.session.state = 'found';
  	}

  	function search (text) {
  		var list = ctrl.cashboxes.filter(function (item){
  			var match = new RegExp(text, 'i').test(item.text + item.symbol);
  			return match;
  		});

  		return list;
  	}

  	function fetchcash(filter){
  		CashboxService.filteredRead(filter)
  			.then(function (cashboxes){
  				ctrl.cashboxes = cashboxes;
  			});
  	}

    function reload () {
    	init();
    }

    init();

  	ctrl.reload = reload;
  	ctrl.search = search;
  	ctrl.selectCashBox = selectCashBox;
  	ctrl.setType = setType;
}

 cashBoxFinderController.$inject = ['CashboxService', '$translate'];
 
 //component implementation
angular.module('bhima.components').component('bhCashBoxFinder', {
	templateUrl : '/partials/templates/bhCashBoxFinder.tmpl.html',
 	controller : cashBoxFinderController,
 	bindings : {
 		cashBoxValue : '='
 	}
});