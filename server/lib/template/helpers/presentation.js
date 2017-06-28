function getTitle(report_type){
    const map = {
        1 : 'TREE.INCOME_EXPENSE',
        2 : 'FORM.LABELS.INCOME',
        3 : 'FORM.LABELS.EXPENSE',
    };
    
    return map[report_type];
}

exports.getTitle = getTitle;