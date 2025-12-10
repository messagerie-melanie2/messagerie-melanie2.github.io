---
layout: default
title: Configuration JsDoc
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/configuration_modules)

```
{
    "source": {
        "exclude": ["Roundcube-plugins-Mel/node_modules", "node_modules", "Roundcube-Mel/plugins", "Roundcube-Mel/skins/mel_elastic", "Roundcube-Mel/vendor", "Roundcube-Mel/public_html", "Roundcube-Mel/installer"],
        "excludePattern": ".*\\.min\\.js$"

    },
    "opts": {
        "template": "node_modules/tui-jsdoc-template"
    },
    "plugins": ["plugins/local", "plugins/fromModule"]
}

```