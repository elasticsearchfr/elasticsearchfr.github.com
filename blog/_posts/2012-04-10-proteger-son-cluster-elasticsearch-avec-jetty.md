---
layout: post
title: Proteger son cluster Elasticsearch avec Jetty
tags:
- avancé
- jetty
author: dpilato
source: http://dev.david.pilato.fr/?p=241
---
Nativement, Elasticsearch expose l'ensemble de ses services sans aucune authentification et donc une commande du type curl -XDELETE http://localhost:9200/myindex peut faire de nombreux dégâts non désirés.

De plus, si vous développez une application JQuery avec un accès direct depuis le poste client à votre cluster Elasticsearch, le risque qu'un utilisateur joue un peu avec votre cluster est grand !

Alors, pas de panique... La société Sonian Inc. a open sourcé son <a title="Plugin Jetty" href="https://github.com/sonian/elasticsearch-jetty" target="_blank">plugin Jetty pour Elasticsearch</a> pour notre plus grand bonheur ;-)
<h1>Principe</h1>
Le principe consiste à rajouter une surcouche Jetty à Elasticsearch, sous forme de plugin.

Il ne reste plus qu'à restreindre certaines URL et certaines méthodes (DELETE par exemple) à certains utilisateurs.
<h1>Guide d'installation</h1>
Pour installer le plugin, connectez vous à votre serveur hébergeant Elasticsearch et allez dans le répertoire d'installation :

{% highlight sh %}
$ cd /usr/local/elasticsearch/elasticsearch-0.19.2/
{% endhighlight %}

Installez le plugin (vérifiez la compatibilité entre la version du plugin et celle de votre noeud) :

{% highlight sh %}
$ sudo bin/plugin -install sonian/elasticsearch-jetty/0.19.2
- Installing sonian/elasticsearch-jetty/0.19.2...
Trying https://github.com/downloads/sonian/elasticsearch-jetty/elasticsearch-jetty-0.19.2.zip...
Downloading .......................................................................................................................................................................DONE
Installed jetty
{% endhighlight %}

<div>Récupérez le fichier de configuration de jetty proposé par Sonian en exemple :</div>
{% highlight sh %}
sudo curl https://raw.github.com/sonian/elasticsearch-jetty/master/config/jetty.xml -o config/jetty.xml
{% endhighlight %}

Idem pour le fichier avec les logins / password :

{% highlight sh %}
sudo curl https://raw.github.com/sonian/elasticsearch-jetty/master/config/realm.properties -o config/realm.properties
{% endhighlight %}

Il faut ensuite modifier la configuration Elasticsearch et ajouter la ligne suivante dans config/elasticsearch.yml :
{% highlight sh %}
# Jetty Plugin
http.type: com.sonian.elasticsearch.http.jetty.JettyHttpServerTransportModule
{% endhighlight %}

{% highlight sh %}
$ sudo vi config/elasticsearch.yml
{% endhighlight %}

Les petits gars de Sonian ayant très bien fait leur boulot, les protections nécessaires sont déjà en place avec le fichier config/jetty.xml très complet.

Modifiez les valeurs par défaut de login/password dans config/realm.properties :

{% highlight sh %}
superuser: YOURSUPERUSERPASSWORD,admin,readwrite
user: USERPASSWORD,readwrite
{% endhighlight %}

Redémarrez Elasticsearch. Si vous l'avez installé en tant que service :

{% highlight sh %}
sudo service elasticsearch restart
{% endhighlight %}

Et voilà ! Impossible de faire des commandes du type :

{% highlight sh %}
$ curl http://localhost:9200/_refresh
401 Unauthorized
{% endhighlight %}

Mais avec authentification, ça passe :

{% highlight sh %}
curl -u user:USERPASSWORD http://localhost:9200/_refresh
{"ok":true,"_shards":{"total":23,"successful":23,"failed":0}}
{% endhighlight %}
