const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-tag-select]',
  set      : async function set(tags) {
    const root = $(this.selector);

    if (Array.isArray(tags)) {
      for (let index = 0; index < tags.length; index++) {
        const tag = tags[index];
        // eslint-disable-next-line no-await-in-loop
        await FU.uiSelect('$ctrl.tagUuids', tag, root);
      }
    } else {
      await FU.uiSelect('$ctrl.tagUuids', tags, root);
    }
  },
};
