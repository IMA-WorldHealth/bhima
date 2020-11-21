/* global expect, agent */

const fs = require('fs');
const helpers = require('../helpers');
const shared = require('./shared');

describe.skip('(/stock/import) The stock import http API', () => {
  const templateCsvHeader = 'inventory_group_name,inventory_code,inventory_text,inventory_type,inventory_unit,inventory_unit_price,inventory_cmm,stock_lot_label,stock_lot_quantity,stock_lot_expiration';
  const templateCsvContent = '"Comprimé", "00001", "Quinine sulfate 500mg", "article", "comprimé", "0.02", "300", "QNN2020", "24000", "2020-12-31"';

  const file = './test/fixtures/stock-to-import.csv';
  const invalidFile = './test/fixtures/bad-stock-to-import.csv';
  const filename = 'stock-to-import.csv';
  const numberOfStockToAdd = 10;

  const params = { depot_uuid : shared.depotPrincipalUuid };

  let totalLotsBeforeImport;

  /**
   * test the /stock/import API for downloading
   * the stock template file
   */
  it('GET /stock/import/template download the inventory template file', () => {
    return agent.get('/stock/import/template')
      .then(res => {
        expect(res).to.have.status(200);
        const pattern = String(res.text).includes('\r\n') ? '\r\n' : '\n';
        const [header, content] = String(res.text).split(pattern);
        expect(header).to.be.equal(templateCsvHeader);
        expect(content).to.be.equal(templateCsvContent);
      })
      .catch(helpers.handler);
  });

  /**
   * test the /stock/import API for importing
   * stock from a csv file and comparing totals before and after the import
   */
  it('POST /stock/import/ upload the filled template file as new import for stock', () => {

    // get the number of lots before the import
    return agent.get(`/stock/lots/depots?depot_uuid=${params.depot_uuid}`)
      .then(res => {
        totalLotsBeforeImport = res.body.length;

        // import inventories from a csv file
        return agent.post('/stock/import')
          .type('form')
          .field('depot_uuid', params.depot_uuid)
          /**
           * to attach file into req.files please use fs.createReadStream
           * fs.readFileSync doesn't work because it insert the file into req.body.file
           */
          .attach('file', fs.createReadStream(file), filename)
          .then(innerRes => {
            expect(innerRes).to.have.status(201);

            // get the number of lots after the import
            return agent.get(`/stock/lots/depots?depot_uuid=${params.depot_uuid}`);
          });
      })
      .then(res => {
        const totalLotsAfterImport = res.body.length;

        expect(totalLotsAfterImport).to.be.equal(totalLotsBeforeImport + numberOfStockToAdd);
      })
      .catch(helpers.handler);
  });

  /**
   * test an upload of a bad csv file
   */
  it('POST /stock/import blocks an upload of a bad csv file for inventory import', () => {
    return agent.post('/stock/import')
      .type('form')
      .field('depot_uuid', params.depot_uuid)
      .attach('file', fs.createReadStream(invalidFile))
      .then(res => {
        helpers.api.errored(res, 400, 'ERRORS.BAD_DATA_FORMAT');
      })
      .catch(helpers.handler);
  });
});
