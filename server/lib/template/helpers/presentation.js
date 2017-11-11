// FIX ME : this functions are very tailed to income expense reportType

function getTitle(reportType) {
  const map = {
    1 : 'TREE.INCOME_EXPENSE',
    2 : 'FORM.LABELS.INCOME',
    3 : 'FORM.LABELS.EXPENSE',
  };

  return map[reportType];
}

function isIncomeViewable(reportType) {
  return reportType === 1 || reportType === 2;
}

function isExpenseViewable(reportType) {
  return reportType === 1 || reportType === 3;
}

function isResultViewable(reportType) {
  return reportType === 1;
}

exports.getTitle = getTitle;
exports.isIncomeViewable = isIncomeViewable;
exports.isExpenseViewable = isExpenseViewable;
exports.isResultViewable = isResultViewable;
