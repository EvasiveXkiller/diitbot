const Discord = require("discord.js");
const { DiscordUNO } = require("discord-uno");
const TicTacToe = require("discord-tictactoe");

const client = new Discord.Client();
const discordUNO = new DiscordUNO();

const prefix = "$";
let enableuno = 0;

// > class for IPC
class respond {
	constructor(restitle, resdata) {
		this.title = restitle;
		this.respond = resdata;
	}
}

client.on("message", async (message) => {
	// * Breaks if the input is not valid
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
	let args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
	let command = args.shift().toLowerCase();
	//console.log(`${message.author.username} => ${message.content}`);

	if (command === "uno") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		enableuno = 1;
		let unoembed = new Discord.MessageEmbed({
			title: "Uno has been enabled",
			description: `The following commands have been enabled:
 \`$unocreate\`  Create a new uno game
 \`$unojoin\` Join the created uno game
 \`$unostart\` Start the uno game
 \`$unoplay\` Play your cards
 \`$unodraw\` Draw a new card if unable to play
 \`$uno!\` Protect yourself from UNO!
 \`$unoviewself\` View your current cards
 \`$unoviewtable\` View what is on the table
 \`$unoend\` Ends the current game
 \`$unosettings\` Configure game settings
 \`$unoviewsetting\` View Game Settings
 If the game becomes unresponsive or is behaving wierdly, please reset the bot`,
			color: "GREEN",
			footer: {
				text: "Max players per channel is 10.",
			},
		});
		message.channel.send(unoembed);
	}
	if (command === "unocreate") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.createGame(message);
		}
	}
	if (command === "unojoin") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.addUser(message);
		}
	}
	if (command === "unostart") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.startGame(message);
		}
	}
	if (command === "unoend") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.endGame(message);
		}
	}
	if (command === "unoplay") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.playCard(message);
			await discordUNO.viewTable(message);
		}
	}
	if (command === "unoleave") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.removeUser(message);
		}
	}
	if (command === "unodraw") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.draw(message);
			await discordUNO.viewTable(message);
		}
	}
	if (command === "uno!") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.UNO(message);
		}
	}
	if (command === "unoviewself") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.viewCards(message);
		}
	}
	if (command === "unoviewtable") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.viewTable(message);
		}
	}
	if (command === "unoviewsettings") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.viewSettings(message);
		}
	}
	if (command === "unosettings") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno == 1) {
			await discordUNO.updateSettings(message);
		}
	}
	if (command === "destroy") {
		// * Killing the bot, only users below can do it
		let mods = ["EvasiveXkiller", "ikenot", "Araric"];
		if (!mods.includes(message.author.username)) {
			message.channel.send(
				"You dont have enough permissions to stop the bot"
			);
			return;
		}
		client.destroy();
		setTimeout(() => {
			process.exit();
		}, 1000);
	}
});

client.once("ready", () => {
	console.log("thread_games ready");
});

// > IPC with parent process
process.on("message", (comm) => {
	if (comm === "memusage") {
		process.send(new respond("memusage", process.memoryUsage()));
	}
	if (comm === "kill") {
		client.destroy();
		setTimeout(() => {
			process.exit();
		}, 500);
	}
	if (comm === "userkill") {
		client.destroy();
		setTimeout(() => {
			process.exit();
		}, 5000);
	}
});

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
