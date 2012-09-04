---
layout: post
title: 'Mon premier plugin ElasticSearch : RSS River'
tags:
- elasticsearch
- plugin
- river
author: dpilato
source: http://dev.david.pilato.fr/?p=171
---
Il existe dans <a title="ElasticSearch" href="http://www.elasticsearch.org/">Elasticsearch</a> la notion de <a title="River Documentation" href="http://www.elasticsearch.org/guide/reference/river/">river</a> (rivière) qui comme son nom le laisse supposer permet de voir s'écouler des données depuis une source jusqu'à Elasticsearch.

Au fur et à mesure que les données arrivent, la rivière les transporte et les envoie à l'indexation dans Elasticsearch.

En standard, il existe 4 rivières :
<ul>
	<li>CouchDB qui permet d'indexer toutes les nouveautés d'une base CouchDB. Voir aussi <a title="CouchDB" href="http://dev.david.pilato.fr/?p=138">cet article à ce propos</a>.</li>
	<li>RabbitMQ qui permet de récupérer des documents dans une queue de traitement asynchrone (genre JMS)</li>
	<li>Twitter qui permet d'indexer votre flux de messages twitter par exemple</li>
	<li>Wikipedia qui permet d'indexer toutes les nouveautés de l'encyclopédie au fur et à mesure de leurs publications</li>
</ul>
<h1>Premiers pas</h1>
J'ai commencé par bidouiller un peu la rivière CouchDB pour y apporter quelques fonctionnalités dont mes collègues avaient besoin :
<ul>
	<li>désactivation du champ _attachement. Voir <a title="Pull Request 1283" href="https://github.com/elasticsearch/elasticsearch/pull/1283">Pull Request 1283</a>.</li>
	<li>récupération du contenu d'une vue plutôt que le document original lui même. Voir <a title="Pull Request 1258" href="https://github.com/elasticsearch/elasticsearch/pull/1258">Pull Request 1258</a>.</li>
</ul>
Finalement, le principe se révèle assez simple. Il faut une classe qui implémente <a title="River.java" href="https://github.com/elasticsearch/elasticsearch/blob/master/modules/elasticsearch/src/main/java/org/elasticsearch/river/River.java">River</a> et qui hérite de <a title="AbstractRiverComponent.java" href="https://github.com/elasticsearch/elasticsearch/blob/master/modules/elasticsearch/src/main/java/org/elasticsearch/river/AbstractRiverComponent.java">AbstractRiverComponent</a>.

Là, il ne reste plus qu'à implémenter :
<ul>
	<li>Le constructeur</li>
	<li>La méthode start qui se lance quand la rivière démarre</li>
	<li>La méthode close qui se lance lorsque la rivière stoppe</li>
</ul>
<h1>Et mon flux RSS alors ?</h1>
Oui... J'y viens...

Au fait, tout le monde sait ce qu'est un flux RSS ? La spécification officielle est <a title="RSS Spec" href="http://www.rssboard.org/rss-specification">ici</a>.

Je reprends donc le plugin <a title="CouchDB River Plugin" href="https://github.com/elasticsearch/elasticsearch/tree/master/plugins/river/couchdb">CouchDB River</a>, je le mavenise (ouais, je ne suis pas encore super fan de Gradle), et je l'adapte à mes besoins.

Pour faire simple, je vais suivre la mécanique suivante :
<ul>
	<li>Toutes les x minutes, je télécharge le flux RSS demandé que je transforme en POJO en me basant sur le travail fait par <a title="Lars Vogel" href="http://www.vogella.de/articles/RSSFeed/article.html">Lars Vogel</a></li>
	<li>Je compare la date du flux (balise pubDate) avec la dernière date de flux (que j'avais stockée dans ElasticSearch)</li>
	<li>Si le flux est plus récent, je parcours tous les éléments du flux (item)</li>
<ul>
	<li>Je fabrique un identifiant de l'item basé sur un encodage du champ description. Pour cela, je me sers de ce qui est <a title="UUID.java" href="https://github.com/elasticsearch/elasticsearch/blob/master/modules/elasticsearch/src/main/java/org/elasticsearch/common/UUID.java">déjà présent dans ES</a>.</li>
	<li>Si cet identifiant a déjà été envoyé à ES, alors on ignore cet item.</li>
	<li>Sinon, on le pousse vers ElasticSearch dans un document de type "page"</li>
</ul>
</ul>
Les champs récupérés pour le moment dans le flux RSS sont :
<ul>
	<li>title</li>
	<li>description</li>
	<li>author</li>
	<li>link</li>
</ul>
<h1>Ca marche ?</h1>
Mes profs en école d'ingé me disaient : "non ! ça fonctionne..."

Bon, une fois le plugin publié sous github, il est simple de l'utiliser.

Tout d'abord, on l'installe :

{% highlight sh %}
$ bin\plugin -install dadoonet/rssriver/0.0.1
{% endhighlight %}

Puis, on démarre ES et on créé notre index pour stocker le flux RSS :

{% highlight sh %}
$ curl -XPUT 'http://localhost:9200/lemonde/' -d '{}'
{% endhighlight %}

Puis on ajoute la rivière :

{% highlight sh %}
$ curl -XPUT 'http://localhost:9200/_river/lemonde/_meta' -d '{
  "type": "rss",
  "rss": {
    "url": "http://www.lemonde.fr/rss/une.xml"
  }
}'
{% endhighlight %}

<strong>Et voilà...</strong>

A partir de ce moment, on peut faire des recherches dans le flux... Par exemple :

{% highlight sh %}
$ curl –XGET 'http://localhost:9200/lemonde/_search?q=taxe'
{% endhighlight %}

On peut jouer sur les paramètres de la rivière en modifiant les paramètres url pour l'adresse du flux et update_rate pour la fréquence de mise à jour du flux (en millisecondes).

Egalement, il peut être souhaitable (conseillé) de modifier le mapping par défaut du type "page" :

{% highlight sh %}
$ curl -XPUT 'http://localhost:9200/lefigaro/' -d '{}'
$ curl -XPUT 'http://localhost:9200/lefigaro/page/_mapping' -d '{
  "page" : {
    "properties" : {
      "title" : {"type" : "string", "analyzer" : "french"},
      "description" : {"type" : "string", "analyzer" : "french"},
      "author" : {"type" : "string"},
      "link" : {"type" : "string"}
    }
  }
}'
$ curl -XPUT 'localhost:9200/_river/lefigaro/_meta' -d '{
  "type": "rss",
  "rss": {
    "url": "http://rss.lefigaro.fr/lefigaro/laune",
    "update_rate": 900000
  }
}'
{% endhighlight %}

<h1>Et maintenant ?</h1>
<a title="Gilbert Bécaud" href="http://www.youtube.com/watch?v=OI9ZwtA6QOw&amp;feature=related">Que vais-je faire de tout ce temps ? Que sera ma vie ?</a>

J'envisage de faire une nouvelle évolution du plugin CouchDB car pour le moment, il ne traite pas la récupération des pièces jointes (format binaire).

Et bien évidemment, poursuivre sur le plugin RSS River qui doit traiter d'autres balises et être testé avec d'autres flux...

D'ailleurs, si vous l'utilisez et que vous rencontrez des problèmes, n'hésitez pas à contribuer en créant <a title="Issues" href="https://github.com/dadoonet/rssriver/issues">des bugs</a> ou en forkant et améliorant le projet.

Les sources sont ici : <a href="https://github.com/dadoonet/rssriver">https://github.com/dadoonet/rssriver</a>