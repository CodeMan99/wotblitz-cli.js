#!/usr/bin/env node

var logger = require('../lib/logger.js');
var wotblitz = require('wotblitz')();

// hook up commander for the help chain
require('commander').parse(process.argv);

wotblitz.servers.info('wotb')
	.then(data => data.wotb)
	.then(logger.write, logger.error);
