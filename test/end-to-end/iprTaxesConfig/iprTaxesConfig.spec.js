const helpers = require('../shared/helpers');
const IprTaxConfigPage = require('./iprTaxesConfig.page');
const chai = require('chai');


/** configuring helpers* */
helpers.configure(chai);

describe('Ipr Tax Configuration Scale Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/ipr_tax/configuration'));

  const Page = new IprTaxConfigPage();

  const iprTaxScale = {
    scale : 'IPR 2013',
    rate : 0,
    tranche_annuelle_debut : 0,
    tranche_annuelle_fin : 524160,
  };

  const iprTaxScale2 = {
    scale : 'IPR 2013',
    rate : 15,
    tranche_annuelle_debut : 524160,
    tranche_annuelle_fin : 1428000,
  };

  const iprTaxScale2000 = {
    scale : 'IPR 2000',
    rate : 20,
    tranche_annuelle_debut : 12000,
    tranche_annuelle_fin : 24000,
  };

  const iprTaxScale2000Update = {
    scale : 'IPR 2000',
    rate : 0,
    tranche_annuelle_debut : 0,
    tranche_annuelle_fin : 72000,
  };

  it('successfully creates a Scale 1 in IPR Scale 2013', () => {
    Page.createIprTaxConfig(iprTaxScale);
  });

  it('successfully creates a Scale 2 in IPR Scale 2013', () => {
    Page.createIprTaxConfig(iprTaxScale2);
  });

  it('successfully creates a Scale 1 in IPR Scale 2000', () => {
    Page.createIprTaxConfig(iprTaxScale2000);
  });

  it('successfully edits Scale for IPR 2000', () => {
    Page.editIprTaxConfig(iprTaxScale2000.rate, iprTaxScale2000Update);
  });

  it('successfully delete a Ipr tax Scale', () => {
    Page.deleteIprTaxConfig(iprTaxScale2000Update.rate);
  });

  it('don\'t create when incorrect Ipr Tax', () => {
    Page.errorOnCreateIprTaxConfig(iprTaxScale.scale);
  });
});
