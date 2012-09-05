---
layout: default
title: Participez
---

Articles
========

Contribuer
----------

Si vous souhaitez contribuer sur ce site, rien de plus simple :

* Forkez le code sur [github](https://github.com/elasticsearchfr/elasticsearchfr.github.com)
* Ajoutez vos articles dans le répertoire blog/_posts
* Demandez un pull request
* Après relecture, votre contenu sera publié


Instructions détaillées
-----------------------

### Règles à suivre

* Les posts sont à écrire dans le répertoire blog/_posts
* Chaque POST doit être nommé de la façon suivante : AAAA-MM-DD-nom-du-post.md (vous pouvez aussi écrire en HTML ou en textile).
* Chaque POST doit être enregistré et édité en UTF-8 (**Attention aux utilisateurs sous windows**)
* Dans l'entête du POST, on doit trouver la structure suivante :

<pre>
---
layout: post
title: Votre titre ici
tags:
- tag1
- tag2
author: username
image: http://lienversimage/ ou /blog/img/imagelocale.png
source: http://lienverssource/
---
</pre>

* Modifiez :
  * **title** pour indiquer le titre de votre article
  * **author** pour indiquer votre pseudo sur ce site
  * **tags** pour ajouter des mots clés (évitez le tag elasticsearch !)
  * **image** (*optionnel*) si vous voulez ajouter une image en début d'article
  * **source** (*optionnel*) si votre article provient d'un autre site

### S'ajouter en tant qu'auteur

Si il s'agit de votre première contribution, vous devez également modifier le fichier `_config.yml` et ajouter sous authors une
structure de ce type :

<pre>
  username:
    fullname: Prénom Nom
    twitter: twitteraccount
    github: githubaccount
    gravatar: gravatarhash
    email: youremail
</pre>

**Attention** : Il faut bien mettre des espaces avant username et ne surtout pas utiliser de tabulation.

Modifiez :
* **username** pour indiquer votre pseudo sur ce site
* **fullname** pour indiquer vos prénom et nom
* **twitter** (*optionnel*) pour indiquer votre compte twitter (sans le @)
* **github** (*optionnel*) pour indiquer votre compte github
* **gravatar** (*optionnel*) pour indiquer l'image gravatar à utiliser
* **email** (*optionnel*) pour indiquer votre adresse email

Conférences / Evènements
========================

Si vous avez un évènement à faire connaitre sur [l'agenda](/agenda.html), invitez simplement le compte google [elasticsearchfr@gmail.com](elasticsearchfr@gmail.com)
à votre propre évènement de votre agenda Google. Nous l'intègrerons dans l'agenda public.