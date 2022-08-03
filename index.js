require('dotenv').config();
const config = require('./src/utils/config.js');
const reactions = require('./src/utils/reactions.js');
const bot = require('./src/bot.js');

config(process.env.CONFIG_FILE);
config.load();

reactions.setFile(process.env.REACTIONS_FILE);
reactions.load();

bot.startup(process.env.TOKEN);

setInterval(function () {
	config.save();
	reactions.save();
}, 900000)

//
// Shutdown Events
//

var isShuttingDown = false;

const shutdown = (signal) => {
	if (isShuttingDown) return;

	isShuttingDown = true;
	console.log('Shutting down...');

	//TODO: Shutdown Actions
	bot.preShutdown();

	setTimeout(function () {
		bot.shutdown();
		console.log('Closed!');

        console.log('Saving config...');
        config.save().then(() => {
            console.log('Saved config!');
        }).catch(e => {
            console.log('Could not save config!');
            console.error(e);
        });

		console.log('Saving role reactions...');
        reactions.save().then(() => {
            console.log('Saved role reactions!');
        }).catch(e => {
            console.log('Could not role reactions!');
            console.error(e);
        });

	}, 1000);

    setTimeout(function () {
        process.exit(0)
    }, 2000)
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('SIGUSR1', shutdown);
process.on('SIGUSR2', shutdown);
process.on('uncaughtException', (e) => {
	console.error(e);
	shutdown();
});
