angular.module('bhima.services')
  .service('LotsRegistryService', LotsRegistryService);

LotsRegistryService.$inject = [
  'uiGridConstants', 'SessionService',
];

/**
 * This service encapsulate some common method of stock lots registry with the aims
 * of reducing lines in registry.js
 */
function LotsRegistryService(uiGridConstants, Session) {
  const service = this;

  service.groupingBox = [
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'STOCK.INVENTORY_GROUP', value : 'group_name' },
  ];

  service.columnDefs = [
    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    }, {
      field : 'code',
      displayName : 'STOCK.CODE',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 0,
      },
    }, {
      field : 'text',
      displayName : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 1,
      },
    }, {
      field : 'group_name',
      displayName : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerCellFilter : 'translate',
    }, {
      field : 'label',
      displayName : 'STOCK.LOT',
      headerCellFilter : 'translate',
    }, {
      field : 'quantity',
      displayName : 'STOCK.QUANTITY',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'unit_cost',
      displayName : 'STOCK.UNIT_COST',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
      cellFilter : 'currency: '.concat(Session.enterprise.currency_id),
    }, {
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventories/templates/unit.tmpl.html',
    }, {
      field : 'entry_date',
      displayName : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    }, {
      field : 'expiration_date',
      displayName : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    }, {
      field : 'delay_expiration',
      displayName : 'STOCK.EXPIRATION',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
    }, {
      field : 'avg_consumption',
      displayName : 'STOCK.CMM',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'S_MONTH',
      displayName : 'STOCK.MSD',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'lifetime',
      displayName : 'STOCK.LIFETIME',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      cellTemplate     : 'modules/stock/lots/templates/lifetime.cell.html',
      type : 'number',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 2,
      },
    }, {
      field : 'S_LOT_LIFETIME',
      displayName : 'STOCK.LOT_LIFETIME',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/lot_lifetime.cell.html',
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'S_RISK',
      displayName : 'STOCK.RISK',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/risk.cell.html',
      cellClass : 'text-right',
      type : 'number',
      sort : {
        direction : uiGridConstants.DESC,
        priority : 3,
      },
    }, {
      field : 'S_RISK_QUANTITY',
      displayName : 'STOCK.RISK_QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/risk_quantity.cell.html',
      type : 'number',
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/lots/templates/action.cell.html',
    }];

  service.gridFooterTemplate = `
    <div>
      <b>{{ grid.appScope.countGridRows() }}</b>
      <span translate>TABLE.AGGREGATES.ROWS</span>
    </div>
  `;

  service.orderByDepot = (rowA, rowB) => {
    return String(rowA.depot_text).localeCompare(rowB.depot_text);
  };
}
