module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": ["airbnb", "eslint:recommended", "plugin:react/recommended"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": ["react", "react-hooks"],
    "globals": {
        "APP_ENV": true
    },
    "settings": {
        "import/resolver": {
          "babel-module": {}
        }
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "react/jsx-filename-extension": 0,
        "no-invalid-this": 0,
        "import/no-commonjs": 0,
        "react/jsx-no-bind": 0,
        "react/prop-types": 1,
        "import/prefer-default-export": 0,
        "no-console": 1,
        "react/no-array-index-key": 0,
        "react/forbid-prop-types": 0,
        "react/require-default-props": 0
    }
};