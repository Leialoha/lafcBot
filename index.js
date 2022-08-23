require('dotenv').config();
const bot = require('./src/bot.js');

if (process.env.TOKEN == null) {
	console.log('process.env.TOKEN is not set!');
	process.exit(1);
} else bot.startup(process.env.TOKEN);

bot.getClient().version = '0.0.2';

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
