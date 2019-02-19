// FIX ME : this functions are very tailed to income expense reportType

function getTitle(reportType) {
  const map = {
    1 : 'TREE.INCOME_EXPENSE',
    2 : 'FORM.LABELS.INCOME',
    3 : 'FORM.LABELS.EXPENSE',
  };

  return map[reportType];
}

function slashed(text) {
  return text.replace(/\\/g, '/');
}

exports.getTitle = getTitle;
exports.slashed = slashed;
