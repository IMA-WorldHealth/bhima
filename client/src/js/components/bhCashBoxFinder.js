/**
 * The cash box finder component
 *
 * @module components/bhCashBoxFinder
 *
 * @description a component to deal with cash box, it let you choose a cash box
 * 
 **/
 
 //A cash box finder component controller
 
 function cashBoxFinderController (CashboxService){
 	
 	var ctrl = this;
 	ctrl.types = [
    {label : 'CASH_BOX_TYPE.PRIMARY', is_auxillary : 0, is_bank :  0, full : 1},
 		{label : 'CASH_BOX_TYPE.AUXILLARY', is_auxillary : 1, is_bank : 0, full : 1}
 	];

 	function load () {
 		ctrl.selectedCash = null;
 		ctrl.cashBoxValue = null;
	 	ctrl.session = { state : 'finding'};
    setType(ctrl.types[0]);    
 	}

 	function setType (type){
  	ctrl.selectedType = type;
    var opt = {
      is_auxillary : ctrl.selectedType.is_auxillary,
      is_bank : ctrl.selectedType.is_bank,
      full : ctrl.selectedType.full
    };
  	fetchcash(opt);
  }

	function selectCashBox (item){
		ctrl.selectedCash = item;
		ctrl.cashBoxValue = item.account_id;
		ctrl.session.state = 'found';
	}

	function search (text) {
		return ctrl.cashboxes.filter(function (item){
			return new RegExp(text, 'i').test(item.text + item.symbol); //build a regex a look for text occurence in the cash label without case sensive
		});
	}

	function fetchcash(opt){
		CashboxService.read(null, { params : opt})
			.then(function (cashboxes){
				ctrl.cashboxes = cashboxes;
			});
	}

  load();

	ctrl.load = load;
	ctrl.search = search;
	ctrl.selectCashBox = selectCashBox;
	ctrl.setType = setType;
}

 cashBoxFinderController.$inject = ['CashboxService'];
 
 //component implementation
angular.module('bhima.components').component('bhCashBoxFinder', {
	templateUrl : '/partials/templates/bhCashBoxFinder.tmpl.html',
 	controller : cashBoxFinderController,
 	bindings : {
 		cashBoxValue : '='
 	}
});