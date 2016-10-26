#!/usr/bin/env node

var logger = require('../lib/logger.js')({depth: 3});
var program = require('commander');
var session = require('../lib/session.js');
var types = require('../lib/types.js');
var wotblitz = require('wotblitz');

if (require.main === module) {
	main(
		program
			.option('-s, --stats [account_id]', 'general statistics for each vehicle (endpoint)', Number)
			.option('-a, --achievements [account_id]', 'list of player\'s achievements on all vehicles (endpoint)', Number)
			.option('-t, --tank-ids <tank_ids>', 'return only the given tanks', types.fields, [])
			.option('-g, --in-garage <0|1>', 'filter by in garage or not', /^(0|1)$/i, null)
			.option('-f, --fields <fields>', 'display only the given fields', types.fields, [])
			.parse(process.argv)
	).then(logger.write).catch(logger.error);
}

function main(opts) {
	return session.load().then(sess => {
		if (opts.stats) {
			return wotblitz.tanks.stats(
				opts.stats === true ? sess.account_id : opts.stats,
				sess.token,
				opts.tankIds,
				opts.inGarage,
				opts.fields
			);
		}

		if (opts.achievements) {
			return wotblitz.tanks.achievements(
				opts.achievements === true ? sess.account_id : opts.achievements,
				sess.token,
				opts.tankIds,
				opts.inGarage,
				opts.fields
			);
		}
	});
}
