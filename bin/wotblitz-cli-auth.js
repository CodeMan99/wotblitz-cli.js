#!/usr/bin/env node

var childProcess = require('child_process');
var http = require('http');
var logger = require('../lib/logger.js')();
var opener = require('opener2');
var program = require('commander');
var session = require('../lib/session.js');
var url = require('url');
var util = require('util');
var wotblitz = require('wotblitz')();

if (require.main === module) {
	main(
		program
			.option('-l, --login', 'login with your wargaming account (endpoint)')
			.option('-p, --prolongate', 'login will expire, extend it (endpoint)')
			.option('-q, --logout', 'revoke your current login (endpoint)')
			.option('-w, --when', 'get the date when the session expires')
			.option('-P, --port <NUM>', 'set port number for login listening [default: 8000]', Number, 8000)
			.parse(process.argv)
	).then(logger.write).catch(logger.error);
}

function main(opts) {
	return session.load().then(sess => {
		if (opts.login) return login(opts.port, sess);

		if (opts.prolongate) return prolongate(sess);

		if (opts.logout) return logout(sess);

		if (opts.when) return Promise.resolve(sess.expiresAt());
	});
}

function login(port, sess) {
	if (sess.isLoggedIn()) return Promise.reject(new Error('already logged in, use prolongate'));

	return new Promise((resolve, reject) => {
		var getAuthQuery = http.createServer((req, res) => {
			var authQuery = url.parse(req.url, true).query;
			var html;
			var template = '<!DOCTYPE html><html lang="en-US"><head><title>Login %s</title></head>' +
				'<body><h1>Login %s</h1><p>%s</p></html>';

			delete authQuery[''];
			switch (authQuery.status) {
			case 'ok':
				sess.account_id = authQuery.account_id;
				sess.auth = authQuery;
				sess.save().then(resolve, reject);

				html = util.format(template, 'Successful', 'Successful', 'You may close this tab safely.');
				break;
			case 'error':
				reject(new Error(authQuery.message));
				html = util.format(template, 'Failed', 'Failed: ' + authQuery.code, authQuery.message);
				break;
			default:
				// maybe a favicon.ico request, toss it regardless
				return;
			}

			res.writeHead(200, 'OK', {
				'Content-Type': 'text/html',
				'Content-Length': Buffer.byteLength(html)
			});
			res.write(html);
			res.end();

			req.connection.end();
			req.connection.destroy();
			getAuthQuery.close();
		});

		getAuthQuery.listen(port);

		wotblitz.auth.login('http:\/\/localhost:' + port, '1').then(data => {
			var browser = opener(data.location);

			childProcess.spawn(browser.command, browser.args, {
				detached: true,
				stdio: 'ignore'
			}).unref();
		}, reason => {
			getAuthQuery.close();
			reject(reason);
		});
	});
}

function prolongate(sess) {
	if (!sess.isLoggedIn()) return Promise.reject(new Error('must login first'));

	return wotblitz.auth.prolongate(sess.auth.access_token).then(data => {
		sess.auth.access_token = data.access_token;
		sess.auth.expires_at = data.expires_at.toString();

		return sess.save();
	});
}

function logout(sess) {
	if (!sess.isLoggedIn()) return Promise.resolve(sess);

	return wotblitz.auth.logout(sess.auth.access_token).then(() => {
		sess.auth = null;

		return sess.save();
	});
}
