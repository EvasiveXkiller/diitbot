/**
 * This is the music branch, it used to have music controls but now the functions here are not up to date
 * This has been superseded by SoundWave
 *
 * The code below only works for discordjs v12 and DMP v7 (If im not wrong)
 *
 * If u do run make sure that u do not run `npm update`. This will cause the newer packages to be downloaded and hence not compatible with this code.
 * - Carlson
 */

const Discord = require("discord.js");
const client = new Discord.Client();
const { Player } = require("discord-music-player");
const player = new Player(client, {
	leaveOnEmpty: true,
	quality: "high",
	leaveOnStop: false,
	timeout: 60000,
});

client.player = player;
const prefix = "$";

let queuetoggle = false;
let songtoggle = false;
let opstatsmusic = false;

client.player
	.on("songChanged", (message, newSong) => {
		client.user.setPresence({
			activity: {
				name: newSong.name,
				type: "LISTENING",
			},
		});
	})
	.on("queueEnd", () => {
		client.user.setPresence({
			activity: {
				name: "Silence",
				type: "LISTENING",
			},
		});
	})
	.on("error", (message, error) => {
		switch (error) {
		case "LiveUnsupported": {
			const liveeeror = new Discord.MessageEmbed({
				description:
							"Live Vidoes are not supported, skipping current song",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(liveeeror);
		}
		}
	});

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) {

		// * Breaks if the input is not valid
		return;
	}
	const args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
	const command = args.shift().toLowerCase(); // * Processed command that ready to be read by switch cases
	if (command === "play" || command === "p") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		opstatsmusic = true;
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}

		// * Music player
		const userinput = message.content
			.replace("$play", "")
			.replace("$p", "")
			.trim();
		if (userinput.length === 0) {
			const noparamembed = new Discord.MessageEmbed({
				description: "No Parameters Given",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(noparamembed);
			opstatsmusic = false;
			return;
		}
		const isPlaying = client.player.isPlaying(message);
		if (!validURL(userinput)) {

			// * if user uses a search term
			const userfindembed = new Discord.MessageEmbed({
				description:
					"Alright alright searching for whatever u have typed",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(userfindembed);
		}
		if (isPlaying) {

			// * add to queue if playing
			const connecteduser = message.member.voice.channel;
			if (!connecteduser) {

				// * if user is not connected
				const usernotconnectedembed = new Discord.MessageEmbed({
					description: "You not in a voice channel dummy",
					footer: {
						text: "International music bot",
					},
				});
				message.channel.send(usernotconnectedembed);
				opstatsmusic = false;
				return;
			}
			const botchannel = client.voice.connections.toJSON();
			if (connecteduser.id !== botchannel[0].channel) {

				// * if user is not in the same channel
				const diffchannelembed = new Discord.MessageEmbed({
					description:
						"Dont try and troll other people, get other bots",
					footer: {
						text: "International music bot",
					},
				});
				message.channel.send(diffchannelembed);
				opstatsmusic = false;
				return;
			}
			client.player
				.addToQueue(message, userinput, {

					// * Add the song to queue
					sortBy: "relevance",
				})
				.then((song) => {
					const preprocess = song;

					// console.log(preprocess);
					const queueembed = new Discord.MessageEmbed({
						description:
							"okay added in queue : \n"
							+ "["
							+ preprocess.name
							+ "]("
							+ preprocess.url
							+ ")",
						footer: {
							text: "International music bot",
						},
					});
					message.channel.send(queueembed).then(() => {
						opstatsmusic = false;
					});
				})
				.catch((err) => {

					// * if search engine went wrong
					const errembed = new Discord.MessageEmbed({
						description:
							"Something went wrong internally but its probably your fault",
						footer: {
							text: "International music bot",
						},
					});
					message.channel.send(errembed).then(() => {
						opstatsmusic = false;
					});
					console.error(err);
					opstatsmusic = false;
					return;
				});
		} else {
			const connecteduser = message.member.voice.channel;
			if (!connecteduser) {

				// * if user is not connected
				const usernotconnectedembed = new Discord.MessageEmbed({
					description: "You not in a voice channel dummy",
					footer: {
						text: "International music bot",
					},
				});
				message.channel.send(usernotconnectedembed);
				opstatsmusic = false;
				return;
			}
			client.player
				.play(message, userinput, {

					// * plays the song immediately when the queue is empty
					sortBy: "relevance",
				})
				.then((song) => {
					try {
						const preprocess = song;

						// console.log(preprocess.name);
						client.user.setPresence({
							status: "dnd",
							activity: {
								name: preprocess.name,
								type: "LISTENING",
							},
						});
						const playembed = new Discord.MessageEmbed({
							description:
								"Now playing :  \n"
								+ "["
								+ preprocess.name
								+ "]("
								+ preprocess.url
								+ ")",
							footer: {
								text: "International Music Bot",
							},
						});
						message.channel.send(playembed).then(() => {
							opstatsmusic = false;
						});
					} catch (err) {

						// * If something wents wrong
						const errembed = new Discord.MessageEmbed({
							description:
								"Something went wrong internally but its probably your fault",
							footer: {
								text: "International music bot",
							},
						});
						message.channel.send(errembed);
						console.log(err);
						opstatsmusic = false;
						return;
					}
				});
		}
	}
	if (command === "volume") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}

		// * controls volume globally
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		const userinput = message.content.replace("$volume", "").trim();
		if (isNaN(userinput)) {
			const volumerror = new Discord.MessageEmbed({
				description:
					"Thats not a number, what did u do during maths class?",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(volumerror);
			return;
		}
		client.player.setVolume(message, parseInt(userinput, 10));
		const volumesuccess = new Discord.MessageEmbed({
			description: "Volume is set to " + userinput + "%",
			footer: {
				text: "Volume is not persistent across restarts (yet)",
			},
		});
		message.channel.send(volumesuccess);
	}
	if (command === "stop") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		opstatsmusic = true;
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			opstatsmusic = false;
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			opstatsmusic = false;
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			opstatsmusic = false;
			return;
		} else {
			client.player.stop(message); // * Stop the song and deletes the queue
			client.user
				.setPresence({

					// * Set the bot status
					status: "dnd",
					activity: {
						name: "Silence",
						type: "LISTENING",
					},
				})
				.then(() => {
					opstatsmusic = false;
				});
		}
	}
	if (command === "repeatsong" || command === "repeattrack") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();
		console.log(botchannel);

		// console.log(connecteduser)
		if (botchannel.length === 0) {
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		songtoggle = client.player.toggleLoop(message);
		if (songtoggle) {
			const tempembed = new Discord.MessageEmbed({
				description: "Repeat Current track: True",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		} else {
			const tempembed = new Discord.MessageEmbed({
				description: "Repeat Current track: False",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		}
	}
	if (command === "repeatqueue") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		queuetoggle = client.player.toggleQueueLoop(message);
		if (queuetoggle) {
			const tempembed = new Discord.MessageEmbed({
				description: "Repeat Queue: True",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		} else {
			const tempembed = new Discord.MessageEmbed({
				description: "Repeat Queue: False",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		}
	}
	if (command === "skip") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		client.player.skip(message); // * Skips the track
		const skipembed = new Discord.MessageEmbed({
			description: "Skipping...",
			footer: {
				text: "why u skip? rushing to the airport izzit?",
			},
		});
		message.channel.send(skipembed);
	}
	if (command === "queue" || command === "q") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const queue = client.player.getQueue(message);
		if (!queue) {
			const queueempty = new Discord.MessageEmbed({
				description: "No more songs in queue bruh",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(queueempty);
			return;
		}
		const rawq
			= "\n`Queue:\n"
			+ queue.songs
				.map((song, i) => {
					return `${i === 0 ? "Now Playing" : `#${i + 1}`} - ${
						song.name
					} | ${song.author}\``;
				})
				.join("\n`");
		const state
			= "`Repeat Track: "
			+ songtoggle
			+ "`\n"
			+ "`Repeat Queue: "
			+ queuetoggle
			+ "`";
		message.channel.send(
			rawq
			+ "\n\nCurrent Song Progress\n`"
			+ client.player.createProgressBar(message, 20)
			+ "`"
			+ "\n"
			+ state,
		);
	}
	if (command === "remove") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const userinput = message.content.replace("$remove", "").trim();
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		const SongID = parseInt(userinput, 10) - 1;
		if (SongID === 0) {

			// * if user tries to remove the current song
			message.channel.send(
				"You cant remove the song that youre playing ._.",
			);
			return;
		}
		client.player.remove(message, SongID);
		message.channel.send("Removed song " + userinput + " from the Queue!");
		const queue = client.player.getQueue(message);
		message.channel.send(

			// * Get the current queue track
			"`Queue:\n"
			+ queue.songs
				.map((song, i) => {
					return `${i === 0 ? "Now Playing" : `#${i + 1}`} - ${
						song.name
					} | ${song.author}\``;
				})
				.join("\n`"),
		);
	}
	if (command === "seek") {
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		const userinput = message.content.replace("$seek", "").trim();
		if (!/^\d+$/.test(userinput)) {
			const seekerr = new Discord.MessageEmbed({
				description:
					"Thats not a number, what did u do during maths class?",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(seekerr);
			return;
		}
		client.player.seek(message, parseInt(userinput * 1000, 10));
		const seeksuccessembed = new Discord.MessageEmbed({
			description: "Seeked to " + msToTime(userinput * 1000),
			footer: {
				text: "International music bot",
			},
		});
		message.channel.send(seeksuccessembed);
		return;
	}
	if (
		command === "dis"
		|| command === "fuckoff"
		|| command === "leave"
		|| command === "dc"
	) {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic === true) {
			console.log("something is going on in the search algo");
			return;
		}
		const connecteduser = message.member.voice.channel;
		if (!connecteduser) {

			// * if user is not connected
			const usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		const botchannel = client.voice.connections.toJSON();

		// console.log(botchannel);
		// console.log(connecteduser)
		if (botchannel.length === 0) {

			// * if bot is not in a channel
			const botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {

			// * if user is not in the same channel
			const diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}

		// console.log(botchannel);
		if (botchannel.length === 1) {

			// * if all checks aare success
			const disembed = new Discord.MessageEmbed({
				description: "Ciao luuuuu",
				footer: {
					text: "International music bot",
				},
			});
			client.player.stop(message); // * stops the bot before disconnecting
			message.channel.send(disembed).then(() => {
				if (message.member.voice.channel) {
					message.member.voice.channel.leave();
				}
			});
		}
		client.user.setPresence({
			status: "dnd",
			activity: {
				name: "Elearn",
				type: "STREAMING",
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			},
		});
	}
	if (command === "destroy") {

		// * Killing the bot, only users below can do it
		const mods = ["EvasiveXkiller", "ikenot", "Araric"];
		if (!mods.includes(message.author.username)) {
			message.channel.send(
				"You dont have enough permissions to stop the bot",
			);
			return;
		}
		client.destroy();
		setTimeout(() => {
			process.exit();
		}, 1000);
	}

});

client.on("ready", () => {
	client.user.setPresence({
		status: "dnd",
		activity: {
			name: "Elearn",
			type: "STREAMING",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		},
	});
	console.log("thread_music ready");
});

client.on("voiceStateUpdate", () => {

	// * Change bot status if bot leaves the voice channel
	const botchannel = client.voice.connections.toJSON();
	if (botchannel.length === 0) {
		queuetoggle = false;
		songtoggle = false;
		songtoggle = false;
		opstatsmusic = false;
		client.user.setPresence({
			status: "dnd",
			activity: {
				name: "Elearn",
				type: "STREAMING",
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			},
		});
	}
});

function validURL(str) {

	// * detection of real url
	const pattern = new RegExp(
		"^(https?:\\/\\/)?" // protocol
		+ "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" // domain name
		+ "((\\d{1,3}\\.){3}\\d{1,3}))" // OR ip (v4) address
		+ "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" // port and path
		+ "(\\?[;&a-z\\d%_.~+=-]*)?" // query string
		+ "(\\#[-a-z\\d_]*)?$",
		"i",
	); // fragment locator
	return !!pattern.test(str);
}

function msToTime(duration) {
	let milliseconds = parseInt((duration % 1000) / 100, 10),
		seconds = parseInt((duration / 1000) % 60, 10),
		minutes = parseInt((duration / (1000 * 60)) % 60, 10),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);

	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	return hours + " : " + minutes + " : " + seconds + " . " + milliseconds;
}

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
