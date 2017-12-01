/* eslint global-require:off */
const { expect } = require('chai');
const chai = require('chai');
const q = require('q');

// change this timeout if the tests are failing on the unsubscribe() block
const DELAY_TIMEOUT = 20;

function listenerFactory() {
  const p = q.defer();
  const listener = () => p.resolve();
  const spy = chai.spy(listener);
  return { p, listener, spy };
}

function TopicUnitTests() {
  let topic;
  before(() => {
    // enable events for this test only
    process.env.ENABLE_EVENTS = true;
    topic = require('../../server/lib/topic');
  });

  it('Topic should not be disabled on startup', () => {
    expect(topic.disabled).to.equal(false);
  });

  it('#subscribe() listens to events published in it\'s channel', () => {
    const channel = 'A';
    const data = { text : 'hello world' };

    const { p, spy } = listenerFactory();

    topic.subscribe(channel, spy);
    topic.publish(channel, data);

    return p.promise
      .then(() => {
        // called only a call
        expect(spy).to.have.been.called.exactly(1);
        expect(spy).to.have.been.called.with(data);
      });
  });

  it('#subscribe() does not leak events outside of it\'s channel', () => {
    const data = 'ok octopus';

    const { p, spy } = listenerFactory();
    const spyB = chai.spy();

    // subscribe to two different channels
    topic.subscribe('A', spy);
    topic.subscribe('B', spyB);

    topic.publish('A', data);

    return p.promise.then(() => {
      // only channel 'A' should have been called
      expect(spy).to.have.been.called.exactly(1);
      expect(spy).to.have.been.called.with(data);
      expect(spyB).to.not.have.been.called();
    });
  });

  it('#publish() will call a subscription multiple times.', () => {
    const { p, spy } = listenerFactory();
    const last = 'Number 3';

    topic.subscribe('A', spy);

    topic.publish('A', 'Number 1');
    topic.publish('A', 'Number 2');
    topic.publish('A', last);

    return p.promise.then(() => {
      // channel 'A' should have been called 3 times
      expect(spy).to.have.been.called.exactly(3);
      expect(spy).to.have.been.called.with(last);
    });
  });

  it('#unsubscribe() will remove listeners from a channel', () => {
    const channel = 'C';
    const { p, spy } = listenerFactory();

    topic.subscribe(channel, spy);
    topic.publish(channel, 'First Call!');

    return p.promise
      .then(() => {
        expect(spy).to.have.been.called();

        // remove subscription
        topic.unsubscribe(channel, spy);

        // publish a few more times
        topic.publish(channel, 'Second Call!');
        topic.publish(channel, 'Third Call!');

        // delay some ms to let redis try and
        return q.delay(DELAY_TIMEOUT);
      })
      .then(() => {
        expect(spy).to.have.been.called.exactly(1);
      });
  });

  it('topic exports channels, events, and entities', () => {
    expect(topic.channels).to.be.an('object');
    expect(topic.channels).to.have.any.keys('ALL');
    expect(topic.entities).to.be.an('object');
    expect(topic.events).to.be.an('object');
  });
}


describe('lib/topic.js', TopicUnitTests);
