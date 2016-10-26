wotblitz-cli
============

A simple command line utility for exporting the
[World of Tanks Blitz](http://wotblitz.com/) API utilizing the
[wotblitz.js](//github.com/CodeMan99/wotblitz.js) tool set.

How to Install
--------------

Wotblitz is written in [nodejs](https://nodejs.org/), you must install it first.
Once you have node installed you can run `npm install -g wotblitz-cli`, this will
make the `wotblitz` command accessible.

Usage
-----

To see an overview, do `wotblitz --help`.

Get some clan information, selecting some fields.

    $ wotblitz clans -i 17 -f created_at,name,tag,motto,members_count
    { '17':
       { motto: 'Hear the Thunder, Feel the Lightning',
         tag: 'STORM',
         members_count: 47,
         created_at: 1438733647,
         name: 'Thunderstorm_Division I' } }

Get some player information, de-selecting some fields, as JSON.

    $ # note the pipe to cat
    $ wotblitz players -i 1009912015 \
    > -f ',-statistics.frags,-statistics.team,-statistics.company' \
    > -f ',-statistics.clan,-private,-nickname' | cat
    {
      "1009912015": {
        "statistics": {
          "max_xp_tank_id": 51713,
          "all": {
            "spotted": 11598,
            "max_frags_tank_id": 11777,
            "hits": 73904,
            "frags": 7150,
            "max_xp": 2095,
            "max_xp_tank_id": 51713,
            "wins": 4634,
            "losses": 3522,
            "capture_points": 9578,
            "battles": 8286,
            "damage_dealt": 6972898,
            "damage_received": 6075113,
            "max_frags": 7,
            "shots": 95879,
            "frags8p": 1149,
            "xp": 4916318,
            "win_and_survived": 2563,
            "survived_battles": 2609,
            "dropped_capture_points": 17162
          },
          "max_xp": 2095
        },
        "created_at": 1405533433,
        "last_battle_time": 1444625817,
        "account_id": 1009912015,
        "updated_at": 1444626269
      }
    }

Check how many people are on the (NA) wotb server.

    $ wotblitz servers
    [ { players_online: 3195, server: 'NA' } ]

See what game version the tankopedia is aware of.

    $ wotblitz tankopedia -i -f game_version
    { game_version: '2.1.0' }

Determine a player's mastery level on a given tank.

    $ wotblitz tank-stats -s 1009912015 -t 1 -f mark_of_mastery
    { '1009912015': [ { mark_of_mastery: 3 } ] }

Much more is possible, please explore!

Using an Alternate APPLICATION_ID
---------------------------------

The reason to have your own `APPLICATION_ID` is so that you can release your
appication. If you intend just release the data, then you are within the bounds
of the terms Wargaming has setup. If you are unsure, please read the agreement
yourself.

    $ APPLICATION_ID=myapplicationid wotblitz servers | myapp.sh

In the example above the bash script "myapp.sh" receives a JSON string to parse.
Anything more complex should use [wotblitz.js](//github.com/CodeMan99/wotblitz.js)
instead.

Limitations
-----------

All data is pulled directly from Wargaming's API for World of Tanks. When in-game
items are missing (like a new tank line) it is due to the fact that Wargaming does
not update their API very often. Missing data is out of the control of this
application. Any ticket created on this topic will be closed with a "wont fix" label.

[License](LICENSE.md)
---------------------

This project uses the Internet Software Consortium (ISC) license unless otherwise
stated at the top of a file.

More Resources
--------------

* [Wargaming.net developer room](https://na.wargaming.net/developers/)
* [Online tankopedia](http://wotblitz.com/encyclopedia/vehicles/)
* [Community wiki](http://wiki.wargaming.net/en/WoT_Blitz)
* [Community forum](http://forum.wotblitz.com/)
