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

// Define needed UUIDs
const lot1Uuid = uuid();
const lot2Uuid = uuid();
const lot3Uuid = uuid();

// Inventory UUID for: Vitamines B1+B6+B12, 100+50+0.5mg/2ml
const vitamineUuid = 'F6556E729D0547998CBD0A03B1810185';

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

const lot1Label = 'Test lot 1';
const lot2Label = 'Test lot 2';
const lot3Label = 'Test Lot 1';

const mockLots = [
  // uuid, label
  [lot1Uuid, lot1Label, vitamineUuid],
  [lot2Uuid, lot2Label, vitamineUuid],
  [lot3Uuid, lot3Label, vitamineUuid], // This is a dupe of the first lot
];

const mockTags = [
  [uuid(), lot1Uuid, 'XYZ Brand'],
  [uuid(), lot1Uuid, 'Vitamin'],
  [uuid(), lot2Uuid, 'Partial'],
  [uuid(), lot3Uuid, 'Vitamin2'],
];

describe('(/lot/:uuid/merge) Merge lots', () => {

  before('Note original numbers of lots, tags, etc', () => {
    return preTestInfo.reduce((chain, item) => {
      return chain
        .then(() => db.exec(`SELECT * FROM ${item.table}`)
          .then(res => {
            item.count = res.length;
          }));
    }, Promise.resolve());
  });

  // before('Test', () => {
  //   console.log("db: ", preTestInfo);
  // });

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

  it(`Temporarily added ${mockLots.length} mock lots`, () => {
    expect(true).to.be.equals(true);
  });
  it(`Temporarily added ${mockTags.length} mock lot tags`, () => {
    expect(true).to.be.equals(true);
  });

  // ===========================================================================
  // Verify we have created the lots, tags, etc
  it('Verify we created lot1 and its dupe (lot3)', () => {
    return agent.get('/lot/dupes')
      .query({ label: lot1Label, inventory_uuid: vitamineUuid })
      .then((res) => {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });
  it('Verify we created lot2', () => {
    return agent.get('/lot/dupes')
      .query({ label: lot2Label, inventory_uuid: vitamineUuid })
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
  // NOW do the tests


//   // -------------------------------------------------------------------------------------
//   // Various name checks
//   it('Get matches for 2-part names like "John Smith"', () => {
//     const testName = 'John Smith';
//     const conditions = { search_name : testName };
//     return agent.get('/patients')
//       .query(conditions)
//       .then((res) => {
//         helpers.api.listed(res, 2);
//         // Sort the list, best match first
//         const matches = res.body.sort((a, b) => { return (b.matchScore - a.matchScore); });
//         expect(matches[0].display_name).to.be.equals(testName);
//         expect(matches[0].matchScore).to.be.equals(1);
//         expect(matches[1].display_name).to.be.not.equals(testName);
//         expect(matches[1].matchScore).to.be.lt(1);
//       })
//       .catch(helpers.handler);
//   });

  // ===========================================================================
  // Cleanup

  // Delete the mock lot tags
  after('Clean up temporary tags and lot tags', () => {
    return mockTags.reduce((chain, p) => {
      return chain
        .then(() => db.exec(`DELETE FROM lot_tag WHERE lot_uuid=0x${p[1]};`))
        .then(() => db.exec(`DELETE FROM tags WHERE uuid=0x${p[0]};`));
    }, Promise.resolve());
  });

  after('Clean up temporary lots', () => {
    return mockLots.reduce((chain, p) => {
      return chain
        .then(() => db.exec(`DELETE FROM lot WHERE uuid=0x${p[0]};`));
    }, Promise.resolve());
  });

  after('Verify that we have deleted all temporary lots, tags, etc', () => {
    return preTestInfo.reduce((chain, item) => {
      return chain
        .then(() => db.exec(`SELECT * FROM ${item.table}`)
          .then(res => {
            expect(res.length).to.be.equals(item.count, `Verify deletion of temporary '${item.table}'`);
          }));
    }, Promise.resolve());
  });

});
