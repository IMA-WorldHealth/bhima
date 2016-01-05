// store.spec.js

var expect = require('chai').expect,
    Store = require('../lib/store');

describe('Store', function () {
  var store = new Store(),
      data = [
        { id : 1, name : 'bob'},
        { id : 2, name : 'jeff'}
      ];

  beforeEach(function () {
    // clone the array
    store.setData(data.slice(0));
  });

  describe('#setData', function () {

    // empty array
    store.setData([]);
    expect(store.data).to.exist;
    expect(store.data).to.be.empty;

    // full data set
    store.setData(data.slice(0));
    expect(store.data).to.exist;
    expect(store.data).to.not.be.empty;
  });

  describe('#get', function () {

    // expected behavoir
    var bob = store.get(1);
    expect(bob).to.exist;
    expect(bob).to.eql(data[0]);

    // make sure no unexpected behavior occurs on bad
    // input
    var empty = store.get(null);
    expect(empty).to.not.exist;
  });


  describe('#post', function () {
    var record = {id : 3, name : 'Jack'},
        length = store.data.length;
    store.post(record);

    // retrieve posted record
    var jack = store.get(3);
    expect(jack).to.exist;
    expect(jack).to.eql(record);
    expect(store.data.length).to.equal(length + 1);

    // post creates an id for a record if not exists
    var record2 = { name : 'Katherine' };
    store.post(record2);
    var rec = store.data.filter(function (o) { return o.name === 'Katherine'; })[0];
    expect(store.get(rec.id)).to.exist;
    expect(store.get(rec.id).name).to.equal('Katherine');
    expect(store.get(rec.id)).to.have.property('id');
  });


  describe('#remove()', function () {
    var length = store.data.length;

    // make sure you can remove a record;
    store.remove(1);
    expect(store.data.length).to.equal(length - 1);
    expect(store.get(1)).to.not.exist;

    // deleting a non-existant record should fail silently;
    store.remove(-1);
    expect(store.data.length).to.equal(length - 1);
  });

  describe('#contains', function () {
    expect(store.contains(2)).to.be.true;
    expect(store.contains(-1)).to.be.false;
  });

  describe('#put', function () {
    store.setData(data);

    var record = { id : 1, name: 'homer' },
        record2 = { id: 12, name : 'frank' },
        length = store.data.length;

    // TODO
    // I'm pretty sure put() should modify existing records without changing
    // other properties.  Design a test for this case

    // put should modify existing records
    store.put(record);
    expect(store.get(1)).to.eql(record);
    expect(store.data.length).to.equal(length);

    // put should ignore records that are not in the database
    store.put(record2);
    expect(store.get(record2.id)).to.not.exist;
    expect(store.data.length).to.equal(length);
  });
});
