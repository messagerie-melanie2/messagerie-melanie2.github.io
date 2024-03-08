---
layout: default
title: Anatomie d'un module javascript
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/)

- [Hérite de MelObject](#hérite-de-melobject)
- [Structure ou classe utile](#structure-ou-classe-utile)
- [Bonne pratiques](#bonne-pratiques)
- [JsDoc](#jsdoc)
    - [Structure](#structure)
    - [Callback](#callback)
    - [Lien vers JSDoc](https://jsdoc.app/)

# Hérite de MelObject

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
        this.trigger_event('MaClass.Updated', {obj, this});
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

# Structure ou classe utile
```
/*
* @module MaStruct
*/
export { MaStruct }

/**
* @class
* @classdesc Description de la classe
class MaStruct {
    /**
    * @param {...any} args Description des paramètres
    */ 
    constructor(...args) {

    }

    /**
    * Initialise les membres de la classe
    * @private
    * @return {MaStruct} Chaînage
    */
    _init() {
        //[...]
        //protected
        //private
        //public
        //const

        return this;
    }

    /**
    * Assigne les variables
    * @private
    * @param {...any} args Description des paramètres
    * @return {MaStruct} Chaînage
    */
    _setup(...args) {
        //[...]
        return this;
    }

    /**
    * Code principale de la classe, optionnel si inutile
    * @param {...any} args Description des paramètres
    * @return {MaStruct} Chaînage
    */
    _main(...args) {
        //[...]
        return this;
    }

    _p_protected_function() {}

    _private_function() {}

    public_function() {}

    static _PrivateStaticFunction() {}

    static PublicStaticFunction() {}
}

/**
* Description de la donnée constante
* @type {string}
* @constant
*/
MaStruct.CONSTANT = 'SOMETHING';

Object.defineProperty(MaStruct, 'CONSTANT', {
    value:MaStruct.CONSTANT,
    writable:false,
    configurable:false
});
```

# Bonne pratiques

On initialise les variables membres dans `_init()`.    
On assigne dans `_setup(...args)`.    
et on code dans `_main(...args)`.    
La variable se nomme `main(...args)` si on hérite de `MelObject`, dans ce cas, `_init` et `_setup` seront appelé dans `main`.     

On met d'abord se qui est protéger, ensuite ce qui est privé, puis ce qui est public et enfin ce qui est constant.


## Tips
Il est possible de vérifier si une variable qui est censé contenir une fonction est `null` et ne pas l'appeller si c'est le cas : 
```
function test(callback = null) {
    let func = callback?.() ?? reset();
    return func();
}
```
Ca fonctionne aussi avec les tableaux : 
```
function test(array= null) {
  let first = array?.[0] ??? 0;
  return first
}
```
Il est possible de passer un objet en paramètre : 
```
function test({nom='yolo', value = 5, obj = new MelObject()}){
  return obj.set_cookie(name, value);  
}
``` 
On peut faire un assignement destructurer, ça marche pour les tableaux et led objets
```
function test(...args) {  
    //tableau
    const [event, coca:note, cola:color] = args;
        let all_result = {
        r:event.call(note, color),
        base_code:event.code
    }

    //Objet
    const {r:result, base_code} =all_result ;
    return result;
}
``` 
Pour mesurer le temps : 
`console.time(id)`
Pour arrondir une variable, au lieu d'utiliser `Math.round()` on peut utiliser l'opérateur `~~` qui est plus rapide.  
ex : `~~15.29 => 15`  
Pour vider un tableau, la façon la plus optimisé de le faire est de lui mettre une taille de 0 :   
`array.length = 0`
Idem si on veut fusionner 2 gros tableaux, il faut faire : `Array.push.apply(arr1, arr2)`   
Il existe l'opéreateur `,` :   
```
var a = 0; 
var b = ( a++, 99 ); 

//a = 1
// b = 99
``` 
Concernant les boucles, on peut créer une variable `len` pour éviter d'avoir à récup la taille à chaque fois.   
On évite les try/catch dans une boucle.    
`for (var i = 0, len = arrayNumbers.length; i < len; ++i) `    

Les opérations basiques sont plus rapide qu'un appelle de fonction !     
`var min = Math.min(a,b);` est moins bien que `a < b ? a : b;` 

Utilise ++i au lieu de i++ dans une boucle, c'est mieux  
Comparer avec les rvalues à gauche permet d'éviter la bug involontaires  

En jquery, il vaut mieux faire : 
```
.on('click', 'li', function(e)
``` 
que 
```
.find('li').on('click' (...)
```

Pour convertir un string en entier, on peut faire : 
```
var a = "15";
a = +a; 
console.log(a + 10); //25
```

# JsDoc
## Structure
A la racine du plugin, définir un fichier `jsdoc.definitions.js` et y mettre : 

```
/*
* @namespace NomDuPlugin
*/
```

Dans ce fichier, on va y définir le namespace de la documentation et les modules membres qui lui apartiennent.

Donc, à chaque fois que l'on ajoute un module javascript, on ajoute : `@property {module:monmodule} monmodule`, exemple : 

```
/*
* @namespace NomDuPlugin
* @property {module:Main} Main
*/
```

## Callback

```
/*
* @callback Where
* @param {!any} item
* @param {!number} index
* @return {boolean}
*/

/**
* Description
* @param {Array} array
* @param {Where} callback
* @yield {!any}
* @generator
function where(array, callback) {
    let i = -1;
    for (const item of array) {
        if (callback(item, ++i)) yield item;
    }
}
```

## Lien vers JSDoc
C'est [ici](https://jsdoc.app/)