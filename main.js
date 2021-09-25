const Discord = require("discord.js");
const fusejs = require("fuse.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { DateTime } = require("luxon");
const pollEmbed = require("discord.js-poll-embed");
const TicTacToe = require("discord-tictactoe");
const { token } = require("./credentials.json");

// > DB Connection on Carlson
const adapter = new FileSync("db.json");
const db = low(adapter);

// > DB Connection on Jack
const adapterjack = new FileSync("dbjack.json");
const dbjack = low(adapterjack);

// > DB Connection on Ken
const adapterken = new FileSync("dbken.json");
const dbken = low(adapterken);

// > Important Constants
const client = new Discord.Client();

// * Options for search engine
const options = {

	// * Carlson param for search system
	includeScore: true,
	keys: ["Name"],
};
const optionsken = {

	// * Ken param for search system
	includeScore: true,

	// Search in `author` and in `tags` array
	keys: ["tags"],
};

// > Important Variables
const names = [];
let dbinput = [];
let verbosedebug = 0;

// > Prefix that triggers the bot
const prefix = "$";

// > Prototype for smart remove on array
Array.prototype.remove = function () {
	let what,
		a = arguments,
		L = a.length,
		ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

// > class for IPC
class respond {
	constructor(restitle, resdata) {
		this.title = restitle;
		this.respond = resdata;
	}
}

// > Sync Branch
client.on("message", (message) => {
	let memearray
	;
	db.read(); // * master read on carlson branch

	if (!message.content.startsWith(prefix) || message.author.bot) {

		// * Breaks if the input is not valid
		return;
	}
	const args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
	const command = args.shift().toLowerCase(); // * Processed command that ready to be read by switch cases

	if (command === "iconic") {

		// * iconic quotes system using nosql and fusejs, fully implemented
		let output, localoutput;

		const userinput = message.content.replace("iconic", "").trim();

		// * random color generator
		const randomColor = Math.floor(Math.random() * 16777215).toString(16);
		const date = new Date();
		if (message.content === "$iconic") {

			// * if user din give input
			for (
				let index = 0;
				index < db.get("quotes").write().length;
				index++
			) {

				// * get all names for randomizer
				names.push(db.get("quotes").write()[index].Name);
			}

			// eslint-disable-next-line no-constant-condition
			while (true) {
				localoutput = query(
					names[parseInt(Math.random() * names.length, 10)],
				);
				if (typeof localoutput[1] !== "undefined") {

					// * if the person has no quotes
					break;
				}
				localoutput = [];
			}
			output = localoutput;
		} else {

			// * if user has input
			// console.log("branch2");
			localoutput = query(userinput);
			if (typeof localoutput[1] === "undefined") {
				localoutput[1] = "[ Empty ]";
			}
			output = localoutput;
		}
		const embed = new Discord.MessageEmbed({
			title: output[1],
			description: "--*" + output[0] + "*",
			color: randomColor.toUpperCase(), // colors[getRandomArbitrary(0,99)],
			url: "https://www.youtube.com/watch?v=cvh0nX08nRw",
			footer: {
				text:
					"The International Server "
					+ date.getFullYear()
					+ "\nConfidence: "
					+ output[2],
			},
		});
		embed.setThumbnail(output[3]);
		message.channel.send(embed);
	}
	if (command === "dbinsert") {

		// let userinput = message.content.replace("iconic" ,"").trim()
		const embedinstruction = new Discord.MessageEmbed({
			title: "Instructions",
			description:
				"1)Enter the name, then press [ Enter ] to continue\n 2)Enter the quote, press [ Enter ] when complete",
			footer: {
				text: "nosql",
			},
		});
		message.channel.send(embedinstruction);
		const filter = (m) => m.content;
		const collector = message.channel.createMessageCollector(filter, {

			// * start message collection at max 15 seconds
			time: 15000,
			max: 2,
		});

		collector.on("collect", (m) => {
			if (m.content === "$dbinsert") {
				message.channel.send(
					"In Progress. Cannot start another instance!",
				);
				return;
			}
			console.log(m.content);
			dbinput.push(m.content); // * push into array
		});

		collector.on("end", () => {

			// * Comfirm on insert into database
			const embedcomfirm = new Discord.MessageEmbed({
				title: "Confirm?",
				description:
					"Name : " + dbinput[0] + "\n" + "Quote: " + dbinput[1],
				color: "FF9900",
				footer: {
					text: "Are you sure to execute command? Type [ cancel ] to abort",
				},
			});
			message.channel.send(embedcomfirm);

			// eslint-disable-next-line no-shadow
			const filter = (comfirm) => comfirm.content;
			const comfirmcollector = message.channel.createMessageCollector(

				// * Collector for accept
				filter,
				{
					max: 1,
				},
			);
			comfirmcollector.on("collect", (comfirm) => {
				if (comfirm.content === "accept" || message.author.bot) {
					const namesarray = db.get("quotes").map("Name").value();
					if (!namesarray.includes(dbinput[0])) {

						// * if name is not found in database
						const embed = new Discord.MessageEmbed({
							title: "Commit Aborted",
							description:
								"Name not found in database.\n Please contact admin for more details \nDatabase not modified",
							color: "FF0000",
							footer: {
								text: "nosql",
							},
						});
						message.channel.send(embed);
						return;
					} else {

						// * command that interacts with the database
						const edit = db
							.get("quotes")
							.find({ Name: dbinput[0] })
							.value();
						const newdata = [...edit.Quotes];
						newdata.push(dbinput[1]);
						db.get("quotes")
							.find({ Name: dbinput[0] })
							.assign({ Quotes: newdata })
							.write();
					}
					const embed = new Discord.MessageEmbed({

						// * Success message
						title: "Commit Successful",
						description:
							"Summary\nName : "
							+ dbinput[0]
							+ "\nData : "
							+ dbinput[1],
						color: "00FF00",
						footer: {
							text: "nosql",
						},
					});
					embed.setTimestamp();
					message.channel.send(embed);
				} else {

					// * failure message
					const embed = new Discord.MessageEmbed({
						title: "Commit Aborted",
						description: "Database not modified",
						color: "0000FF",
						footer: {
							text: "nosql",
						},
					});
					message.channel.send(embed);
				}
			});
			comfirmcollector.on("end", () => {

				// * Clears array for next use
				dbinput = [];
			});
		});
	}
	if (command === "dbview") {

		// * raw dump of database into chat
		if (verbosedebug === 0) {
			return;
		}
		message.channel.send(JSON.stringify(db.getState()).substring(0, 1999));
		message.channel.send(
			JSON.stringify(db.getState()).substring(2000, 3999),
		);
	}
	if (command === "dbdelete") {

		// * Delete data from database
		if (verbosedebug === 0) {
			return;
		}
		const userinputpre = message.content.replace("$dbdelete", "").trim();
		const userinputSplit = userinputpre.split(",");
		console.log(userinputSplit);

		// * checking begins here
		const allnames = db.get("quotes").map("Name").value();
		if (!allnames.includes(userinputSplit[0])) {

			// * Name is not found in the database
			const messagelocal = new Discord.MessageEmbed({
				title: "Commit Error",
				description:
					userinputSplit[0]
					+ " is not a valid user in the database\nPlease check the syntax",
				color: "FF0000",
				footer: {
					text: "nosql",
				},
			});
			messagelocal.setTimestamp();
			message.channel.send(messagelocal);
			return;
		}
		const localquotes = db
			.get("quotes")
			.find({ Name: userinputSplit[0] })
			.get("Quotes")
			.value();
		if (!localquotes.includes(userinputSplit[1])) {

			// * if quote is not found in database
			const messagelocal = new Discord.MessageEmbed({
				title: "Commit Error",
				description:
					"Quote not found in database\nPlease check the syntax",
				color: "FF0000",
				footer: {
					text: "nosql",
				},
			});
			messagelocal.setTimestamp();
			message.channel.send(messagelocal);
			return;
		}
		const updatedquotes = localquotes.remove(userinputSplit[1]); // * if all checks passes
		db.get("quotes")
			.find({ Name: userinputSplit[0] })
			.assign({ Quotes: updatedquotes })
			.write();
		const messagelocal = new Discord.MessageEmbed({

			// * Summary system
			title: "Commit Successful",
			description: userinputSplit[0] + " has been removed",
			color: "00FF00",
			footer: {
				text: "nosql",
			},
		});
		messagelocal.setTimestamp();
		message.channel.send(messagelocal);
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
		const offlinemessage = new Discord.MessageEmbed({
			description: "Going Offline Immediately!",
			color: "FF0000",
			footer: {
				text: message.author.username,
			},
		});
		offlinemessage.setTimestamp();
		message.channel.send(offlinemessage).then(() => {
			client.destroy();
			setTimeout(() => {
				process.exit();
			}, 1000);
		});
	}
	if (command === "reset") {
		if (message.content === "$reset %reset%") {
			const resetstart = new Discord.MessageEmbed({
				description: "Resetting...",
				color: "RED",
				footer: {
					text: "Please allow up to 2 mins for all threads to start",
				},
			});
			resetstart.setTimestamp();
			message.channel.send(resetstart).then(() => {
				process.send(
					new respond("reset", { author: message.author.id }),
				);
			});
		} else {
			const reseterr = new Discord.MessageEmbed({
				description:
					"Reset Command Failed! \n The reset command is :\n `$reset %reset%`",
				color: "RED",
				footer: {
					text: "Ensure that a reset is absolutely necessary before running",
				},
			});
			reseterr.setTimestamp();
			message.channel.send(reseterr);
		}
	}
	if (command === "ping") {

		// * v2 Ping Message with round trip latency and api latency
		const pingmessage = new Discord.MessageEmbed({
			description: `API Latency is ${Math.round(
				client.ws.ping,
			)}ms \n Rountrip : ${Date.now() - message.createdTimestamp}ms`,
		});
		pingmessage.setTimestamp();
		message.channel.send(pingmessage);
	}
	if (command === "help") {

		// * This is an embed list of nevigator for user to guide the user to type command they want. You can take this for now
		// > Ken
		const example = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("The DIIT Service Board")
			.setDescription(
				"💠\t "
				+ "description - To display server description and bot credits \n"
				+ "📚\t "
				+ "todayisday - To display today schedule\n"
				+ "😏\t "
				+ "gif - To display certain member gif \n"
				+ "💬\t "
				+ "iconic - To display iconic quotes among the members \n"
				+ "👥\t "
				+ "profile - To display certain DIIT member`s profile \n"
				+ "📊\t "
				+ "timetable - To display current timetable \n"
				+ "For syntax please refer to our [GitHub](https://github.com/EvasiveXkiller/diitbot-public/blob/main/README.md) page",
			);
		message.channel.send(example);
	}
	if (command === "timetablepic") {

		// * This is to display timetable schedule for semester three. It's done for the code.
		// > Ken
		message.channel.send("Here you go, " + `${message.author},`);
		message.channel.send(
			"https://cdn.discordapp.com/attachments/786216853848588309/794864558706786306/image0.png",
		);
	}
	if (command === "description") {

		// * This is an embed description to let the user read our server description and bot credits. This is okay for now.
		// > Ken
		const exampleEmbed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("The DIIT Description Board")
			.setDescription(
				"Welcome to Diit Community where our collaborative work will be share together and we are pleased to welcome you into the association. As part of our team is the part of our journey. Let`s treasure the moments we spend together. ",
			)
			.addFields(
				{
					name: "Official Docs",
					value: "https://github.com/EvasiveXkiller/diitbot-public/blob/main/README.md",
				},
				{ name: "Server Rules", value: "Rules: " },
				{
					name: "Rule 1",
					value: "Do not attempt to spam or flood channels",
					inline: true,
				},
				{
					name: "Rule 2",
					value: "If seeking support pls ask the admin for help",
					inline: true,
				},
			)
			.addField(
				"Rule 3",
				"This bot will active during the class period and will be still active in certain periods and not available during midnight",
				true,
			)
			.setThumbnail(
				"https://media.discordapp.net/attachments/802119940966449152/802432617005187092/diit.jpg?width=670&height=670",
			)
			.addFields({
				name: "Bot Contributers",
				value: "Carlson(Database Implementer)\t Jack(Database Coder) \t Ken(Initiator) \t\t\t\t\t\t\t\t Yong Xian(Coder) ",
			})
			.setFooter(
				"Why are you reading this?",
				"https://media.discordapp.net/attachments/802119940966449152/802432617005187092/diit.jpg?width=670&height=670",
			);
		message.channel.send(exampleEmbed);
	}
	if (command === "gif") {

		//  > ken
		const userinput = message.content.replace("$gif", "").trim();
		const fuse = new fusejs(dbken.get("gifs").value(), optionsken);
		const closeMatch = fuse.search(userinput); // * Search Engine
		if (closeMatch.length === 0) {
			const sendlocal = new Discord.MessageEmbed({
				title: "Error",
				description: "No matching keywords found",
			});
			sendlocal.setTimestamp();
			message.channel.send(sendlocal);
			return;
		}
		console.log(closeMatch[0].item.link);
		message.channel.send(closeMatch[0].item.link);
	}

	// * V.6.1 changed the message embed to let user know that wednesday, sunday and saturday has no class when user types $timetable wednesday || saturday || sunday
	if (command === "timetable") {
		const userinput = message.content
			.replace("$timetable", "")
			.trim()
			.toLowerCase();
		if (userinput === "" || userinput === "help") {

			// this is when user types $timetable or $timetable help then it will print a syntax to guide them for usage
			const embed = new Discord.MessageEmbed({
				title: "How To Use $timetable",
				description:
					"Type $timetable [insert a weekday here].\n\n Note that we only have Monday, Tuesday, Thursday and Friday only.",
				footer: {
					text:
						"Don't try to be funny and put a weekend there. I know you want to but don't. It won't do anything.",
				},
			});
			message.channel.send(embed);
		} else if (userinput === "today") {

			// this is if the user types $timetable today
			const datetoday = DateTime.local(); // gets today's date
			const daytoday = datetoday.toFormat("EEEE").toLowerCase(); // changes date to day e.g Wednesday

			if (daytoday === "saturday" || daytoday === "sunday" || daytoday === "wednesday") {
				message.channel.send("We don't have class today.");
			} else {
				const preprocess = Object.entries(dbjack.get(daytoday).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {

					// apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				const rawstring = daytoday + " Schedule\n\n";
				const embed = new Discord.MessageEmbed({

					// for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		} else if (userinput === "tomorrow") {

			// this is if the user types $timetable tomorrow
			const datetomorrow = DateTime.local().plus({ days: 1 }); // gets tomorrow's date
			const daytomorrow = datetomorrow.toFormat("EEEE").toLowerCase(); // changes date to day e.g wednesday
			if (daytomorrow === "saturday" || daytomorrow === "sunday" || daytomorrow ==="wednesday") {
				message.channel.send("We don't have class tomorrow");
			} else {
				const preprocess = Object.entries(dbjack.get(daytomorrow).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {

					// apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				const rawstring = daytomorrow + " Schedule\n\n";
				const embed = new Discord.MessageEmbed({

					// for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		} else if (userinput === "yesterday") {

			// this is if the user types $timetable yesterday
			const dateyesterday = DateTime.local().minus({ days: 1 }); // gets testerday's date
			const dayyesterday = dateyesterday.toFormat("EEEE").toLowerCase(); // changes date to day e.g Wednesday
			if (dayyesterday === "saturday" || dayyesterday === "sunday" || dayyesterday === "wednesday") {
				message.channel.send("We don't have class yesterday");
			} else {
				const preprocess = Object.entries(dbjack.get(dayyesterday).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {

					// apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				const rawstring = dayyesterday + " Schedule\n\n";
				const embed = new Discord.MessageEmbed({

					// for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		}
		else if (userinput === "all") {
			const day = ["monday", "tuesday", "thursday", "friday"]  // array for days

			for (let i = 0; i < day.length; i++) {  // outputs all the objects
				const preprocess = Object.entries(dbjack.get(day[i]).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++){

					// takes out the strings from the array
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				const rawstring = day[i] + " Schedule\n\n";
				const embed = new Discord.MessageEmbed({

					// for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		}


		else if (
			userinput !== "today"
			|| userinput !== ""
			|| userinput !== "help"
			|| userinput !== "yesterday"
			|| userinput !== "tomorrow"
		) {

			// this is if the user types $timetable [weekday]
			const arraychecker = Object.keys(dbjack.getState()); // this checks the user's input to prevent them from typing any other random stuff
			if (!arraychecker.includes(userinput)) {
				message.channel.send("Please check your syntax! (We don't have timetables for Wednesday, Saturday or Sunday!)");
				return;
			}
			const preprocess = Object.entries(dbjack.get(userinput).value()); // if user enters $timetable wednesday this will pull out the wednesday object from database
			let sendcurrent = "\n";
			for (let index = 0; index < preprocess.length; index++) {

				// apphends the stuff in the array to become one big string
				sendcurrent += preprocess[index].toString() + "\n\n";
			}

			const rawstring = userinput + " Schedule\n\n";
			const embed = new Discord.MessageEmbed({
				title: toTitleCase(rawstring),
				description: sendcurrent,
				footer: {
					text: "Good luck for the day!",
				},
			});
			message.channel.send(embed);
		}
	}

	// * This makes the bot output random memes from an array !INCLUDES FUNCTION!
	else if (command === "memes") {
		const items = db.get("meme").value();
		memearray = items[Math.floor(Math.random() * items.length - 1).toString()];
		message.channel.send(memearray);
	}

	if (command === "memes") {

		// > jack
		const items = dbjack.get("meme").value();
		memearray = items[Math.floor(Math.random() * items.length - 1).toString()];
		message.channel.send(memearray);
	}
	if (command === "debug") {

		// * enable debug feature
		const userinput = message.content.replace("$debug", "").trim();
		if (userinput === 1) {
			const embed = new Discord.MessageEmbed({
				description: "Debug Enabled",
				footer: {
					text: message.author.username,
				},
			});
			embed.setTimestamp();
			verbosedebug = 1;
			message.channel.send(embed);
		} else if (userinput === 0) {
			const embed = new Discord.MessageEmbed({
				description: "Debug Disabled",
				footer: {
					text: message.author.username,
				},
			});
			embed.setTimestamp();
			verbosedebug = 0;
			message.channel.send(embed);
		} else {
			const embed = new Discord.MessageEmbed({
				description: "err",
				footer: {
					text: message.author.username,
				},
			});
			embed.setTimestamp();
			message.channel.send(embed);
		}
	}
	if (command === "userinfo") {

		// * Verbose dump of the user info given
		if (verbosedebug === 0) {
			return;
		}
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		const guild = client.guilds.cache.get(message.guild.id);
		const users = message.mentions.users.first() || message.author;
		console.log(users.username);
		guild.members
			.fetch({
				query: users.username,
				limit: 1,
				force: true,
				withPresences: true,
			})
			.then((h) => {
				const addone
					= JSON.stringify(h) + users.username + users.discriminator;
				console.log(addone);
				message.channel.send(addone.toString());
			})
			.catch(console.error);
	}
	if (command === "events") {

		// this displays upcoming events
		dbjack.read();
		const x = dbjack.get("events").value(); // refers to the events array
		for (let i = 0; i < x.length; i++) {

			// this loop is to call out all the objects in the events array
			const s = x[i].date; // gets the time out from database
			const luxonformat = DateTime.fromISO(s); // processes time to luxon
			const now = DateTime.local(); // gets local time
			const difference = luxonformat.diff(now, [
				"days",
				"hours",
				"minutes",
				"seconds",
			]); // requests what type of time info
			const differenceobject = difference.toObject(); // this is needed to change it to an object
			const subjecttitle = dbjack.get("events").value()[i].event; // subjecttitle refers to the event section in the events array in database
			const embed = new Discord.MessageEmbed({
				title: "Events",
				footer: {
					text: "This is a countdown timer. Take note of the date.",
				},
			});
			embed.addFields(
				{
					name: subjecttitle,
					value: "(" + luxonformat.toISODate() + ")\n",
				}, // Using the add fields code thing to adjust the output of embed message
				{ name: "Days", value: differenceobject.days },
				{ name: "Hours", value: differenceobject.hours },
				{ name: "Minutes", value: differenceobject.minutes },
				{ name: "Seconds", value: differenceobject.seconds },
			);
			message.channel.send(embed); // outputs the entire embed
		}
	}

	if (command === "voteinit") {
		const userinput = message.content.replace("$voteinit", "").trim();
		console.log(userinput);
		let jsonnify;
		try {
			jsonnify = JSON.parse(userinput);
			if (typeof jsonnify.time !== "number") {
				throw "NaN at position: Time";
			}
		} catch (error) {
			const errsend = new Discord.MessageEmbed({
				title: "Error",
				description: "Parameters Incorrect",
				color: "RED",
				footer: {
					text: "votesys",
				},
			});
			errsend.setTimestamp();
			message.channel.send(errsend);
			console.log(error);
			return;
		}
		pollEmbed(message, jsonnify.title, jsonnify.options, jsonnify.time);
	}
	if (command === "vote") {
		const voteemebed = new Discord.MessageEmbed({
			title: "Voting System Docs",
			description:
				"The parameters are as follows: \n\n "
				+ "`$voteinit {\"title\" : \"YourTitleHere\", \"options\" : [\"option 1\", \"option 2\"], \"time\" : 0}` \n\n "
				+ "Options is any valid string or integer array. Up to 10 elements are allowed\n"
				+ "Time is any valid integer, unit is in seconds, optional parameter, default value is 0\n\n"
				+ "Use command above, replace the parameters,to start the vote",
			color: "GREEN",
			footer: {
				text: "You can copy and paste the code for faster poll creation",
			},
		});
		message.channel.send(voteemebed);
	}
	if (command === "ttt") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		new TicTacToe(
			{
				language: "en",
				command: "!ttt",
			},
			client,
		);
		const tttembed = new Discord.MessageEmbed({
			title: "TicTacToe successfully initalized",
			description:
				"Play TicTacToe with the following command: \n "
				+ "`!ttt @player` \n\n"
				+ "if `@player` is not provided, AI will be your opponent",
			footer: {
				text: "Class Instantiated",
			},
			color: "GREEN",
		});
		tttembed.setTimestamp();
		message.channel.send(tttembed);
	}
	if (message.content.startsWith(prefix + "avatar")) {

		// * display avatar
		const user = message.mentions.users.first() || message.author;
		const avatarEmbed = new Discord.MessageEmbed({
			title: user.username,
		});
		avatarEmbed.setImage(user.displayAvatarURL());
		message.channel.send(avatarEmbed);
	}

	if (command === "profile") {

		// get the args that the user give
		const userinput = message.content.replace("$profile", "").trim();

		// load the profiles in
		const fuse = new fusejs(dbken.get("profiles").write(), options);
		const closeMatch = fuse.search(userinput);

		const selectedStuff = closeMatch.length === 0 ? undefined : closeMatch[0].item

		const buildMessage = new Discord.MessageEmbed()
			.setTitle(toTitleCase(selectedStuff.Name))
			.addFields(selectedStuff.fields)
			.setDescription(selectedStuff.Description)
			.setThumbnail(selectedStuff.Thumbnail)

		message.channel.send(buildMessage);
	}
});

// > External Functions
function query(input) {

	// * Carlson's Query System
	const fuse = new fusejs(db.get("quotes").write(), options);
	const closeMatch = fuse.search(input);
	if (closeMatch.length === 0) {
		return ["No user found", "", "NULL"];
	}

	// console.log(closeMatch);
	const randgen
		= closeMatch[0].item.Quotes[
			parseInt(Math.random() * closeMatch[0].item.Quotes.length, 10)
		];
	const pic
		= closeMatch[0].item.img[
			parseInt(Math.random() * closeMatch[0].item.img.length, 10)
		];

	// console.log(result);
	return [closeMatch[0].item.Name, randgen, closeMatch[0].score, pic];
}

function toTitleCase(str) {

	// * Title case for schedule
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

// > Once the bot is ready set discord status and log in console
client.once("ready", () => {
	console.log("thread_main ready");
});

// > API key to login to start the bot
// ! DO NOT LEAK THIS KEY AS IT ALLOWS THE BOT TO DO ANYTHING
client.login(token);
