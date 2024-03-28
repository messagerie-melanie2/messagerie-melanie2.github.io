---
layout: default
title: Configuration ESLINT
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/configuration_modules)

```
{
	"env": {
		"browser": true,
		"es6": true,
		"node": false
	},
	"extends": ["eslint:recommended"],
	"parserOptions": {
		"ecmaVersion": 2020,
		"sourceType": "module"
	},
	"rules": {
		"no-unsafe-optional-chaining": "off",
		"no-debugger": 1,
		"no-undef": "warn",
		"no-shadow": "error",
		"yoda": ["error", "never"],
		"eqeqeq": ["error", "always"],
		"semi": ["error", "always"],
		"quotes": ["error", "single"],
		"no-console": "off",
		"object-curly-spacing": ["error", "always"],
		"func-name-matching": [
			"error",
			"always",
			{
				"includeCommonJSModuleExports": false,
				"considerPropertyDescriptor": true
			}
		],
		"vars-on-top": "error",
		"new-cap": ["error", { "capIsNewExceptionPattern": "\\.[A-Z]" }]
	}
}
```