---
layout: default
title: Anatomie d'un plugin PHP
---

[Retour](https://messagerie-melanie2.github.io/Bnum/Documentation/)

```
<?php
//Hérite de bnum_plugin.
//Doit être sous mel_metapage dans la liste des plugins
class MonPlugin extends bnum_plugin {
    //Indique sous quels tâches ce plugin va être intialisé et appelé
    public $task = '.*';

   //Initialise le plugin, c'est la première chose qui va être appelé
    public function init()
    {
        //Charge les configs de config.inc.php
        $this->load_config();
        //Charge les textes du plugins, le premier argument est le dossier qui contient les textes, le second indique si les textes doivent être envoyé au js ou non
        $this->add_texts('localization/', true);

        if ('monplugin' === $this->rc()->task) {
            //Enregistre la tâche
            $this->register_task('monplugin');
            //Enregistre l'action index et sera appelé via un appel à l'url _task=monplugin
            $this->register_action('index', [$this, 'index]);
        }

        //Sera appelé avant tout
        $this->add_hook('startup', [$this, 'startup']);
    }

    public function index() {
        $data = this->rc->config->get('data', []);
        //Envoie la donnée au javascript dans rcmail.env
        $this->rc->output->set_env('data', data);
        //Charge le module javascript plugin.js qui se trouve dans /js/lib/
        $this->load_script_module('plugin.js');
        //Charge le fichier style.css
        $this->include_stylesheet($this->local_skin_path().'/style.css');

       //Envoie la page html index lié au plugin "MonPlugin"
        $this->rc->output->send('MonPlugin.index');
    }

    //Exemple de startup
    public function startup($args) {
        $data = this->rc->config->get('data', []);

        if (count(data) === 0) {
            $data = OtherClass::feed();
            $this->rc->user->save_prefs('data', $data);
        }

        return $args;
    }
}
```