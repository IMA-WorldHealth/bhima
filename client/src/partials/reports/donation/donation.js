angular.module('bhima.controllers')
.controller('ReportDonationController', reportDonationController);

reportDonationController.$inject = [
  '$translate', 'appstate', 'validate', 'util', 'SessionService'
];

function reportDonationController ($translate, appstate, validate, util, SessionService) {
  var vm = this,
      dependencies = {},
      state = vm.state,
      session = vm.session = {};

  dependencies.donor = {
    required: true,
    query : {
      tables : {
        'donor' : {
          columns : ['id', 'name']
        }
      }
    }
  };

  dependencies.donation = {
    query : {
      tables : {
        'donations'     : { columns : ['date'] },
        'donation_item' : { columns : ['tracking_number'] },
        'stock'         : { columns : ['inventory_uuid', 'quantity', 'lot_number', 'expiration_date'] },
        'inventory'     : { columns : ['text'] },
        'donor'         : { columns : ['name::donorName'] },
        'employee'      : { columns : ['name::employeeName'] },
        'purchase'      : { columns : ['uuid::purchaseUuid'] },
        'purchase_item' : { columns : ['unit_price'] }
      },
      join : [
        'donation_item.donation_uuid=donations.uuid',
        'donation_item.tracking_number=stock.tracking_number',
        'inventory.uuid=stock.inventory_uuid',
        'donor.id=donations.donor_id',
        'employee.id=donations.employee_id',
        'stock.purchase_order_uuid=purchase.uuid',
        'purchase_item.purchase_uuid=purchase.uuid',
        'purchase_item.inventory_uuid=inventory.uuid'
      ],
      orderby : ['donations.date', 'donor.name', 'inventory.text'],
    }
  };

  // Initialise models
  vm.session.dateFrom = new Date();
  vm.session.dateTo   = new Date();

  // Expose to the view
  vm.reconfigure = reconfigure;
  vm.getDonor    = getDonor;
  vm.generate    = generate;
  vm.print       = function () { print(); };

  // Start the module up
  startup();

  // Functions
  function startup () {
    vm.enterprise = SessionService.enterprise;
    validate.process(dependencies, ['donor']).then(init);
  }

  function init (model) {
    angular.extend(vm, model);

    if (model.donation) {
      session.stockValue = model.donation.data.reduce(sum, 0);
    }
  }

  function getDonor () {
    if (!session.donor) {
      session.labelDonor = '' + $translate.instant('UTIL.ALL_DONORS');
    } else {
      session.labelDonor = vm.donor.get(session.donor).name;
    }
  }

  function sum(a, b) {
  	return a + (b.unit_price * b.quantity);
  }

  function reconfigure () {
    vm.state = null;
  }

  function generate () {
    vm.state = 'generate';
    if (session.donor) {
      dependencies.donation.query.where = ['donor.id=' + session.donor,'AND','purchase.is_donation=1','AND','donations.date>=' + util.sqlDate(session.dateFrom),'AND','donations.date<=' + util.sqlDate(session.dateTo)];
    } else {
      dependencies.donation.query.where = ['donations.date>=' + util.sqlDate(session.dateFrom),'AND','donations.date<=' + util.sqlDate(session.dateTo)];
    }

    validate.refresh(dependencies, ['donation'])
    .then(init);
  }

}
