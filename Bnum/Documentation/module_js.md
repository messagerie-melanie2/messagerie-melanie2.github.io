---
layout: default
title: Anatomie d'un module javascript
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/)

#Hérite de MelObject

```
/**
* @module MaClass
*/

import { MelObject } from "../../../../mel_metapage/js/lib/mel_object.js":
import { MelEnumerable } from "../../../../mel_metapage/js/lib/classes/enum.js":
export { MaClass }

/**
* @class
* @classdesc Description de la classe
* @extends MelObject
*/
MaClass extends MelObject {
    constructor() { super(); }

    /**
    * Initialise les membres de la classe
    * @package (privée, mais affiché sur la doc)
    * @return {MaClass} Chaînage
    */
    _init() {
        /*
        * Description de la variable membre
        * @type {Object.<!string, any>}
        */
        this._data = {};

        return this;
    }

    /**
    * On écrit le code principale de la fonction
    */
    main() {
        super.main();

        this._init()._generate_listeners();
    }

    /**
    * Génère les listeners
    * @package
    */
    _generate_listeners() {
        this.rcmail().addEventListener('refresh', this.update_data.bind(this));
        this.add_event_listener('refresh', this.update_data_bind(this));
    }

    /*
    * Récupère les données
    * @return {Generator}
    */
    get_data() {
        return MelEnumerable.from(this._data).select(x => x.value);
    }

    /*
    * Ajoute un objet aux données
    * @param {any} item Objet a être ajouté
    * @return {MaClass} Chaînage
    */
    add(item) {
        this._data[MaClass.GenerateId()] = item;

        return this;
    }

    /**
    * Est appelé par les listeners
    * @param {any} data
    */
    update_data(data) {
        this._data = MelEnumerable.from(data).toJsonDictionary(x => x.index, x => x.convert());
        this.rcmail().triggerEvent('MaClass.Updated', {obj:this});
    }

    /**
    * Génère un Id
    * @static
    * @return {number}
    */
    static GenerateId() {
        let id = '';

        //Do something

        return id;
    }
}
```