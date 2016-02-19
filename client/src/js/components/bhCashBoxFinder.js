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
 	ctrl.types = [
 					{label : $translate.instant('CASH_BOX_TYPE.PRIMARY'), is_auxillary : 0, is_bank :  0},
 					{label : $translate.instant('CASH_BOX_TYPE.AUXILLARY'), is_auxillary : 1, is_bank : 0},
 					{label : $translate.instant('CASH_BOX_TYPE.BANK'), is_bank : 1, is_auxillary : 0}
 				 ];
 	ctrl.selectedType = ctrl.types[0];

 	function init () {
 		ctrl.selectedCash = null;
 		ctrl.cashBoxValue = null;
	 	ctrl.session = {
	 		state : 'finding'
	 	}
	 	fetchcash('?full=1&is_auxillary=' + ctrl.selectedType.is_auxillary + '&is_bank=' + ctrl.selectedType.is_bank);
 	}

 	function setType (type){
    	ctrl.selectedType = type;
    	fetchcash('?full=1&is_auxillary=' + type.is_auxillary + '&is_bank=' + type.is_bank);
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