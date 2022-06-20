angular.module('bhima.services')
  .service('AssetsRegistryService', AssetsRegistryService);

AssetsRegistryService.$inject = [
  'uiGridConstants', 'SessionService',
];

/**
 * This service encapsulate some common methods of the Asset registry with the aims
 * of reducing lines in registry.js
 */
function AssetsRegistryService(uiGridConstants, Session) {
  const service = this;

  service.groupingBox = [
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'STOCK.INVENTORY_GROUP', value : 'group_name' },
  ];

  service.columnDefs = [
    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerTooltip : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    }, {
      field : 'inventory_code',
      displayName : 'STOCK.CODE',
      headerTooltip : 'INVENTORY.CODE',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 0,
      },
    }, {
      field : 'inventory_label',
      displayName : 'STOCK.INVENTORY',
      headerTooltip : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 1,
      },
    }, {
      field : 'group_name',
      displayName : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerTooltip : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    }, {
      field : 'label',
      displayName : 'ASSET.ASSET_LABEL',
      headerTooltip : 'ASSET.ASSET_LABEL_TOOLTIP',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    }, {
      field : 'barcode',
      displayName : 'BARCODE.BARCODE',
      headerTooltip : 'BARCODE.BARCODE',
      headerCellFilter : 'translate',
      visible : false,
    }, {
      field : 'lot_description',
      displayName : 'FORM.LABELS.DESCRIPTION',
      headerTooltip : 'FORM.LABELS.DESCRIPTION',
      headerCellFilter : 'translate',
      visible : false,
    }, {
      field : 'quantity',
      displayName : 'STOCK.QUANTITY',
      headerTooltip : 'STOCK.QUANTITY',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
      visible : false,
    }, {
      field : 'unit_cost',
      displayName : 'STOCK.UNIT_COST',
      headerTooltip : 'STOCK.UNIT_COST',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      type : 'number',
      cellFilter : 'currency: '.concat(Session.enterprise.currency_id),
    }, {
      field : 'entry_date',
      displayName : 'STOCK.ENTRY_DATE',
      headerTooltip : 'STOCK.ENTRY_DATE_TOOLTIP',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
    }, {
      field : 'assigned_to_name',
      displayName : 'ENTITY.ASSIGNED_TO',
      headerTooltip : 'ENTITY.ASSIGNED_TO',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
    }, {
      field : 'assignment_created_at',
      displayName : 'LOTS.ASSIGNMENT_CREATED',
      headerTooltip : 'LOTS.ASSIGNMENT_CREATED',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
      visible : false,
    }, {
      field : 'assignment_description',
      displayName : 'LOTS.ASSIGNMENT_DESCRIPTION',
      headerTooltip : 'LOTS.ASSIGNMENT_DESCRIPTION',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      visible : false,
    }, {
      field : 'scan_date',
      displayName : 'ASSET.LAST_SCAN_DATE',
      headerTooltip : 'ASSET.LAST_SCAN_DATE',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
      visible : false,
    }, {
      field : 'scan_condition',
      displayName : 'ASSET.ASSET_CONDITION',
      headerTooltip : 'ASSET.ASSET_CONDITION',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'translate',
      visible : false,
    }, {
      field : 'tagNames',
      displayName : 'TAG.LABEL',
      headerTooltip : 'TAG.LABEL',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/tags.cell.html',
      visible : false,
    }, {
      field : 'documentReference',
      displayName : 'TABLE.COLUMNS.REFERENCE',
      headerTooltip : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
      visible : false,
    }, {
      field : 'reference_number',
      displayName : 'FORM.LABELS.REFERENCE_NUMBER',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      width : 100,
      visible : false,
    }, {
      field : 'manufacturer_brand',
      displayName : 'FORM.LABELS.MANUFACTURER_BRAND',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      width : 100,
    }, {
      field : 'manufacturer_model',
      displayName : 'FORM.LABELS.MANUFACTURER_MODEL',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      width : 100,
    }, {
      field : 'serial_number',
      displayName : 'FORM.LABELS.SERIAL_NUMBER',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      width : 100,
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/assets/templates/action.cell.html',
    }];

  service.orderByDepot = (rowA, rowB) => {
    return String(rowA.depot_text).localeCompare(rowB.depot_text);
  };

  service.gridFooterTemplate = `
    <div style="padding-left: 10px;">
      <b>{{ grid.appScope.countGridRows() }}</b>
      <span translate>TABLE.AGGREGATES.ROWS</span>
    </div>
`;
}
