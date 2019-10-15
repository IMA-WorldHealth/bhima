angular.module('bhima.services')
  .service('FillFormService', FillFormService);

FillFormService.$inject = ['PrototypeApiService'];

/**
 * @class FillFormService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /fill_form/ URL.
 */
function FillFormService(Api) {
  const service = new Api('/fill_form/');

  service.formatData = formatData;
  service.restoreImage = restoreImage;
  service.formatConstraint = formatConstraint;

  function formatData(form, data) {
    const dataSurveyForm = {};
    // Ici l'on verifie les occurences des donnees existantes
    // S'il sont multiples afin de les affecter dans des tableaux
    form.forEach(f => {
      data.forEach(d => {
        if ((f.id === d.survey_form_id) && (f.type === '4')) {
          dataSurveyForm[f.name] = [];
        }
      });
    });

    form.forEach(f => {
      data.forEach(d => {
        // Pour les identifiants des listes des choix,
        // il est primordiale de le transormer en Integer
        if ((f.id === d.survey_form_id) && (f.type === '4')) {
          // Multiple choice list management
          dataSurveyForm[f.name].push(parseInt(d.value, 10));
        } else if ((f.id === d.survey_form_id) && (f.type !== '4') && (f.type !== '7')) {
          // Single choice list management
          d.value = (f.type === '1') ? parseFloat(d.value) : d.value;
          d.value = (f.type === '3') ? parseInt(d.value, 10) : d.value;

          // format date
          d.value = (f.type === '6') ? new Date(d.value) : d.value;
          dataSurveyForm[f.name] = d.value;
        } else if ((f.id === d.survey_form_id) && (f.type === '7')) {

          // format time
          const newDate = new Date();
          const timeSplit = d.value.split(':');
          dataSurveyForm[f.name] = newDate.setHours(timeSplit[0], timeSplit[1]);
        }
      });
    });

    return dataSurveyForm;
  }

  function restoreImage(data) {
    return service.$http.post(`/fill_form/restoreImage`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  /*
    * This function is used to format the value of the constraint
    * to a valid angular expression, the value encapsulate in. {} Must be transformed into
    * FillFormModalCtrl.form. and if the eval function
    * is incorrectly evaluates the return function a null value
  */

  function formatConstraint(constraint) {
    // valueA format the constaint for input type text and number
    let valueA = constraint.replace(/.{/g, 'FillFormModalCtrl.form.');
    valueA = valueA.replace(/}/g, '');

    // valueB format the contraint for input type select one
    let valueB = constraint.replace(/.{/g, 'FillFormModalCtrl.containtValue.');
    valueB = valueB.replace(/}/g, '');

    return `(${valueA}) || (${valueB})` || null;

  }

  return service;
}
