
// FIX ME : this functions are very tailed to income expense report_type

function getTitle(report_type){
    const map = {
        1 : 'TREE.INCOME_EXPENSE',
        2 : 'FORM.LABELS.INCOME',
        3 : 'FORM.LABELS.EXPENSE',
    };
    
    return map[report_type];
}

function isIncomeViewable (report_type){
    return report_type === 1 || report_type === 2;
}

function isExpenseViewable (report_type){
    return report_type === 1 || report_type === 3;
}

function isResultViewable (report_type){
    return report_type === 1;
}

exports.getTitle = getTitle;
exports.isIncomeViewable = isIncomeViewable;
exports.isExpenseViewable = isExpenseViewable;
exports.isResultViewable = isResultViewable;