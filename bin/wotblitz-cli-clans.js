#!/usr/bin/env node

var logger = require('../lib/logger.js').setOptions({depth: 3});
var program = require('commander');
var session = require('../lib/session.js');
var types = require('../lib/types.js');
var wotblitz = require('wotblitz')();

if (require.main === module) {
	main(
		program
			.option('-s, --search <name|tag>', 'Part of name or tag for clan search (endpoint)')
			.option('-i, --info [clan_ids]', 'Detailed clan information (endpoint)', types.numbers)
			.option('-a, --accountinfo [account_ids]', 'Player clan data (endpoint)', types.numbers)
			.option('-g, --glossary', 'Information on clan entities (endpoint)')
			.option('-f, --fields <fields>', 'selection of fields', types.fields, [])
			.option('-l, --limit <number>', 'limit the clan search results', Number, null)
			.option('-p, --page <number>', 'page through clan search results', Number, 1)
			.option('-e, --extra', 'include more information in "info" and "accountinfo"')
			.parse(process.argv)
	).then(logger.write).catch(logger.error);
}

function main(opts) {
	return session.load().then(sess => {
		if (opts.search) return list(opts.search, opts.limit, opts.page, opts.fields, sess);

		if (opts.info) return info(opts.info, opts.extra ? 'members' : null, opts.fields, sess);

		if (opts.accountinfo) return accountinfo(opts.accountinfo, opts.extra ? 'clan' : null, opts.fields, sess);

		if (opts.glossary) return wotblitz.clans.glossary(opts.fields);
	});
}

function list(search, limit, pageNumber, fields, sess) {
	var p = wotblitz.clans.list(search, pageNumber, limit, fields);

	return !sess ? p : p.then(data => {
		if (data.length === 1) {
			sess.clan_id = data[0].clan_id;

			return sess.save().then(() => {
				return {
					data: data,
					session: sess
				};
			});
		}

		return data;
	});
}

function info(clanIds, extra, fields, sess) {
	if (!Array.isArray(clanIds)) clanIds = null;

	return wotblitz.clans.info(clanIds || sess.clan_id, extra, fields);
}

function accountinfo(accountIds, extra, fields, sess) {
	if (!Array.isArray(accountIds)) accountIds = null;

	var p = wotblitz.clans.accountinfo(accountIds || sess.account_id, extra, fields);

	return !sess ? p : p.then(data => {
		var account_id;

		if (!accountIds) {
			account_id = sess.account_id;
		} else if (accountIds.length === 1) {
			account_id = accountIds[0];
		} else {
			return data;
		}

		sess.clan_id = data[account_id].clan_id;

		return sess.save().then(() => {
			return {
				data: data,
				session: sess
			};
		});
	});
}
