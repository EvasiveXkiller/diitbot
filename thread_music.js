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

// > class for IPC
class respond {
	constructor(restitle, resdata) {
		this.title = restitle;
		this.respond = resdata;
	}
}

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		// * Breaks if the input is not valid
		return;
	}
	let args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
	let command = args.shift().toLowerCase(); // * Processed command that ready to be read by switch cases
	if (command === "play" || command === "p") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		opstatsmusic = true;
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		// * Music player
		let userinput = message.content
			.replace("$play", "")
			.replace("$p", "")
			.trim();
		if (userinput.length == 0) {
			let noparamembed = new Discord.MessageEmbed({
				description: "No Parameters Given",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(noparamembed);
			opstatsmusic = false;
			return;
		}
		let isPlaying = client.player.isPlaying(message.guild.id);
		if (!validURL(userinput)) {
			// * if user uses a search term
			let userfindembed = new Discord.MessageEmbed({
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
			let connecteduser = message.member.voice.channel;
			if (!connecteduser) {
				// * if user is not connected
				let usernotconnectedembed = new Discord.MessageEmbed({
					description: "You not in a voice channel dummy",
					footer: {
						text: "International music bot",
					},
				});
				message.channel.send(usernotconnectedembed);
				opstatsmusic = false;
				return;
			}
			let botchannel = client.voice.connections.toJSON();
			if (connecteduser.id !== botchannel[0].channel) {
				// * if user is not in the same channel
				let diffchannelembed = new Discord.MessageEmbed({
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
				.addToQueue(message.guild.id, userinput, {
					// * Add the song to queue
					sortBy: "relevance",
				})
				.then((song) => {
					let preprocess = song.song;
					//console.log(preprocess);
					let queueembed = new Discord.MessageEmbed({
						description:
							"okay added in queue : \n" +
							"[" +
							preprocess.name +
							"](" +
							preprocess.url +
							")",
						footer: {
							text: "International music bot",
						},
					});
					message.channel.send(queueembed).then(() => {
						opstatsmusic = false;
					});

					client.player
						.getQueue(message.guild.id)
						.on("songChanged", (oldSong, newSong) => {
							// * change bot status
							client.user.setPresence({
								activity: {
									name: newSong.name,
									type: "LISTENING",
								},
							});
						});
					client.player.getQueue(message.guild.id).on("end", () => {
						// * end bot status
						//console.log("end");
						client.user.setPresence({
							activity: {
								name: "Silence",
								type: "LISTENING",
							},
						});
					});
				})
				.catch((err) => {
					// * if search engine went wrong
					let errembed = new Discord.MessageEmbed({
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
			let connecteduser = message.member.voice.channel;
			if (!connecteduser) {
				// * if user is not connected
				let usernotconnectedembed = new Discord.MessageEmbed({
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
				.play(message.member.voice.channel, userinput, {
					// * plays the song immediately when the queue is empty
					sortBy: "relevance",
				})
				.then((song) => {
					try {
						let preprocess = song.song;
						//console.log(preprocess.name);
						client.user.setPresence({
							status: "dnd",
							activity: {
								name: preprocess.name,
								type: "LISTENING",
							},
						});
						let playembed = new Discord.MessageEmbed({
							description:
								"Now playing :  \n" +
								"[" +
								preprocess.name +
								"](" +
								preprocess.url +
								")",
							footer: {
								text: "International Music Bot",
							},
						});
						message.channel.send(playembed).then(() => {
							opstatsmusic = false;
						});
					} catch (err) {
						// * If something wents wrong
						let errembed = new Discord.MessageEmbed({
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
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		// * controls volume globally
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		let userinput = message.content.replace("$volume", "").trim();
		if (isNaN(userinput)) {
			let volumerror = new Discord.MessageEmbed({
				description:
					"Thats not a number, what did u do during maths class?",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(volumerror);
			return;
		}
		client.player.setVolume(message.guild.id, parseInt(userinput));
		let volumesuccess = new Discord.MessageEmbed({
			description: "Volume is set to " + userinput + "%",
			footer: {
				text: "Volume is not persistent across restarts (yet)",
			},
		});
		message.channel.send(volumesuccess);
	}
	if (command === "stop") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		opstatsmusic = true;
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			opstatsmusic = false;
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			opstatsmusic = false;
			return;
		} else {
			client.player.stop(message.guild.id); // * Stop the song and deletes the queue
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
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			let botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		songtoggle = client.player.toggleLoop(message.guild.id);
		if (songtoggle) {
			let tempembed = new Discord.MessageEmbed({
				description: "Repeat Current track: True",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		} else {
			let tempembed = new Discord.MessageEmbed({
				description: "Repeat Current track: False",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		}
	}
	if (command === "repeatqueue") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			let botnotconnectedembed = new Discord.MessageEmbed({
				description: "Bot not alive, just like your life",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(botnotconnectedembed);
			return;
		}
		if (connecteduser.id !== botchannel[0].channel) {
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		queuetoggle = client.player.toggleQueueLoop(message.guild.id);
		if (queuetoggle) {
			let tempembed = new Discord.MessageEmbed({
				description: "Repeat Queue: True",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		} else {
			let tempembed = new Discord.MessageEmbed({
				description: "Repeat Queue: False",
				color: "PURPLE",
			});
			message.channel.send(tempembed);
		}
	}
	if (command === "skip") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		client.player.skip(message.guild.id); // * Skips the track
		let skipembed = new Discord.MessageEmbed({
			description: "Skipping...",
			footer: {
				text: "why u skip? rushing to the airport izzit?",
			},
		});
		message.channel.send(skipembed);
	}
	if (command === "queue" || command === "q") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let queue = client.player.getQueue(message.guild.id);
		if (!queue) {
			let queueempty = new Discord.MessageEmbed({
				description: "No more songs in queue bruh",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(queueempty);
			return;
		}
		let rawq =
			"\n` Queue:\n" +
			queue.songs
				.map((song, i) => {
					return `${i === 0 ? "Now Playing" : `#${i + 1}`} - ${
						song.name
					} | ${song.author}\``;
				})
				.join("\n`");
		let state =
			"`Repeat Track: " +
			songtoggle +
			"`\n" +
			"`Repeat Queue: " +
			queuetoggle +
			"`";
		message.channel.send(
			rawq +
				"\n\nCurrent Song Progress\n`" +
				client.player.createProgressBar(message.guild.id, 20) +
				"`" +
				"\n" +
				state
		);
	}
	if (command === "remove") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let userinput = message.content.replace("$remove", "").trim();
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		let SongID = parseInt(userinput) - 1;
		if (SongID == 0) {
			// * if user tries to remove the current song
			message.channel.send(
				"You cant remove the song that youre playing ._."
			);
			return;
		}
		client.player.remove(message.guild.id, SongID);
		message.channel.send("Removed song " + userinput + " from the Queue!");
		let queue = client.player.getQueue(message.guild.id);
		message.channel.send(
			// * Get the current queue track
			"`Queue:\n" +
				queue.songs
					.map((song, i) => {
						return `${i === 0 ? "Now Playing" : `#${i + 1}`} - ${
							song.name
						} | ${song.author}\``;
					})
					.join("\n`")
		);
	}
	if (command === "seek") {
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		let userinput = message.content.replace("$seek", "").trim();
		if (!/^\d+$/.test(userinput)) {
			let seekerr = new Discord.MessageEmbed({
				description:
					"Thats not a number, what did u do during maths class?",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(seekerr);
			return;
		}
		client.player.seek(message.guild.id, parseInt(userinput * 1000));
		let seeksuccessembed = new Discord.MessageEmbed({
			description: "Seeked to " + msToTime(userinput * 1000),
			footer: {
				text: "International music bot",
			},
		});
		message.channel.send(seeksuccessembed);
		return;
	}
	if (
		command === "dis" ||
		command === "fuckoff" ||
		command === "leave" ||
		command === "dc"
	) {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			opstatsmusic = false;
			return;
		}
		if (opstatsmusic == true) {
			console.log("something is going on in the search algo");
			return;
		}
		let connecteduser = message.member.voice.channel;
		if (!connecteduser) {
			// * if user is not connected
			let usernotconnectedembed = new Discord.MessageEmbed({
				description: "You not in a voice channel dummy",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(usernotconnectedembed);
			return;
		}
		let botchannel = client.voice.connections.toJSON();
		//console.log(botchannel);
		//console.log(connecteduser)
		if (botchannel.length == 0) {
			// * if bot is not in a channel
			let botnotconnectedembed = new Discord.MessageEmbed({
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
			let diffchannelembed = new Discord.MessageEmbed({
				description: "Dont try and troll other people, get other bots",
				footer: {
					text: "International music bot",
				},
			});
			message.channel.send(diffchannelembed);
			return;
		}
		//console.log(botchannel);
		if (botchannel.length == 1) {
			// * if all checks aare success
			let disembed = new Discord.MessageEmbed({
				description: "Ciao luuuuu",
				footer: {
					text: "International music bot",
				},
			});
			client.player.stop(message.guild.id); // * stops the bot before disconnecting
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
	// if (command === "playlist") {
	// 	if (opstatsmusic == true) {
	// 		console.log("something is going on in the search algo");
	// 		return;
	// 	}
	// 	let playlist = await client.player.playlist(
	// 		message.guild.id,
	// 		args.join(" "),
	// 		message.member.voice.channel,
	// 		-1,
	// 		message.author.tag
	// 	);
	// 	console.log(playlist);
	// 	playlist = playlist.playlist;
	// 	let playlistsuccess = new Discord.MessageEmbed({
	// 		description: `Queued **${playlist.videoCount} songs**`,
	// 	});
	// 	playlistsuccess.setTimestamp();
	// 	message.channel.send(playlistsuccess);
	// 	opstatsmusic = false;
	// }
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

client.on("voiceStateUpdate", (oldstate, newstate) => {
	// * Change bot status if bot leaves the voice channel
	let botchannel = client.voice.connections.toJSON();
	if (botchannel.length == 0) {
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
	var pattern = new RegExp(
		"^(https?:\\/\\/)?" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // fragment locator
	return !!pattern.test(str);
}
function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	return hours + " : " + minutes + " : " + seconds + " . " + milliseconds;
}

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
