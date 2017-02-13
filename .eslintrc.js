module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "parserOptions" : {
    "sourceType": "module"
  },
  "rules" : {
    "padded-blocks": ["error", "never"],
    "indent": ["error", 2]
  },
  "globals" : {
    "Chart" : true,
    "Angular" : true,
  }
};
