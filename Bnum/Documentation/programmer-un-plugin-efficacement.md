---
layout: default
title: Tips
---

# Messages

Dans le bnum, pour afficher des messages sur le côté, il faut utiliser la classe statique `BnumMessage`
## Afficher un message
```
BnumMessage.DisplayMessage(message: string, type: eMessageType): string

//Exemple : 
//Message d'erreur : 
BnumMessage.DisplayMessage('C\'a ne marche pas lol', eMessageType.Error);
//Message d'info
const messageId = BnumMessage.DisplayMessage('Une info');
```

## Mettre le Bnum en état "Occupé"
```
BnumMessage.SetBusyLoading(): void
BnumMessage.StopBusyLoading(): void

//Exemple : 
BnumMessage.SetBusyLoading()
await WaitingServer();
BnumMessage.StopBusyLoading()
```

# Cookies
Vous pouvez créer et manipuler un cookie en utilisant la classe `Cookie`. Miam !

## Créer et modifier un cookie
```
Cookie.set_cookie(key: string, value: !any, expire: Date|boolean): Cookie
myCookie.update_value(new_value: !any, expire: Date|boolean): Cookie

//Exemple : 
let cookie = Cookie.set_cookie('bnum.news.last_update', moment().format(), false);
const interval = setInterval(
async () => {
	await UpdateServer();
	cookie.update_value(moment().format(), false);
}
, 60*60*1000)
```

## Supprimer un cookie
```
Cookie.remove_cookie(key: !string): Cookie
```

# Linq
Pour pouvoir faire des équivalence au [System.Linq](https://learn.microsoft.com/fr-fr/dotnet/api/system.linq?view=net-8.0) du C#, vous pouvez utilisez la classe `MelEnumerable`

## Utilisation
L'avantage c'est de pouvoir faire plusieurs opérations sans coût et d'avoir qu'un seul "gros" coût à la fin.
Ca fonctionne sur : 
-  Les itérables
-  Les objets
-  Les générateurs
-  Les objets de base (qui seront mis dans un tableau)

### Comment on démarre ?
```
MelEnumerable.from(item: Iterable): MelEnumerable

//Exemple : 
let array = [null, {a:0, b:2}, 5, 8, 'Test'];
array = MelEnumerable.from(array);
```

### Que peut-on faire ?
```
let array = [null, {a:0, b:2}, 5, 8, 'Test'];
array = MelEnumerable.from(array);
[...]
for (const tmp of array.where(x => x !== null && !x.a))
{
	console.log(tmp);
}
```
Dans l'exemple ci-dessus, on ne prend que les objets qui ne sont pas `null`, et qui ne sont pas des objets.

La classe reprend la plupart des fonctions de [System.Linq](https://learn.microsoft.com/fr-fr/dotnet/api/system.linq?view=net-8.0), n'hésitez pas à aller voir, mais voici quand même des fonctions utiles : 

## Fonctions utiles

### Random
Génère des nombres aléatoires
```
MelEnumerable.random(min: number, max: number): MelEnumerable
```

### First & Last
```
MelEnumerable.firstOrDefault(defaultValue: ?any, callback, ?function) : any
MelEnumerable.lastOrDefault(defaultValue: ?any, callback, ?function) : any
```
Récupère le dernier ou permier élément de l'enum.

### OrderBy
```
MelEnumerable.orderBy(selector: function): MelEnumerable
```
Tri en fonction d'un élément de l'énumerable, ex :
```
let arr =  [
{a:0, name:"Bjr"},
{a:1, name:"Salut"},
{a:2, name:"Bjr"},
]

arr = MelEnumerable.from(arr).orderBy(x => "${x.name}_${x.a}").toArray();
```

# JsHtml
JsHtml permet d'écrire du html n javascript avec une indentation et une forme qui ressemble au html.

Pour l'utiliser avec prettier, utiliser :
```
//prettier-ignore
```

Comment ça fonctionne : 
On commence par  `JsHtml.start`, puis ensuite, chaque balise html comme une fonction, exemple :
```
JsHtml.start
.div({ class: 'maindiv' })
	.a({ href: '/page.html' })
		.text('Changer de page')
	.end()
.end()
```

## .end()
Ferme la balise. Il est possible de mettre un string pour savoir où on en est.
```
//On ouvre
.div()
//on ferme
.end('fermeture de la div')
```
Ce qui va donner en html : 
```
<div>
</div>
<!-- fermeture de la div -->
```

Il n'y aura pas de commentaire si vous ne mettez pas de chaîne.
## .text()
Affiche du texte brut, c'est l'équivalent de 
```
<div>
	<a>Changer de page</a>
</div>
```

## .comment()
Affiche un commentaire en html
```
JsHtml.start.comment('BONJOUR');

//Equivaut à : 

<!-- BONJOUR -->
```

## .each()
Permet de faire un boucle à l'intérieur de JsHtml.
N'a pas vraiment d'équivalence en html, c'est plus si on affichait du html gràce à des commandes coté serveur comme du php ou du asp.net core.

Ex :
```
JsHtml.start
.select()
	.each((self, item) => {
		return self.option({value:item.value}).text(item.text).end();
	}, ...options)
.end()
```

## .generate()
Génère au format Jquery

## .generate_html()
Génère en html brut.
/!\\ Les fonctions mis dans des attributs "on", ne seront pas prise en compte.

## Les fonctions
Lorsque vous définissez des attributs "on", comme "onclick" ou "onchange", vous pouvez définir des fonctions javascript au lieu de mettre des fonctions globales, exemple : 

```
class DialogContent {
	constructor(buttonName) {
		this.bn = buttonName;
	}

	get() {
		return JsHtml.start
		.div()
			.button({onclick:this.hide.bind(this)})
				.text("X")
			.end()
		.end().generate();
	}

	hide() {
		Dialog.Global.Selected.Hide();
	}
}

```

## MelHtml
Utiliser `MelHtml` au lieu de `JsHtml` permet d'avoir pleins de fonctions supplémentaire.

### .icon()
Affiche une icone material symbol.

```
	.icon(icon: string, attribs: {}).end(): MelHtml
```
# Dialog
Pour créer une dialogue, vous pouvez utiliser `MelDialog`.
La dialogue fonctionne avec un système de page.
Chaque page contient du contenu (JsHtml ou Jquery) et des boutons d'actions.

## Création d'une page
```
let page = new DialogPage('index', {content:jshtml, title:'Ma dialog', buttons:[MyButton]});
```

Pour créer une page de choix entre plusieurs boutons, vous pouvez utiliser : 
```
//DialogPage.DrawChoice(title: string, button1: RcmailDialogChoiceButton, button2: RcmailDialogChoiceButton, [name: string]='choice')

let choice = DialogPage.DrawChoice('Fenetre de choix', button1, button2);
```

## Création d'une dialog
```
//MelDialog(page: DialogPage, options: Object<string, *>)
let myDialog = new MelDialog(page);
//ou
//MelDialog.Create(name: string, content:JsHtml|Jquery, {title: string, options: Object<string, *>, buttons: RcmailDialogButton[]})
let myDialog = MelDialog.Create('index', jshtml, {});
```


# Random
```
Random.intRange(min: number, max: number): number
Random.range(min: number, max: number): number
Random.rgb_color(): string
```

# Récupérer l'utilisateur courant
Utilisez `MelCurrentUser`.
```
MelCurrentUser.name:string
MelCurrentUser.last_name:string
MelCurrentUser.fullname:string
MelCurrentUser.email:string[]
MelCurrentUser.main_email: ?string
```

# RegExp
Les regexp se trouvent dans le fichier `regexp.js`.

# BnumEvent
Ces évènements reprend le système d'évènement du C#.
En gros, vous attachez plusieurs fonction à un évènements, puis vous les appelez toutes.
```
let click = new BnumEvent();

click.push(() => Action1());
click.add('toremove', () => {
	Action2();
	click.remove('toremove');
});

click.call();
```

Vous pouvez, ou non mettre des arguments dans `call` qui seront utiliser dans les fonctions.

# Mel_Promise
Ce sont des promesses, donc des objets asynchrones. En revanche, elle offre des fonctionnalités supplémentaires, comme connaître l'état de la promesse, ou avoir des sous promesses que l'on peut tuer en tuant la promesse parente.

Ca s'utilise presque comme `Promise`.

```
await new Mel_Promise(() => {});
```

Quelques spécificités : 
- Si la fonction passé est synchrone, la promesse éxécutera la fonction et retournera sa valeur.
-  Si elle est asynchrone, elle attendra que la fonction soit fini, puis retournera la valeur.
Comme `Promise` qui possède une fonction `valide` et `notValide` en argument
Rappel : 
```
new Promise((ok, nok) => {
	if (something) ok(true); //Tout c'est bien déroulé
	else nok(false); //La promesse à planté
})
```

Avec `Mel_Promise`, on utilise :
```
new Mel_Promise((promesse) => {
	promesse.start_resolving();
	
	if (something) promesse.resolve(true); //Tout c'est bien déroulé
	else promesse.reject(false); //La promesse à planté
});
```

## Autres classes
### Mel_Ajax
Il s'agit d'un appel ajax mais qui utilise une promesse.
Principalement utiliser comme sous-promesse pour pouvoir tuer la promesse facilement.

Exemple : Pour un système d'auto-completion, au lieu d'attendre que la completion est fini, on tue la promesse et on en lance une autre.

### WaitSomething
Attend qu'une fonction retourne `true`.

```
await Mel_Promise.wait(() => !!scriptLoaded);
```

Il y a un timeout paramétrable pour éviter les boucles infinies.

# Les connecteurs
Le Bnum possède un système de connecteurs qui permet de récupérer des données facilements depuis le serveur.
Ca permet d'avoir une liste de connecteurs dans un fichier, ça evite de devoir chercher les différents appels ajax.

Créer un fichier `connectors.js` avec dedans : 
```
export const connectors = {};
```

## Créer un connecteur
```
Connector.Create(task: string, action: string, {
	type: Connector.enums.type,
	params: ?Object<string, any>,
	moulinette: ?function,
	needed: Object<string, null>
})
```
`task` correspond à la tâche que l'on souhaite.
`action` à l'action
`type` il s'agit du type de l'appel, post, get etc....
`params` paramètres par défaut et constants
`moulinette` Une fonction qui est appelé dans le connecteur, pour mettre en forme les données ou appeler un autre connecteur.
`needed` Les paramètres que le connecteur à besoin

Exemple: 
```
import { Connector } from './connector.js';

import { settings_da_set_email_recup, m_mail_get_favorites_colors, m_mail_get_favorites_icons } from './functions.js';

export const connectors = {
	settings_da_set_email_recup: Connector.Create('settings',  'plugin.mel.doubleauth.set', {
		type: Connector.enums.type.post,
		params:{_prop:'double_authentification_adresse_recuperation'},
		needed:{_val:'email', _send_mail:true},
		moulinette: settings_da_set_email_recup
	}
}
```

## Utiliser un connecteur
```
BnumConnector.connect(connector: Connector, {
	params: ?Object<string, any>,
	default_return: ?any
}): Promise<{data: ?any, has_error: boolean, error: ?any}>

//Ex:
await BnumConnector.connect(connectors.settings_da_set_email_recup, {
	params: {_val:'a@a.fr', _send_mail:true}
})
```

# Getter/Setter
En javascript, les getter et setter vous permettent de contrôler, d'accéder et modifier la valeur d'une variable privée.

Comment ça marche ?
Il faut utiliser `Object.defineProperty` ou `Object.defineProperties` si on en veut plusieurs.
```
class MC {
	constructor(uid) {
		this.uid = null;
		Object.defineProperty(thi, 'uid', {
			get() {
				return uid;
			}
		})
	}
}
```
Dans l'exemple ci-dessus, cela permet d'accéder à l'uid sans pouvoir le modifier.
La déclaration de `this.uid` permet à vscode de pouvoir afficher la variable membre avec IntelliSense. 

## Le setter
Il permet de modifier une valeur. 
```
class MC {
	constructor(uid) {
		this.uid = null;
		Object.defineProperty(thi, 'uid', {
			get() {
				return uid;
			},
			set(val) {
				if (typeof val === 'string') val = +val;
				uid = val;
			}
		})
	}
}
```
Dans l'exemple ci-dessus, il permet grossièrement de change un string en number, car on veut que notre uid soit un nombre.

### Ce qu'il ne faut pas faire
```
class MC {
	constructor(uid) {
		this.uid = null;
		Object.defineProperty(thi, 'uid', {
			get() {
				return uid;
			},
			set(val) {
				this.uid = val;
			}
		})
	}
}
```

Dans cet exemple, soit, ça va ne rien faire, soit, ça va écraser le setter par la valeur. Dans notre cas, ça sert à rien. Si il y avait un traitement avant, il ne se ferait qu'une seul fois.
A RETENIR : Le setter et le getter doivent retourner et changer SEULEMENT les variables QUI NE SONT PAS l'accesseur et le getter.
