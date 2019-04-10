/* global expect inject */
describe('RubricsConfigurationService', () => {
  let RubricsConfigs;
  let $httpBackend;
  let configs;

  beforeEach(module(
    'bhima.services',
    'angularMoment',
    'bhima.mocks',
    'ngStorage'
  ));

  beforeEach(inject((_ConfigurationService_, _$httpBackend_) => {
    RubricsConfigs = _ConfigurationService_;
    $httpBackend = _$httpBackend_;

    /**
     * Configuration des Rubriques
    */
    const rubricConfigId = 1;

    const configRubricItems = [{
      id : 1,
      config_rubric_id : 1,
      rubric_payroll_id : 1,
    }, {
      id : 2,
      config_rubric_id : 1,
      rubric_payroll_id : 2,
    }, {
      id : 3,
      config_rubric_id : 1,
      rubric_payroll_id : 1,
    }, {
      id : 4,
      config_rubric_id : 1,
      rubric_payroll_id : 4,
    }];

    configs = [{
      id : 1,
      label : 'Configuration des rubriques',
    }, {
      id : 2,
      label : 'Nouvelle Configuration',
    }];

    $httpBackend.when('GET', '/rubric_config')
      .respond(configs);

    const baseUrl = `/rubric_config/${rubricConfigId}`;
    $httpBackend.when('GET', `${baseUrl}/setting`)
      .respond(configRubricItems);
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Count the Numbers of Rubrics Configured For the period 1', () => {
    let value;

    RubricsConfigs.getRubrics(1)
      .then(rubrics => {
        value = rubrics;
      });

    $httpBackend.flush();

    expect(value).to.have.length(4);
  });

  it('Count the Numbers of Rubrics Configured For the period Undefined', () => {
    let value;
    expect(RubricsConfigs.getRubrics).to.throw('Trying to get configuration of rubrics without the identity property');
  });
});
