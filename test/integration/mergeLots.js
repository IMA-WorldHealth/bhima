/* global expect, agent */

// eslint-disable no-unused-expressions

const moment = require('moment');
const UUID = require('uuid').v4;
const helpers = require('./helpers');
const db = require('../../server/lib/db');

function uuid() {
  return UUID().toUpperCase().replace(/-/g, '');
}

const preTestInfo = [
  { table: 'lot', count: 0 },
  { table: 'tags', count: 0 },
  { table: 'lot_tag', count: 0 },
];
// const lotPreTest = preTestInfo[0];
const tagsPreTest = preTestInfo[1];
const lotTagsPreTest = preTestInfo[2];

// Inventory UUID for: Vitamines B1+B6+B12, 100+50+0.5mg/2ml
const vitamineUuid = 'F6556E729D0547998CBD0A03B1810185';

// Define needed UUIDs and labels
const lot1Uuid = uuid();
const lot2Uuid = uuid();
const lot3Uuid = uuid();
const lot4Uuid = uuid();
const lot5Uuid = uuid();

const lot1Label = 'Test lot 1';
const lot2Label = 'Test lot 2';
const lot3Label = 'Test Lot 1';
const lot4Label = 'Test Lot 1';
const lot5Label = 'Test Lot 1';

const mockLots = [
  // uuid, label, inventory_uuid
  [lot1Uuid, lot1Label, vitamineUuid],
  [lot2Uuid, lot2Label, vitamineUuid],
  [lot3Uuid, lot3Label, vitamineUuid], // This is a dupe of the first lot
  [lot4Uuid, lot4Label, vitamineUuid], // This is another dupe of the first lot
  [lot5Uuid, lot5Label, vitamineUuid], // This is another dupe of the first lot
];

const tag3Uuid = uuid();
const tag4Uuid = uuid();
const tag5Uuid = uuid();

const mockTags = [
  // uuid, lot uuid, tag text
  [uuid(), lot1Uuid, 'XYZ Brand'],
  [uuid(), lot1Uuid, 'Vitamin'],
  [uuid(), lot2Uuid, 'Partial'],
  [tag3Uuid, lot3Uuid, 'Vitamin2'],
  [tag4Uuid, lot4Uuid, 'Vitamin3'],
  [tag5Uuid, lot5Uuid, 'Vitamin4'],
];

function addLotSQL(params) {
  const [lotUuid, label, inventoryUuid] = params;
  const expDate = moment().add(1, 'year').format('YYYY-MM-DD');
  return 'INSERT INTO lot (uuid, label, inventory_uuid, quantity, '
    + '  initial_quantity, unit_cost, expiration_date, origin_uuid) '
    + `VALUES (0x${lotUuid}, '${label}', 0x${inventoryUuid}, 321, `
    + `  500, 1.2, '${expDate}', 0x${uuid()});`;
}

function addTagSQL(params) {
  const [tagUuid, /* lotUuid */, tagLabel] = params;
  return 'INSERT INTO tags (uuid, name) '
    + `VALUES (0x${tagUuid}, '${tagLabel}');`;
}

function addLotTagSQL(params) {
  const [tagUuid, lotUuid, /* tagLabel */] = params;
  return 'INSERT INTO lot_tag (lot_uuid, tag_uuid) '
    + `VALUES (0x${lotUuid}, 0x${tagUuid});`;
}


describe('Test merging lots', () => {

  before('Note original counts of lots, tags, etc', () => {
    return preTestInfo.reduce((chain, item) => {
      return chain
        .then(() => db.exec(`SELECT * FROM ${item.table}`)
          .then(res => {
            item.count = res.length;
          }));
    }, Promise.resolve());
  });

  before('add mock lots', () => {
    return mockLots.reduce((chain, p) => {
      return chain
        .then(() => db.exec(addLotSQL(p)));
    }, Promise.resolve());
  });

  before('add mock lot tags', () => {
    return mockTags.reduce((chain, p) => {
      return chain
        .then(() => db.exec(addTagSQL(p)))
        .then(() => db.exec(addLotTagSQL(p)));
    }, Promise.resolve());
  });

  it(`Adding temporary mock lots, tags, and lot tags`, () => {
    expect(true).to.be.equals(true);
  });

  // ===========================================================================
  // Verify we have created the lots, tags, etc
  it('Verify we created lot1 and its dupes (lot3, lot4, lot5)', () => {
    return agent.get('/lot/dupes')
      .query({ label: lot1Label, inventory_uuid : vitamineUuid })
      .then((res) => {
        helpers.api.listed(res, 4); // The lot itself and 3 dupes
      })
      .catch(helpers.handler);
  });
  it('Verify we created lot2', () => {
    return agent.get('/lot/dupes')
      .query({ label: lot2Label, inventory_uuid : vitamineUuid })
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });
  it(`Verify we created ${mockTags.length - tagsPreTest.count} tags`, () => {
    return agent.get('/tags')
      .then((res) => {
        helpers.api.listed(res, mockTags.length + tagsPreTest.count);
      })
      .catch(helpers.handler);
  });
  it(`Verify we created ${mockTags.length - lotTagsPreTest.count} lot tags`, () => {
    return db.exec('SELECT * from lot_tag')
      .then((res) => {
        expect(res.length).to.be.equals(mockTags.length + lotTagsPreTest.count);
      })
      .catch(helpers.handler);
  });

  // ===========================================================================
  // NOW do the merge tests

  it('Merge lot 3 with lot 1 (single lot)', () => {
    return agent.post(`/lots/${lot1Uuid}/merge`)
      .send({ lotsToMerge : [lot3Uuid] })
      .then(res => {
        // Verify the operation was successful
        expect(res).to.have.status(200);
      })
      .then(() => {
        // Verify lot3 no longer exists
        db.exec(`SELECT * from lot WHERE uuid = 0x${lot3Uuid}`)
          .then((res) => {
            expect(res.length).to.be.equals(0);
          });
      })
      .then(() => {
        // Verify that tag3 now points to lot1
        db.exec(`SELECT HEX(lot_uuid) as lot_uuid from lot_tag WHERE tag_uuid = 0x${tag3Uuid}`)
          .then((res) => {
            expect(res.length).to.be.equals(1);
            expect(res[0].lot_uuid).to.be.equals(lot1Uuid);
          });
      });
  });

  it('Merge lots 4 and 5 with lot 1 (multiple lots)', () => {
    return agent.post(`/lots/${lot1Uuid}/merge`)
      .send({ lotsToMerge : [lot4Uuid, lot5Uuid]})
      .then(res => {
        // Verify the operation was successful
        expect(res).to.have.status(200);
      })
      .then(() => {
        // Verify lots 4 and 5 no longer exist
        db.exec(`SELECT * from lot WHERE uuid IN (0x${lot4Uuid}, 0x${lot5Uuid})`)
          .then((res) => {
            expect(res.length).to.be.equals(0);
          });
      })
      .then(() => {
        // Verify that tag4 now points to lot1
        db.exec(`SELECT HEX(lot_uuid) as lot_uuid from lot_tag WHERE tag_uuid = 0x${tag4Uuid}`)
          .then((res) => {
            expect(res.length).to.be.equals(1);
            expect(res[0].lot_uuid).to.be.equals(lot1Uuid);
          });
      })
      .then(() => {
        // Verify that tag5 now points to lot1
        db.exec(`SELECT HEX(lot_uuid) as lot_uuid from lot_tag WHERE tag_uuid = 0x${tag5Uuid}`)
          .then((res) => {
            expect(res.length).to.be.equals(1);
            expect(res[0].lot_uuid).to.be.equals(lot1Uuid);
          });
      });
  });

  // ===========================================================================
  // Cleanup

  it(`Deleting all temporary mock lots, tags, and lot tags`, () => {
    expect(true).to.be.equals(true);
  });

  // Delete the mock lot tags
  after('Delete temporary tags and lot tags', () => {
    return mockTags.reduce((chain, p) => {
      return chain
        .then(() => db.exec(`DELETE FROM lot_tag WHERE lot_uuid=0x${p[1]};`))
        .then(() => db.exec(`DELETE FROM tags WHERE uuid=0x${p[0]};`));
    }, Promise.resolve());
  });

  after('Delete temporary lots', () => {
    return mockLots.reduce((chain, p) => {
      return chain
        .then(() => db.exec(`DELETE FROM lot WHERE uuid=0x${p[0]};`));
    }, Promise.resolve());
  });

  after('Verify we have deleted all temporary lots, tags, etc', () => {
    return preTestInfo.reduce((chain, item) => {
      return chain
        .then(() => db.exec(`SELECT * FROM ${item.table}`)
          .then(res => {
            expect(res.length).to.be.equals(item.count, `Verify deletion of temporary '${item.table}'`);
          }));
    }, Promise.resolve());
  });

});
