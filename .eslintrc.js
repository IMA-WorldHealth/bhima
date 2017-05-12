module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "env" : {
    "browser" : true,
    "node" : true,
    "jquery" : true,
    "mocha" : true
  },
  "rules" : {
    "padded-blocks": "warn",
    "array-bracket-spacing" : "warn",
    "prefer-arrow-callback" : "warn",
    "indent": ["error", 2],
    "comma-dangle" : ["error", "always-multiline"],
    "key-spacing": ["warn", {
      "singleLine": {
        "beforeColon": true,
        "afterColon": true
      },
      "multiLine": {
        "beforeColon": true,
        "afterColon": true,
        "mode" : "minimum"
      }
    }],
    "no-use-before-define": ["error", {
      "functions": false
    }],
    "no-param-reassign": ["error", { "props": false }],
    "no-var" : "off",
    "max-len": ["warn", 120],
    "func-names" : ["warn", "as-needed"],
    "no-underscore-dangle": ["error", {
      "allowAfterThis": true
    }],
    "quotes" : ["error", "single", { "allowTemplateLiterals": true }],
    "arrow-parens" : "off",
    "arrow-body-style" : "off",
    "prefer-arrow-callback" : "off",
    "no-underscore-dangle" : "off",
    "no-unused-vars" : "off",
    "no-extra-boolean-cast" : "off",
  },
  "globals" : {
    "Chart" : true,
    "angular" : true,
  }
};
