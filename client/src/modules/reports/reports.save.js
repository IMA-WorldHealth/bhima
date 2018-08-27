angular.module('bhima.controllers')
  .controller('SaveReportController', SaveReportController);

SaveReportController.$inject = [
  '$uibModalInstance', 'NotifyService', 'BaseReportService', 'options', 'LanguageService',
];

function SaveReportController(ModalInstance, Notify, SavedReports, options, Languages) {
  const vm = this;
  vm.documentOptions = {};
  vm.report = options.report;

  vm.dismiss = ModalInstance.dismiss;

  /* @TODO verify that options passed in are valid */
  // @TODO this should be derived from the server or compiled in during the build process
  //       it should also be possible to override this depending on the support of each individual report
  vm.supportedRenderTypes = [
    { key : 'pdf', label : 'REPORT.UTIL.PDF' },
    { key : 'word', label : 'REPORT.UTIL.WORD' },
    { key : 'excel', label : 'REPORT.UTIL.EXCEL' },
  ];
  // mapping each renderer to it submition function
  const optionsMap = {
    pdf : exportToPdf,
    word : exportToWord,
    excel : exportToExcel,
  };

  vm.documentOptions.renderer = vm.supportedRenderTypes[0].key;
  vm.submit = function submit(SaveForm) {
    if (SaveForm.$invalid) { return 0; }
    return optionsMap[vm.documentOptions.renderer]();
  };

  function exportToPdf() {
    vm.documentOptions.renderer = vm.supportedRenderTypes[0].key;
    vm.documentOptions.lang = Languages.key;

    // @TODO this can directly be loaded from the form
    const reportOptions = angular.merge(vm.documentOptions, options.reportOptions);

    return SavedReports.saveReport(options.url, options.report, reportOptions)
      .then(result => {
        Notify.success('REPORT.UTIL.SAVE_SUCCESS');
        ModalInstance.close(result);
      })
      .catch(Notify.handleError);
  }

  vm.setDocumentorientation = function setDocumentorientation(orientation) {
    vm.documentOptions.orientation = orientation;
  };

  // excel
  function exportToExcel() {
    const htmlString = window.frames.report.htmlContent();
    const uri = `data:application/vnd.ms-excel;base64,`;
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns="http://www.w3.org/TR/REC-html40">
    <head>
     <meta charset="utf-8"></head> ${htmlString}</html>`;

    const base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    };
    const format = function (s, c) {
      return s.replace(/{(\w+)}/g, (m, p) => {
        return c[p];
      });
    };

    const link = document.createElement('a');
    link.download = `${vm.documentOptions.label}.xls`;
    link.href = uri + base64(format(template));
    link.click();
    ModalInstance.close();
  }

  // word
  function exportToWord() {
    const htmlString = window.frames.report.htmlContent();
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>`;
    const postHtml = `</body></html>`;
    const html = `${preHtml} ${htmlString} ${postHtml}`;

    const blob = new Blob(['\ufeff', html], {
      type : 'application/msword',
    });
    // Specify link url
    const url = `data:application/vnd.ms-word;charset=utf-8,${encodeURIComponent(html)}`;
    const _filename = `${vm.documentOptions.label}.doc`;
    // Create download link element
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, _filename);
    } else {
      downloadLink.href = url;
      downloadLink.download = _filename;
      downloadLink.click();
    }
    document.body.removeChild(downloadLink);
    ModalInstance.close();
  }
}
