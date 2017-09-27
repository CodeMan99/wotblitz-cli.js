#!/usr/bin/env node

var logger = require('../lib/logger.js').setOptions({depth: 4});
var program = require('commander');
var session = require('../lib/session.js');
var types = require('../lib/types.js');
var wotblitz = require('wotblitz')();

if (require.main === module) {
	main(
		program
			.option('-s, --search <name>', 'search for a player (endpoint)')
			.option('-i, --info [account_id]', 'player details (endpoint)', types.numbers)
			.option('-a, --achievements [account_id]', 'achievement details (endpoint)', types.numbers)
			.option('-e, --extra', 'extra field(s) for player details')
			.option('-f, --fields <fields>', 'the fields to select of the endpoint', types.fields, [])
			.option('--no-save', 'turn off saving account_id when search returns one item')
			.parse(process.argv)
	).then(logger.write).catch(logger.error);
}

function main(opts) {
	return session.load().then(sess => {
		if (opts.search) return list(opts.search, opts.save ? sess : null);

		if (opts.info) {
			return info(opts.info, opts.extra ? 'private.grouped_contacts' : null, opts.fields, sess);
		}

		if (opts.achievements) {
			return wotblitz.account.achievements(opts.achievements === true ? sess.account_id : opts.achievements);
		}
	});
}

function list(search, sess) {
	var p = wotblitz.account.list(search);

	return !sess ? p : p.then(data => {
		if (data.length !== 1) return data;

		sess.account_id = data[0].account_id;

		return sess.save().then(() => {
			return {
				data: data,
				session: sess
			};
		});
	});
}

function info(accountIds, extra, fields, sess) {
	return wotblitz.account.info(accountIds === true ? sess.account_id : accountIds, sess.token, extra, fields);
}
