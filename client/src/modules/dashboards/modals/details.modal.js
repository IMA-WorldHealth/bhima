angular.module('bhima.controllers')
  .controller('IndicatorDetailsModalController', IndicatorDetailsModalController);

IndicatorDetailsModalController.$inject = ['data', '$uibModalInstance', '$timeout'];

function IndicatorDetailsModalController(Data, Instance, $timeout) {
  /* global muze */
  const vm = this;
  vm.params = Data;
  vm.close = Instance.close;

  const data = [
    { value : 20, name : 'Janvier' },
    { value : 35, name : 'Fevrier' },
    { value : 14, name : 'Mars' },
    { value : 21, name : 'Avril' },
    { value : 27, name : 'Mai' },
    { value : 40, name : 'Juin' },
    { value : 18, name : 'Juillet' },
    { value : 10, name : 'Aout' },
    { value : 22, name : 'Septembre' },
    { value : 50, name : 'Octobre' },
  ];

  const schema = [
    { name : 'value', type : 'measure' },
    { name : 'name' },
  ];

  const { DataModel } = muze;
  const dm = new DataModel(data, schema);

  const env = muze(); // Initialize the Muze environment
  const canvas = env.canvas(); // Create a container canvas

  $timeout(() => {
    canvas
      .data(dm)
      .width(600) // Specify width of visualization (canvas) in pixels
      .height(400) // Specify height of visualization (canvas) in pixels
      .rows(['value'])
      .columns(['name'])
      .mount('#indicator-chart');
  }, 0);
}
