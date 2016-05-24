/* jshint expr:true*/
const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

describe('(/system) System Information', () => {

  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  it('GET /system/events downloads a list of events', () => {
    agent.get('/system/events')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length.above(1);
      })
      .catch(helpers.handler);
  });


  it('GET /system/information downloads the system architecture', () => {
    agent.get('/system/information')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(
          'platform', 'numCPUs', 'machineUptime', 'processUptime', 'memoryUsage',
          'version'
        );

        expect(res.body.memoryUsage).to.satisfy((x) => { return x > 0 && x < 1; });
        expect(res.body.processUptime).to.be.above(0);
        expect(res.body.machineUptime).to.be.above(0);
      })
      .catch(helpers.handler);
  });
});
