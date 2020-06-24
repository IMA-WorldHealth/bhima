/**
 * This file contains shared elements for ward management
 */

const testService = 'aff85bdc-d7c6-4047-afe7-1724f8cd369e';
const adminService = 'b1816006-5558-45f9-93a0-c222b5efa6cb';

const ward1 = {
  uuid : 'F5A7264926C94F5DBFFA098207A7F24D', // exists in db
  name : 'Pavillon A',
  description : 'Test pavillon A',
  service_uuid : testService,
};

const ward2 = {
  uuid : 'F4CE5F9FEDD34BD29B9C43B116C02747', // exists in db
  name : 'Pavillon B',
  description : 'Test pavillon B',
  service_uuid : adminService,
};

const room1 = {
  uuid : 'A6F9527BA7B44A2C9F4FDD7323BBCF72', // exists in db
  label : 'Room A in Ward A',
  ward_uuid : ward1.uuid,
  room_type_id : 1,
};

const room2 = {
  uuid : '3BD2C0DB6A574B748AE774554BCBC35D', // exists in db
  label : 'Room B in Ward B',
  ward_uuid : ward2.uuid,
};

const bed1 = {
  id : 10,
  label : 'Bed 1',
  room_uuid : room1.uuid,
};

const bed2 = {
  id : 11,
  label : 'Bed 2',
  room_uuid : room2.uuid,
};

module.exports = {
  ward1,
  ward2,
  room1,
  room2,
  bed1,
  bed2,
};
