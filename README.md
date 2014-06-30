bouquins
========

Web frontend for calibre e-book manager. BSD License.

Features
========

Bouquins is a node.js application using the express framework. The web UI uses bootstrap and jQuery.

It allows to browse, search and download e-bboks from a calibre library using a web browser (desktop/mobile).

It needs a local access to all files in the calibre library (including the sqlite database file: metadata.db). Synchronisation of those files on the server is not part of the application (personnaly I use owncloud).

bouquins is available in french and english.

Usage
=====

development
-----------

* Install node.js and npm with your usual system tools.
* Extract bouquins in a web accessible directory.
* Install depenencies by running:
```
npm install
```
in bouquins directory.
* Create a symlink `public/calibre` pointing to calibre library
* Check path to calibre files and database in `config/development.json`.
* Start application:
```
npm start
```
* Open http://localhost:3000

production
----------

As a node.js application, bouquins is best run behind a web server such as nginx. nginx act as a proxy for node.js and serves static files (/public and /calibre).

In production, config file is not `config/development.json` but depends on the `NODE_ENV` environment variable, for example, if `NODE_ENV=production`, file is `config/production.json`. The `public/calibre` symlink is not needed, but the webserver must server `/calibre`.

You will also need to run node as a dameon, I use daemontools on a FreeBD host. There are other solutions, such as https://github.com/indexzero/forever

API
===

**TODO**

Rest/JSON API:

Lists

* `/book`
* `/serie`
* `/author`

Parameters: perpage, page, initial

Single item

* `/book/{id}`
* `/serie/{id}`
* `/author/{id}`

Search

* POST `/book`

Parmeters: q (search term), perpage, page, initial

TODO
====

* OPDS
* sqlite COLLATE
* handle ebook formats (currently epub only)
* book details
* calibre custom fields
