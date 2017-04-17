#!/usr/bin/env node

var logger = require('../lib/logger.js')({depth: 4});
var program = require('commander');
var types = require('../lib/types.js');
var wotblitz = require('wotblitz')();

if (require.main === module) {
	main(
		program
			.option('-v, --vehicles [tank_ids]', 'list of vehicles with default profile (endpoint)', types.numbers)
			.option('-c, --characteristic <tank_id>', 'get the characterists given the module ids (endpoint)', Number)
			.option('-m, --modules [module_ids]', 'list of available modules, such as guns, engines, etc. (endpoint)', types.numbers)
			.option('-p, --provisions [provision_ids]', 'list of available equipment and consumables (endpoint)', types.numbers)
			.option('-i, --info', 'overview of the tankopedia (endpoint)')
			.option('-a, --achievements', 'description of all achievements (endpoint)')
			.option('-s, --crewskills [skill_ids]', 'information about crew skills (endpoint)', types.fields)
			.option('-P, --profiles', 'vehicle profiles to be used in characteric (endpoint)')
			.option('-n, --nations <nations>', 'selection of nation(s)', types.fields, [])
			.option('-t, --tank-ids <tank_ids>', 'selection of tank_id(s)', types.numbers, [])
			.option('-f, --fields <fields>', 'selection of field(s)', types.fields, [])
			.option('-d, --default', 'show only the default characteristics')
			.option('-T, --provision-type <equipment|optionalDevice>', 'select consumable or equipment', types.provision)
			.option('-M, --module <[estg]number>', 'select which module to equip for characteric', types.modules, {})
			.option('-C, --vehicletype <types>', 'select crews skills based on vehicle type(s)', types.list, [])
			.parse(process.argv)
	).then(logger.write).catch(logger.error);
}

function main(opts) {
	if (opts.vehicles) return wotblitz.encyclopedia.vehicles(arrayOrNull(opts.vehicles), opts.nations, opts.fields);

	if (opts.characteristic) {
		return wotblitz.encyclopedia.vehicleprofile(opts.characteristic, null, {
			engine_id: opts.module.engine,
			gun_id: opts.module.gun,
			suspension_id: opts.module.suspension,
			turret_id: opts.module.turret
		}, opts.fields);
	}

	if (opts.modules) return wotblitz.encyclopedia.modules(arrayOrNull(opts.modules), opts.fields);

	if (opts.provisions) {
		return wotblitz.encyclopedia.provisions(opts.tankIds, arrayOrNull(opts.provisions), opts.provisionType, opts.fields);
	}

	if (opts.info) return wotblitz.encyclopedia.info(opts.fields);

	if (opts.achievements) return wotblitz.encyclopedia.achievements(opts.fields);

	if (opts.crewskills) return wotblitz.encyclopedia.crewskills(arrayOrNull(opts.crewskills), opts.vehicletype, opts.fields);

	if (opts.profiles) return wotblitz.encyclopedia.vehicleprofiles(opts.tankIds, null, opts.fields);
}

function arrayOrNull(x) {
	return Array.isArray(x) ? x : null;
}
