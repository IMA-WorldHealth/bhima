/* global expect, agent */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/stock/) The Stock HTTP API', () => {

  // create new stock lots
  it('POST /stock/lots create a new stock lots entry', async () => {
    const res = await agent.post('/stock/lots')
      .send(shared.movementFirstLots);
    helpers.api.created(res);
  });

  // create stock movement to patient
  it('POST /stock/lots/movements distribute lots to patients from a depot', async () => {

    const res1 = await agent.post('/stock/lots/movements').send(shared.movementOutPatient);
    helpers.api.created(res1);
    // get details of the movement
    const docUuid = res1.body.uuid;
    const res2 = await agent.get(`/stock/lots/movements?document_uuid=${docUuid}`);

    const mvtsByDocument = res2.body;
    const [firstMvt] = mvtsByDocument;
    const res3 = await agent.get(`/stock/lots/movements?reference=${firstMvt.documentReference}`);

    expect(res3.body).to.deep.equal(mvtsByDocument);

  });

  // create stock movement to depot
  it('POST /stock/lots/movements distributes stock lots to a depot', async () => {
    const res = await agent.post('/stock/lots/movements').send(shared.movementDepot);
    helpers.api.created(res);
  });

  // list all movement relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?depot_uuid=...
    returns movements for Depot Principal`,
    async () => {
      const res = await (agent.get('/stock/lots/movements')
        .query({ depot_uuid : shared.depotPrincipalUuid }));
      helpers.api.listed(res, shared.depotPrincipalMvt);
    },
  );

  // list all movement relatives to patient 'PA.TPA.2'
  it(
    `GET /stock/lots/movements?patientReference=PA.TPA.2 returns three movements for patient PA.TPA.2`,
    async () => {
      const res = await agent.get('/stock/lots/movements').query({ patientReference : 'PA.TPA.2' });
      helpers.api.listed(res, 4);
    },
  );

  // list all movement relatives to 'Service Administration'
  it(
    `GET /stock/lots/movements?service_uuid=...
    returns movements for Service Uuid (1 OUT)`,
    async () => {
      const res = await (agent.get(`/stock/lots/movements`)
        .query({ service_uuid : shared.serviceAdministrationUuid }));
      helpers.api.listed(res, 1);
    },
  );

  // list all stock exit relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?is_exit=1&depot_uuid=...
    returns list of lot exits for Depot Principal`,
    async () => {
      const res = await (agent.get(`/stock/lots/movements`)
        .query({
          is_exit : 1,
          depot_uuid : shared.depotPrincipalUuid,
        }));
      helpers.api.listed(res, 9);
    },
  );

  // (report) render all stock exit
  it(
    `GET /reports/stock/lots?renderer=json returns exits for all depots`,
    async () => {
      const res = await agent.get(`/reports/stock/lots?renderer=json`);
      expect(res.body.rows.length).to.equal(13);
    },
  );

  // (report) render all stock exit relatives to 'Depot Principal'
  it(
    `GET /reports/stock/lots?renderer=json
    returns render of all lot exits for Depot principal`,
    async () => {
      const res = await (agent.get(`/reports/stock/lots`)
        .query({
          renderer : 'json',
          depot_uuid : shared.depotPrincipalUuid,
        }));
      expect(res.body.rows.length).to.equal(11);
    },
  );

  // list all stock entry relatives to 'Depot Principal'
  it(
    `GET /stock/lots/movements?is_exit=0&depot_uuid=... returns entries for Depot Principal`,
    async () => {
      const res = await (agent.get('/stock/lots/movements')
        .query({
          is_exit : 0,
          depot_uuid : shared.depotPrincipalUuid,
        }));
      helpers.api.listed(res, 11);
    },
  );

  // get initial quantity of QUININE-A in 'Depot Principal'
  it(`GET /stock/lots returns initial quantity of QUININE-A in Depot Principal (100pcs)`, async () => {
    const res = await (agent.get('/stock/lots')
      .query({
        lot_uuid : shared.lotQuinineUuid,
        depot_uuid : shared.depotPrincipalUuid,
      }));
    helpers.api.listed(res, 1);
    const lotQuinine = res.body[0];
    expect(lotQuinine.initial_quantity).to.equal(100);
  });

  // list exit of QUININE-A from 'Depot Principal'
  it(`GET /stock/lots/movements?is_exit=1&lot_uuid=...&depot_uuid=... returns
    exit of QUININE-A from Depot Principal (101pcs)`, async () => {

    const res = await agent.get('/stock/lots/movements')
      .query({
        is_exit : 1,
        lot_uuid : shared.lotQuinineUuid,
        depot_uuid : shared.depotPrincipalUuid,
      });
    helpers.api.listed(res, 2);
    let totalExit = 1;
    res.body.forEach(row => {
      totalExit += row.quantity;
    });
    expect(totalExit).to.equal(101);
  });

  it(`GET /stock/lots/movements filters on user`, async () => {
    const res = await agent.get('/stock/lots/movements').query({ user_id : 1 });
    helpers.api.listed(res, 22);
  });

  // returns quantity of QUININE-A in 'Depot Principal'
  it(`
    GET /stock/lots/depots?lot_uuid=...&depot_uuid=...
    returns remaining quantity of QUININE-A in Depot Principal (80pcs)`,
  async () => {
    const res = await agent.get(`/stock/lots/depots`)
      .query({
        lot_uuid : shared.lotQuinineUuid,
        depot_uuid : shared.depotPrincipalUuid,
      });

    helpers.api.listed(res, 1);
    expect(res.body[0].quantity).to.equal(0);
  });

  it(`GET /stock/inventories/depots filters on expired lots`, async () => {
    const res = await agent.get(`/stock/inventories/depots`)
      .query({ limit : 1000, includeEmptyLot : 0, is_expired : 1 });
    helpers.api.listed(res, 2);
  });

  it(`GET /stock/inventories/depots filters on non-expired lots`, async () => {
    const res = await agent.get(`/stock/inventories/depots`)
      .query({ limit : 1000, includeEmptyLot : 0, is_expired : 0 });
    helpers.api.listed(res, 4);
  });

  it(`GET /stock/inventories/depots Get Inventories in Stock By Depot`, async () => {
    const res = await agent.get(`/stock/inventories/depots`)
      .query({
        depot_uuid : shared.depotPrincipalUuid,
        limit : 1000,
        includeEmptyLot : 0,
      });

    helpers.api.listed(res, 2);

    const labels = [
      'Vitamines B1+B6+B12, 100+50+0.5mg/2ml, Amp, Unité',
      'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
    ];

    const tLabels = res.body.map(i => i.text);
    expect(tLabels).to.deep.equal(labels);

    /*
     *
     * @FIXME(jniles) - only uncomment these and fix them when we use relative dates.
    const [
      tongueDepressor,
      vitamineB,
      acid,
      quinine,
    ] = res.body;

    expect(tongueDepressor.quantity, 'Tongue Depressor Quantity').to.equal(55400);
    expect(tongueDepressor.avg_consumption, 'Tongue Depressor Avg Consumption').to.equal(0);

    expect(tongueDepressor.cmms.algo1, 'Avg Algo 1').to.equal(0);
    expect(tongueDepressor.cmms.algo2, 'Avg Algo 2').to.equal(0);
    expect(tongueDepressor.cmms.algo3, 'Avg Algo 3').to.equal(0);
    expect(tongueDepressor.cmms.algo_msh, 'Avg Algo MSH').to.equal(0);

    expect(tongueDepressor.S_SEC, 'Tongue Depressor Security Stock').to.equal(0);
    expect(tongueDepressor.S_MIN, 'Tongue Depressor Min Stock').to.equal(0);
    expect(tongueDepressor.S_MAX, 'Tongue Depressor Max Stock').to.equal(0);
    expect(tongueDepressor.S_MONTH, 'Tongue Depressor Months of Stock').to.equal(55400);

    expect(vitamineB.quantity, 'Vitamine B Quantity').to.equal(140);
    expect(vitamineB.avg_consumption, 'Vitamine B Avg Consumption').to.equal(69.32);

    expect(vitamineB.cmms.algo1, 'Avg Algo 1').to.equal(4.18956043956044);
    expect(vitamineB.cmms.algo2, 'Avg Algo 2').to.equal(381.25);
    expect(vitamineB.cmms.algo3, 'Avg Algo 3').to.equal(4.14);
    expect(vitamineB.cmms.algo_msh, 'Avg Algo MSH').to.equal(69.32);

    expect(vitamineB.S_SEC, 'Vitamine B Security Stock').to.equal(69.32);
    expect(vitamineB.S_MIN, 'Vitamine B Min Stock').to.equal(138.64);
    expect(vitamineB.S_MAX, 'Vitamine B Max Stock').to.equal(138.64);
    expect(vitamineB.S_MONTH, 'Vitamine B Months of Stock').to.equal(2);

    expect(acid.quantity, 'Acide Acetylsalicylique Quantity').to.equal(180300);
    expect(acid.avg_consumption, 'Acide Acetylsalicylique Average Consumption').to.equal(0);

    expect(acid.cmms.algo1, 'Avg Algo 1').to.equal(0);
    expect(acid.cmms.algo2, 'Avg Algo 2').to.equal(0);
    expect(acid.cmms.algo3, 'Avg Algo 3').to.equal(0);
    expect(acid.cmms.algo_msh, 'Avg Algo MSH').to.equal(0);

    expect(acid.S_SEC, 'Acide Acetylsalicylique Security Stock').to.equal(0);
    expect(acid.S_MIN, 'Acide Acetylsalicylique Min Stock').to.equal(0);
    expect(acid.S_MAX, 'Acide Acetylsalicylique Max Stock').to.equal(0);
    expect(acid.S_MONTH, 'Acide Acetylsalicylique Months of Stock').to.equal(180300);

    expect(quinine.quantity, 'Quinine Quantity').to.equal(415);
    expect(quinine.avg_consumption, 'Quinine Avg Consumption').to.equal(177.91);

    expect(quinine.cmms.algo1, 'Avg Algo 1').to.equal(17.596153846153847);
    expect(quinine.cmms.algo2, 'Avg Algo 2').to.equal(1601.25);
    expect(quinine.cmms.algo3, 'Avg Algo 3').to.equal(17.4);
    expect(quinine.cmms.algo_msh, 'Avg Algo MSH').to.equal(177.91);

    expect(quinine.S_SEC, 'Quinine Security Stock').to.equal(177.91);
    expect(quinine.S_MIN, 'Quinine Min Stock').to.equal(355.82);
    expect(quinine.S_MAX, 'Quinine Max Stock').to.equal(355.82);
    expect(quinine.S_MONTH, 'Quinine Months of Stock').to.equal(2);
    */
  });

  it('POST /stock/lots create a new stock lots entry from donation', async () => {
    const result = await agent.post('/stock/lots').send(shared.movementFromDonation);
    helpers.api.created(result);

    const res = await agent.get(`/receipts/stock/${result.body.uuid}?lang=fr&posReceipt=0&renderer=json`);
    expect(res).to.have.status(200);

    const { details, rows } = res.body;
    const src = shared.movementFromDonation;

    // check that this is the same record
    expect(details.description).to.equal(src.description);
    const labels = rows.map(row => row.label);
    const srcLabels = src.lots.map(lot => lot.label);
    expect(labels).to.deep.equal(srcLabels);
  });
});
