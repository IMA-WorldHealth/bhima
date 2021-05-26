const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-tag-select]',
  set      : async function set(tags) {
    const root = $(this.selector);

    if (Array.isArray(tags)) {
      const stack = [];
      for (let index = 0; index < tags.length; index++) {
        const tag = tags[index];
        stack.push(FU.uiSelect('$ctrl.tagUuids', tag, root));
      }
      await Promise.all(stack);
    } else {
      await FU.uiSelect('$ctrl.tagUuids', tags, root);
    }
  },
};
