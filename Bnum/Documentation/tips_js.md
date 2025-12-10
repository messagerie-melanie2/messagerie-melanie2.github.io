---
layout: default
title: Tips Javascripts
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/module_js#bonne-pratiquesls)

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
