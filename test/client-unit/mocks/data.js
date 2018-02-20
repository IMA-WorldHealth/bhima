(() => {
  angular.module('bhima.mocks', [])
    .service('MockDataService', MockDataService);

  function MockDataService() {
    const service = this;

    service.cashboxes = () => [{
      id : 1,
      label : 'Little Cash Window',
      account_id : 1100,
      is_auxiliary : 1,
      transfer_account_id : 1200,
      symbol : '$ (USD)',
      currency_id : 1,
    }, {
      id : 2,
      label : 'Little Cash Window',
      account_id : 1101,
      is_auxiliary : 1,
      transfer_account_id : 1201,
      symbol : 'EUR',
      currency_id : 2,
    }, {
      id : 3,
      label : 'Main Coffre',
      account_id : 1102,
      is_auxiliary : 0,
      transfer_account_id : 1202,
      symbol : '$ (USD)',
      currency_id : 1,
    }, {
      id : 4,
      label : 'Secondary Coffre',
      account_id : 1103,
      is_auxiliary : 0,
      transfer_account_id : 1203,
      symbol : 'EUR',
      currency_id : 2,
    }];

    service.user = () => ({
      id : 1,
      username : 'admin',
      display_name : 'Administrator',
      password : 'superuser',
      email : 'admin@bhi.ma',
    });

    service.enterprise = () => ({
      id : 1,
      name : 'Test Enterprise',
      abbr : 'TE',
      location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
      currency_id : 1,
    });

    service.project = () => ({
      id : 1,
      name : 'Test Project A',
      abbr : 'TPA',
      enterprise_id : 1,
    });

    service.services = () => [{
      id : 1,
      enterprise_id : 1,
      name : 'Administration',
    }, {
      id : 2,
      enterprise_id : 1,
      name : 'Surgery',
    }, {
      id : 2,
      enterprise_id : 1,
      name : 'Internal Medicine',
    }];

    // purposely pluralized this to indicate it returns an array
    service.inventories = () => [{
      enterprise_id : 1,
      uuid : 'd03e7870-0c8e-47d4-a7a8-a17a9924b3f4',
      code : '100001',
      text : 'Acetazolamide 250mg',
      price : 0.8900,
      default_quantity : 1,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }, {
      enterprise_id : 1,
      uuid : '5bcfb8b5-1ac0-49fa-8668-dad254a7de3d',
      code : '100044',
      text : 'Doxycyline 100mg',
      price : 0.0200,
      default_quantity : 20,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }, {
      enterprise_id : 1,
      uuid : 'd2f7ef71-6f3e-44bd-8056-378c5ca26e20',
      code : '100070',
      text : 'Mefloquine 250mg',
      price : 0.9600,
      default_quantity : 10,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }, {
      enterprise_id : 1,
      uuid : '43f3decb-fce9-426e-940a-bc2150e62186',
      code : '100102',
      text : 'Quinine sulphate 500mg',
      price : 0.1500,
      default_quantity : 8,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }, {
      enterprise_id : 1,
      uuid : '1d9507a7-b6ce-4e80-b63a-ff10c6cda039',
      code : '120080',
      text : 'Coartem tab',
      price : 0.1397,
      default_quantity : 25,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }, {
      enterprise_id : 1,
      uuid : 'b7d66f77-2f43-490f-a3fd-0feb3941ef4d',
      code : '100117',
      text : 'Vitamine B complex tab',
      price : 0.0100,
      default_quantity : 20,
      group_uuid : '8d85a207-7c04-4d60-8891-fec7e5774b3d',
    }];

    service.accounts = () => [{
      id : 0,
      label : 'Mock Root Account',
      type_id : 1,
      parent : null,
    }, {
      id : 1,
      label : 'Mock Account A',
      type_id : 2,
      parent : 0,
    }, {
      id : 2,
      label : 'Mock Account B',
      type_id : 2,
      parent : 0,
    }];
  }
})();
