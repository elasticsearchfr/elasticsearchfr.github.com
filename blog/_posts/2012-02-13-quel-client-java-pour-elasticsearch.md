---
layout: post
title: Quel client Java pour ElasticSearch ?
tags:
- elasticsearch
- java
author: dpilato
source: http://dev.david.pilato.fr/?p=185
---
Il existe deux modes d'accès à Elasticsearch :
<ul>
	<li>Inscrire un noeud client dans le cluster ElasticSearch</li>
	<li>Utiliser un client "simple"</li>
</ul>
<h2>Noeud client dans un cluster Elasticsearch</h2>
L'idée de cette méthode est de fabriquer un noeud Elasticsearch (node) qui démarre avec les mêmes caractéristiques qu'un noeud d'indexation et de recherche sauf qu'on lui précise qu'il n'hébergera pas de données.

Pour cela, on utilise la propriété suivante :

{% highlight txt %}
node.data=false
{% endhighlight %}

Elle indique que le noeud que nous démarrons n'hébergera pas de données. En gros, c'est un noeud qui sert juste à fabriquer des clients...

L'avantage est qu'il n'est pas nécessaire de configurer quoi que ce soit car la particularité des noeuds Elasticsearch est de s'auto-découvrir les uns les autres grâce aux fonctions de multicast.

Démarrer un noeud autonome est également intéressant pour réaliser des tests unitaires. En effet, dans ce cas, vous avez une instance autonome complète d'Elasticsearch.

Démarrer un noeud et obtenir un client, ce n'est pas bien difficile :

{% highlight java %}
// Build a node
Node node = NodeBuilder.nodeBuilder().node();

// Get a client from the node
Client client = node.client();
{% endhighlight %}

Avec la première ligne, vous devriez voir apparaître dans les logs de vos noeuds Elasticsearch, le fait qu'un nouveau noeud a rejoint le cluster.
<h2>Client "simple" ou TransportClient</h2>
Un Transport Client est un client Elasticsearch autonome plus léger qui n'appartient pas réellement au cluster de noeuds Elasticsearch. Ainsi, lorsqu'un client démarre, aucune trace n’apparaît dans les logs des noeuds du cluster puisque ce client ne fait pas proprement parti du cluster.

Pour qu'un tel client sache comment trouver des noeuds Elasticsearch du cluster que vous souhaitez rejoindre, il faut lui indiquer au moins une adresse. Vous pouvez préciser plusieurs adresses pour mieux gérer les pannes et la répartition de charge.

Pour démarrer un tel client, on écrit donc :

{% highlight java %}
TransportClient client = new TransportClient()
	.addTransportAddress(new InetSocketTransportAddress("localhost", 9300))
	.addTransportAddress(new InetSocketTransportAddress("localhost", 9301));
{% endhighlight %}

<h2>Quel client choisir ?</h2>
Passer par un noeud pour obtenir un client peut perturber votre cluster, même si en théorie, ça devrait être neutre. Car le noeud fait partie du cluster. Donc, quand il meurt, les autres noeuds doivent être prévenus pour prendre des décisions. En l’occurrence, aucune décision à prendre car le noeud n'héberge pas de données. Mais cela nécessite un traitement même minime de la part des noeuds.

De la même façon quand un noeud arrive dans le cluster, il se déclare, occupe deux ports de communication (9200-9299 et 9300-9399) car en tant que noeud il peut être amené à recevoir des requêtes.

De plus, un noeud ElasticSearch démarre plus de Threads et notamment un qui pose problème en ce moment en raison d'un souci avec la librairie Guava. En mode debug sous Eclipse par exemple, cela va vous empêcher de redémarrer proprement votre webapp sans avoir à redémarrer le serveur d'application.

En production, c'est pareil. Si vous embarquez dans votre webapp un noeud client Elasticsearch, vous devrez obligatoirement redémarrer le serveur d'application sous peine d'erreur de mémoire (OOM).

Donc, mon expérience m'indique qu'il vaut mieux passer par des clients plus légers et neutres pour le cluster. J'ai donc choisi dans mes projets la deuxième option lorsque j'ai besoin d'un client dans une webapp.

Lorsque je veux faire des tests unitaires (ou d'intégration) de mon application, j'utilise plutôt la première méthode.
<h2>Et il y a un moyen de choisir quand je veux ce que je veux ?</h2>
Dans un prochain article, je vous décrirai la factory Spring que j'ai développée et publiée sur <a title="Projet Spring Elasticsearch sur Github" href="https://github.com/dadoonet/spring-elasticsearch">github</a>.

La version n'est pas encore finalisée, notamment en raison d'un <a title="Bug 1691" href="https://github.com/elasticsearch/elasticsearch/issues/1691">petit bug</a> avec la version 0.19.0.RC2 d'Elasticsearch, mais la version SNAPSHOT est en cours de tests dans un de mes projets.
