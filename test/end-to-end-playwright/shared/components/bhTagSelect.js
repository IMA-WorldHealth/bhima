const TU = require('../TestUtils');

const selector = '[bh-tag-select]';

module.exports = {

  set : async function set(tags) {
    const root = await TU.locator(selector);

    const select = await TU.getModel('$ctrl.tagUuids', root);
    await select.click();
    if (Array.isArray(tags)) {
      tags.forEach(async tag => {
        await select.locator('.dropdown-menu [role="option"]').locator(`//*[contains(text(), '${tag}')]`).click();
      });
      return true;
    }

    return TU.uiSelect('$ctrl.tagUuids', tags, root);
  },
};
