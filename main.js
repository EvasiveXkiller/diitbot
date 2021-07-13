const Discord = require("discord.js");
const fusejs = require("fuse.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { DateTime } = require("luxon");
const pollEmbed = require("discord.js-poll-embed");
const TicTacToe = require("discord-tictactoe");

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
let names = [];
let dbinput = [];
let verbosedebug = 0;

// > Prefix that triggers the bot
const prefix = "$";

// > Prototype for smart remove on array
Array.prototype.remove = function () {
	var what,
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
	db.read(); // * master read on carlson branch

	if (!message.content.startsWith(prefix) || message.author.bot) {
		// * Breaks if the input is not valid
		return;
	}
	let args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
	let command = args.shift().toLowerCase(); // * Processed command that ready to be read by switch cases

	if (command === "iconic") {
		// * iconic quotes system using nosql and fusejs, fully implemented
		let output, localoutput;

		let userinput = message.content.replace("iconic", "").trim();
		// * random color generator
		let randomColor = Math.floor(Math.random() * 16777215).toString(16);
		let date = new Date();
		if (message.content == "$iconic") {
			// * if user din give input
			for (
				let index = 0;
				index < db.get("quotes").write().length;
				index++
			) {
				//console.log(quotes[index].Name)
				names.push(db.get("quotes").write()[index].Name); // * get all names for randomizer
			}
			//console.log(names[parseInt(Math.random() * names.length)])
			//console.log("branch1");
			while (true) {
				localoutput = query(
					names[parseInt(Math.random() * names.length)]
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
			//console.log("branch2");
			localoutput = query(userinput);
			if (typeof localoutput[1] === "undefined") {
				localoutput[1] = "[ Empty ]";
			}
			output = localoutput;
		}
		let embed = new Discord.MessageEmbed({
			title: output[1],
			description: "--*" + output[0] + "*",
			color: randomColor.toUpperCase(), //colors[getRandomArbitrary(0,99)],
			url: "https://www.youtube.com/watch?v=cvh0nX08nRw",
			footer: {
				text:
					"The International Server " +
					date.getFullYear() +
					"\nConfidence: " +
					output[2],
			},
		});
		embed.setThumbnail(output[3]);
		message.channel.send(embed);
	}
	if (command === "dbinsert") {
		//let userinput = message.content.replace("iconic" ,"").trim()
		let embedinstruction = new Discord.MessageEmbed({
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
			if (m.content == "$dbinsert") {
				message.channel.send(
					"In Progress. Cannot start another instance!"
				);
				return;
			}
			console.log(m.content);
			dbinput.push(m.content); // * push into array
		});

		collector.on("end", () => {
			// * Comfirm on insert into database
			let embedcomfirm = new Discord.MessageEmbed({
				title: "Confirm?",
				description:
					"Name : " + dbinput[0] + "\n" + "Quote: " + dbinput[1],
				color: "FF9900",
				footer: {
					text: "Are you sure to execute command? Type [ cancel ] to abort",
				},
			});
			message.channel.send(embedcomfirm);

			const filter = (comfirm) => comfirm.content;
			const comfirmcollector = message.channel.createMessageCollector(
				// * Collector for accept
				filter,
				{
					max: 1,
				}
			);
			comfirmcollector.on("collect", (comfirm) => {
				if (comfirm.content == "accept" || message.author.bot) {
					let namesarray = db.get("quotes").map("Name").value();
					if (!namesarray.includes(dbinput[0])) {
						// * if name is not found in database
						let embed = new Discord.MessageEmbed({
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
						let edit = db
							.get("quotes")
							.find({ Name: dbinput[0] })
							.value();
						let newdata = [...edit.Quotes];
						newdata.push(dbinput[1]);
						db.get("quotes")
							.find({ Name: dbinput[0] })
							.assign({ Quotes: newdata })
							.write();
					}
					let embed = new Discord.MessageEmbed({
						// * Success message
						title: "Commit Successful",
						description:
							"Summary\nName : " +
							dbinput[0] +
							"\nData : " +
							dbinput[1],
						color: "00FF00",
						footer: {
							text: "nosql",
						},
					});
					embed.setTimestamp();
					message.channel.send(embed);
				} else {
					// * failure message
					let embed = new Discord.MessageEmbed({
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
				//message.channel.send("Execution done")
				dbinput = [];
			});
		});
	}
	if (command === "dbview") {
		// * raw dump of database into chat
		if (verbosedebug == 0) {
			return;
		}
		message.channel.send(JSON.stringify(db.getState()).substring(0, 1999));
		message.channel.send(
			JSON.stringify(db.getState()).substring(2000, 3999)
		);
	}
	if (command === "dbdelete") {
		// * Delete data from database
		if (verbosedebug == 0) {
			return;
		}
		let userinputpre = message.content.replace("$dbdelete", "").trim();
		let userinputSplit = userinputpre.split(",");
		console.log(userinputSplit);
		// * checking begins here
		let allnames = db.get("quotes").map("Name").value();
		if (!allnames.includes(userinputSplit[0])) {
			// * Name is not found in the database
			let messagelocal = new Discord.MessageEmbed({
				title: "Commit Error",
				description:
					userinputSplit[0] +
					" is not a valid user in the database\nPlease check the syntax",
				color: "FF0000",
				footer: {
					text: "nosql",
				},
			});
			messagelocal.setTimestamp();
			message.channel.send(messagelocal);
			return;
		}
		let localquotes = db
			.get("quotes")
			.find({ Name: userinputSplit[0] })
			.get("Quotes")
			.value();
		if (!localquotes.includes(userinputSplit[1])) {
			// * if quote is not found in database
			let messagelocal = new Discord.MessageEmbed({
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
		let updatedquotes = localquotes.remove(userinputSplit[1]); // * if all checks passes
		db.get("quotes")
			.find({ Name: userinputSplit[0] })
			.assign({ Quotes: updatedquotes })
			.write();
		let messagelocal = new Discord.MessageEmbed({
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
		let mods = ["EvasiveXkiller", "ikenot", "Araric"];
		if (!mods.includes(message.author.username)) {
			message.channel.send(
				"You dont have enough permissions to stop the bot"
			);
			return;
		}
		let offlinemessage = new Discord.MessageEmbed({
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
			let resetstart = new Discord.MessageEmbed({
				description: "Resetting...",
				color: "RED",
				footer: {
					text: "Please allow up to 2 mins for all threads to start",
				},
			});
			resetstart.setTimestamp();
			message.channel.send(resetstart).then(() => {
				process.send(
					new respond("reset", { author: message.author.id })
				);
			});
		} else {
			let reseterr = new Discord.MessageEmbed({
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
		let pingmessage = new Discord.MessageEmbed({
			description: `API Latency is ${Math.round(
				client.ws.ping
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
				"💠\t " +
				"description - To display server description and bot credits \n" +
				"📚\t " +
				"todayisday - To display today schedule\n" +
				"😏\t " +
				"gif - To display certain member gif \n" +
				"💬\t " +
				"iconic - To display iconic quotes among the members \n" +
				"👥\t " +
				"profile - To display certain DIIT member`s profile \n" +
				"📊\t " +
				"timetable - To display current timetable \n" +
				"For syntax please refer to our [GitHub](https://github.com/EvasiveXkiller/diitbot-public/blob/main/README.md) page"
			);
		message.channel.send(example);
	}
	if (command === "timetablepic") {
		// * This is to display timetable schedule for semester three. It's done for the code.
		// > Ken
		message.channel.send("Here you go, " + `${message.author},`);
		message.channel.send(
			"https://cdn.discordapp.com/attachments/786216853848588309/794864558706786306/image0.png"
		);
	}
	if (command === "description") {
		// * This is an embed description to let the user read our server description and bot credits. This is okay for now.
		// > Ken
		const exampleEmbed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("The DIIT Description Board")
			.setDescription(
				"Welcome to Diit Community where our collaborative work will be share together and we are pleased to welcome you into the association. As part of our team is the part of our journey. Let`s treasure the moments we spend together. "
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
				}
			)
			.addField(
				"Rule 3",
				"This bot will active during the class period and will be still active in certain periods and not available during midnight",
				true
			)
			.setThumbnail(
				"https://media.discordapp.net/attachments/802119940966449152/802432617005187092/diit.jpg?width=670&height=670"
			)
			.addFields({
				name: "Bot Contributers",
				value: "Carlson(Database Implementer)\t Jack(Database Coder) \t Ken(Initiator) \t\t\t\t\t\t\t\t Yong Xian(Coder) ",
			})
			.setFooter(
				"Why are you reading this?",
				"https://media.discordapp.net/attachments/802119940966449152/802432617005187092/diit.jpg?width=670&height=670"
			);
		message.channel.send(exampleEmbed);
	}
	if (command === "gif") {
		//  > ken
		let userinput = message.content.replace("$gif", "").trim();
		let fuse = new fusejs(dbken.get("gifs").value(), optionsken);
		let closeMatch = fuse.search(userinput); // * Search Engine
		if (closeMatch.length == 0) {
			let sendlocal = new Discord.MessageEmbed({
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
	// * V.5 added 1 new block of code that is for the $timetable all which outputs all of the timetables but in 5 separate messages
	if (command === "timetable") {
		let userinput = message.content
			.replace("$timetable", "")
			.trim()
			.toLowerCase();
		if (userinput === "" || userinput === "help") {
			//this is when user types $timetable or $timetable help then it will print a syntax to guide them for usage
			let embed = new Discord.MessageEmbed({
				title: "How To Use $timetable",
				description:
					"Type $timetable [insert a weekday here].\n\n Note that we only have Monday-Friday",
				footer: {
					text: "Don't try to be funny and put a weekend there. I know you want to but don't. It won't do anything.",
				},
			});
			message.channel.send(embed);
		} else if (userinput === "today") {
			// this is if the user types $timetable today
			let datetoday = DateTime.local(); // gets today's date
			let daytoday = datetoday.toFormat("EEEE").toLowerCase(); //changes date to day e.g Wednesday
			//console.log(typeof daytoday);
			if (daytoday === "saturday" || daytoday === "sunday") {
				message.channel.send("We don't have class on weekends!");
			} else {
				let preprocess = Object.entries(dbjack.get(daytoday).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {
					//apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				let rawstring = daytoday + " Schedule\n\n";
				let embed = new Discord.MessageEmbed({
					//for the discord embed message
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
			let datetomorrow = DateTime.local().plus({ days: 1 }); // gets tomorrow's date
			let daytomorrow = datetomorrow.toFormat("EEEE").toLowerCase(); //changes date to day e.g Wednesday
			if (daytomorrow === "saturday" || daytomorrow === "sunday") {
				message.channel.send("We don't have class on weekends!");
			} else {
				let preprocess = Object.entries(
					dbjack.get(daytomorrow).value()
				);
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {
					//apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				let rawstring = daytomorrow + " Schedule\n\n";
				let embed = new Discord.MessageEmbed({
					//for the discord embed message
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
			let dateyesterday = DateTime.local().minus({ days: 1 }); // gets testerday's date
			let dayyesterday = dateyesterday.toFormat("EEEE").toLowerCase(); //changes date to day e.g Wednesday
			if (dayyesterday === "saturday" || dayyesterday === "sunday") {
				message.channel.send("We don't have class on weekends!");
			} else {
				let preprocess = Object.entries(
					dbjack.get(dayyesterday).value()
				);
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {
					//apphends the stuff in the array to become one big string
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				let rawstring = dayyesterday + " Schedule\n\n";
				let embed = new Discord.MessageEmbed({
					//for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		} else if (userinput === "all") {
			let day = ["monday", "tuesday", "wednesday", "thursday", "friday"]; //array for days

			for (let i = 0; i < day.length; i++) {
				//outputs all the objects
				let preprocess = Object.entries(dbjack.get(day[i]).value());
				let sendcurrent = "\n";

				for (let index = 0; index < preprocess.length; index++) {
					//takes out the strings from the array
					sendcurrent += preprocess[index].toString() + "\n\n";
				}

				let rawstring = day[i] + " Schedule\n\n";
				let embed = new Discord.MessageEmbed({
					//for the discord embed message
					title: toTitleCase(rawstring),
					description: sendcurrent,
					footer: {
						text: "Good luck for the day!",
					},
				});
				message.channel.send(embed);
			}
		} else if (
			userinput !== "today" ||
			userinput !== "" ||
			userinput !== "help"
		) {
			//this is if the user types $timetable [weekday]
			let arraychecker = Object.keys(dbjack.getState()); //this checks the user's input to prevent them from typing any other random stuff
			if (!arraychecker.includes(userinput)) {
				message.channel.send(
					"Please check your syntax! (We don't have timetables for Saturday or Sunday!)"
				);
				return;
			}
			let preprocess = Object.entries(dbjack.get(userinput).value()); //if user enters $timetable wednesday this will pull out the wednesday object from database
			let sendcurrent = "\n";
			for (let index = 0; index < preprocess.length; index++) {
				//apphends the stuff in the array to become one big string
				sendcurrent += preprocess[index].toString() + "\n\n";
			}

			let rawstring = userinput + " Schedule\n\n";
			let embed = new Discord.MessageEmbed({
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
		let items = db.get("meme").value();
		var memearray =
			items[Math.floor(Math.random() * items.length - 1).toString()];
		message.channel.send(memearray);
	}

	if (command === "memes") {
		// > jack
		let items = dbjack.get("meme").value();
		var memearray =
			items[Math.floor(Math.random() * items.length - 1).toString()];
		message.channel.send(memearray);
	}
	if (command === "debug") {
		// * enable debug feature
		let userinput = message.content.replace("$debug", "").trim();
		if (userinput == 1) {
			let embed = new Discord.MessageEmbed({
				description: "Debug Enabled",
				footer: {
					text: message.author.username,
				},
			});
			embed.setTimestamp();
			verbosedebug = 1;
			message.channel.send(embed);
		} else if (userinput == 0) {
			let embed = new Discord.MessageEmbed({
				description: "Debug Disabled",
				footer: {
					text: message.author.username,
				},
			});
			embed.setTimestamp();
			verbosedebug = 0;
			message.channel.send(embed);
		} else {
			let embed = new Discord.MessageEmbed({
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
		if (verbosedebug == 0) {
			return;
		}
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		let guild = client.guilds.cache.get(message.guild.id);
		let users = message.mentions.users.first() || message.author;
		console.log(users.username);
		guild.members
			.fetch({
				query: users.username,
				limit: 1,
				force: true,
				withPresences: true,
			})
			.then((h) => {
				let addone =
					JSON.stringify(h) + users.username + users.discriminator;
				console.log(addone);
				message.channel.send(addone.toString());
			})
			.catch(console.error);
	}
	if (command === "events") {
		//this displays upcoming events
		dbjack.read();
		let x = dbjack.get("events").value(); //refers to the events array
		for (let i = 0; i < x.length; i++) {
			//this loop is to call out all the objects in the events array
			let s = x[i].date; //gets the time out from database
			let luxonformat = DateTime.fromISO(s); //processes time to luxon
			let now = DateTime.local(); //gets local time
			let difference = luxonformat.diff(now, [
				"days",
				"hours",
				"minutes",
				"seconds",
			]); //requests what type of time info
			let differenceobject = difference.toObject(); //this is needed to change it to an object
			let subjecttitle = dbjack.get("events").value()[i].event; //subjecttitle refers to the event section in the events array in database
			let embed = new Discord.MessageEmbed({
				title: "Events",
				footer: {
					text: "This is a countdown timer. Take note of the date.",
				},
			});
			embed.addFields(
				{
					name: subjecttitle,
					value: "(" + luxonformat.toISODate() + ")\n",
				}, //Using the add fields code thing to adjust the output of embed message
				{ name: "Days", value: differenceobject.days },
				{ name: "Hours", value: differenceobject.hours },
				{ name: "Minutes", value: differenceobject.minutes },
				{ name: "Seconds", value: differenceobject.seconds }
			);
			message.channel.send(embed); //outputs the entire embed
		}
	}
	if (command === "replacements") {
		let x = dbjack.get("reminder").value(); //refers to the reminder array
		for (let i = 0; i < x.length; i++) {
			//this loop is to call out all the objects in the reminder array
			let s = x[i].date; //gets the time out from database
			let luxonformat = DateTime.fromISO(s); //processes time to luxon
			let now = DateTime.local(); //gets local time
			let difference = luxonformat.diff(now, [
				"days",
				"hours",
				"minutes",
				"seconds",
			]); //requests what type of time info
			let differenceobject = difference.toObject(); //this is needed to change it to an object
			let subjecttitle = dbjack.get("reminder").value()[i].event; //subjecttitle refers to the event section in the reminder array in database
			let embed = new Discord.MessageEmbed({
				title: "Replacement Classes",
				footer: {
					text: "This is a countdown timer. Take note of the date.",
				},
			});
			embed.addFields(
				{
					name: subjecttitle,
					value:
						"(" + luxonformat.toISODate() + ")\n Replacement Class",
				}, //Using the add fields code thing to adjust the output of embed message
				{ name: "Days", value: differenceobject.days },
				{ name: "Hours", value: differenceobject.hours },
				{ name: "Minutes", value: differenceobject.minutes },
				{ name: "Seconds", value: differenceobject.seconds }
			);
			message.channel.send(embed); //outputs the entire embed
		}
	}
	if (command === "eventinsert") {
		dbjack.read();
		let userinputpre = message.content.replace("$eventinsert", "").trim();
		let userinputSplit = userinputpre.split(",");
		console.log(userinputSplit);
		// * checking begins here
		let checkDate = DateTime.fromISO(userinputSplit[1]);
		if (!checkDate.isValid) {
			let dateinvalidembed = new Discord.MessageEmbed({
				title: "Date Invalid",
				description: "Type in the date properly",
				footer: {
					text: "nosql",
				},
			});
			message.channel.send(dateinvalidembed);
			return;
		}
		let comfirmembed = new Discord.MessageEmbed({
			title: "Comfirm?",
			description:
				"Event : " +
				userinputSplit[0] +
				"\n" +
				"Time: " +
				checkDate.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS),
			color: "FF9900",
			footer: {
				text: "Are you sure to execute command? Type [ cancel ] to abort",
			},
		});
		message.channel.send(comfirmembed).then(() => {
			const filter = (comfirm) => comfirm.content;
			const comfirmcollector = message.channel.createMessageCollector(
				filter,
				{
					max: 1,
				}
			);
			comfirmcollector.on("collect", (comfirm) => {
				if (comfirm.content == "accept" || message.author.bot) {
					dbjack
						.get("events")
						.push({
							event: userinputSplit[0],
							date: userinputSplit[1],
						})
						.write();
					let embed = new Discord.MessageEmbed({
						// * Success message
						title: "Commit Successful",
						description:
							"Summary\nEvent : " +
							userinputSplit[0] +
							"\nTime : " +
							checkDate.toLocaleString(
								DateTime.DATETIME_FULL_WITH_SECONDS
							),
						color: "00FF00",
						footer: {
							text: "nosql",
						},
					});
					embed.setTimestamp();
					message.channel.send(embed);
				} else {
					let embed = new Discord.MessageEmbed({
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
		});
	}
	if (command === "voteinit") {
		let userinput = message.content.replace("$voteinit", "").trim();
		console.log(userinput);
		let jsonnify;
		try {
			jsonnify = JSON.parse(userinput);
			if (typeof jsonnify.time != "number") {
				throw "NaN at position: Time";
			}
		} catch (error) {
			let errsend = new Discord.MessageEmbed({
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
		let voteemebed = new Discord.MessageEmbed({
			title: "Voting System Docs",
			description:
				"The parameters are as follows: \n\n " +
				'`$voteinit {"title" : "YourTitleHere", "options" : ["option 1", "option 2"], "time" : 0}` \n\n ' +
				"Options is any valid string or integer array. Up to 10 elements are allowed\n" +
				"Time is any valid integer, unit is in seconds, optional parameter, default value is 0\n\n" +
				"Use command above, replace the parameters,to start the vote",
			color: "GREEN",
			footer: {
				text: "You can copy and paste the code for faster poll creation",
			},
		});
		message.channel.send(voteemebed);
	}
	if (command === "ttt") {
		if (message.channel.type == "dm" || message.channel.type == "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		new TicTacToe(
			{
				language: "en",
				command: "!ttt",
			},
			client
		);
		let tttembed = new Discord.MessageEmbed({
			title: "TicTacToe successfully initalized",
			description:
				"Play TicTacToe with the following command: \n " +
				"`!ttt @player` \n\n" +
				"if `@player` is not provided, AI will be your opponent",
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
	if (message.content.startsWith(`${prefix}profile ken`)) {
		// To display ken profile. It works . 1
		const profile = new Discord.MessageEmbed()
			.setTitle("Ken`s Profile")
			.setDescription("I like icecream and waffles")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/kenn_tong/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/tong.kensoon)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "ken_372",
					inline: true,
				},
				{
					name: "\t<:tenor:803124557450838067> \t",
					value: "[Tenor](https://tenor.com/users/ikennot)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803162484894728202/ken_2.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile jack`)) {
		// To display jack profile. It works . 2
		const profile = new Discord.MessageEmbed()
			.setTitle("Jack`s Profile")
			.setDescription(
				"Zhou San! This is Jack and I am looking forward to what I can learn with yall! Hope we could share information and learn from each other and grow at the same time! Also i had cut my hair already so that picture of me at the right side is from last year, outdated lol. Anyways, I have alot of stuff that i dont know like literally alot. If you dont know what I mean, when you know me a little bit better then you might understand. See you next time! Here goes to college."
			)
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/jack_tok_/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/jack.tok.921)",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "OptimalLego",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/optimallego)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/profiles/76561198129537202)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803165371758280705/jack_profile.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile yongxian`)) {
		// To display yx profile. It works . 3
		const profile = new Discord.MessageEmbed()
			.setTitle("Yong Xian`s Profile")
			.setDescription("I’m straight")
			.setColor("RANDOM")
			.addFields({
				name: "\t<:insta:803124128194101248>  \t",
				value: "[Instagram](https://www.instagram.com/_yong_xian_/?hl=en)",
				inline: true,
			})
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803170680643256320/yx_profile.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile carlson`)) {
		// To display carlson profile. It works . 4
		const profile = new Discord.MessageEmbed()
			.setTitle("notcarlson`s Profile")
			.setDescription("Time lost is never found again")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/carlson.X.Destroyed)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/carlson.x.destroyed/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/id/theuniquetechnix)",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/evasivexkiller)",
					inline: true,
				},
				{
					name: "\t<:youtube:803173627759296552> \t",
					value: "[YouTube](https://www.youtube.com/channel/UCF_5rEee3uoEF_MVNaMeNAA)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803174986465935380/carlson_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile zhenyick`)) {
		// To display zy profile. It works . 5
		const profile = new Discord.MessageEmbed()
			.setTitle("Zhen Yick`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/zhenyick)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "leezhenyick",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/profiles/76561198349598005)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803251771702116352/zhen_yick_profile.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile junkeat`)) {
		// To display junkeat profile. It works . 6
		const profile = new Discord.MessageEmbed()
			.setTitle("jun`s Profile")
			.setDescription(
				"(╭☞ ͡° ͜ʖ ͡° ) ╭☞ ｄｏｎｔ　ｔａｌｋｉｎｇ　ｐｌｅａｓｅ (╭☞ ͡° ͜ʖ ͡° )╭☞"
			)
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/jun.karls/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/profiles/76561198253612891)",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/tri993ry)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803256064438698074/jun_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile huishan`)) {
		// To display huishan profile. It works . 7
		const profile = new Discord.MessageEmbed()
			.setTitle("shanshan`s Profile")
			.setDescription("I am your Ba Ba.")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/momo.lee.754365)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/iliketoeatdou/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "leehuish4n",
					inline: true,
				},
				{
					name: "\t<:youtube:803173627759296552> \t",
					value: "[YouTube](https://www.youtube.com/channel/UCeLZJqAhND7_pW7wEcLWLiA)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803261111355834418/shan_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile kath`)) {
		// To display kath profile. It works . 8
		const profile = new Discord.MessageEmbed()
			.setTitle("kath kath`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/katkatweerose.tien)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/katherinetienn/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "kttt71",
					inline: true,
				},
				{
					name: "\t<:twitter:803263211586715689> \t",
					value: "[Twitter](https://twitter.com/tien_katherine)",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "katherinetien",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803264878159593472/kath_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile michelle`)) {
		// To display michelle profile. It works . 9
		const profile = new Discord.MessageEmbed()
			.setTitle("Michelle`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/ngmeiling.michelle)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/_michelle_ng/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "michelleng1030",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "michelleng1030",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803270178958999562/michelle_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile ivan`)) {
		// To display ivan profile. It works . 10
		const profile = new Discord.MessageEmbed()
			.setTitle("Ivan`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/profile.php?id=100013145261662)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/ivanwoy/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "ivanwoy",
					inline: true,
				},
				{
					name: "\t<:twitter:803263211586715689> \t",
					value: "[Twitter](https://twitter.com/ivanwoy)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803272091164082276/ivan_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile pavan`)) {
		// To display pavan profile. It works . 11
		const profile = new Discord.MessageEmbed()
			.setTitle("Pavan`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/pavands1)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/pavan_jassal/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "pavan_jassal",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/informal_killer/about)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803273954990489620/pavan_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile sheila`)) {
		// To display sheila profile. It works . 12
		const profile = new Discord.MessageEmbed()
			.setTitle("Sheila (Dragon King)`s Profile")
			.setDescription("Angel & Devil ")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/pandalung.sheila)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/sheila__1017/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "sheila001017",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "sheila001017",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "sheila001017",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803276742604095499/sheila.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile chanee`)) {
		// To display chanee profile. It works . 13
		const profile = new Discord.MessageEmbed()
			.setTitle("african fish `s Profile")
			.setDescription("handsome HAHAH JKJK")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/chanee.1008)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/wchanee_/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "chanee_1008",
					inline: true,
				},
				{
					name: "\t<:twitter:803263211586715689> \t",
					value: "[Twitter](https://twitter.com/ChanEe1008)",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "woochanee",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "Africaxfisherman",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803279883409162240/chanee_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile yijie`)) {
		// To display yijie profile. It works . 14
		const profile = new Discord.MessageEmbed()
			.setTitle("Yi-Jie`s Profile")
			.setDescription(
				"A weeb who keeps watching Anime and listening to Japanese Songs everyday"
			)
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/yijie.ng99)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/yi_jiez/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/id/0909YJ)",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/juzdaydream)",
					inline: true,
				},
				{
					name: "\t<:lollogo:803286278279397456> \t",
					value: "JîE",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803287338926735400/jie_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile yip`)) {
		// To display yip profile. It works . 15
		const profile = new Discord.MessageEmbed()
			.setTitle("Yip `s Profile")
			.setDescription("life is dynamite ")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/Y1PH4YD3N)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/khowe__01/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "haydenyip01",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803505394307694592/yip_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile dennis`)) {
		// To display dennis profile. It works . 16
		const profile = new Discord.MessageEmbed()
			.setTitle("GuessMe`s Profile")
			.setDescription("having fun is more important than studying")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/dennis.tan.58910)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/dennis_tan31/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "dennis_tan31",
					inline: true,
				},
				{
					name: "\t<:twitter:803263211586715689> \t",
					value: "GuessMe",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "Guess Me",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/profiles/76561198264497133)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803509784414257202/dennis_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile yuki`)) {
		// To display yuki profile. It works . 17
		const profile = new Discord.MessageEmbed()
			.setTitle("yuki`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:facebook:803124115354812438>  \t",
					value: "[Facebook](https://www.facebook.com/yeemun.low.18)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/yukilow0615/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:wechat:803166450973540383> \t",
					value: "yukilow020615",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803511729497178132/yuki_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile xiaowei`)) {
		// To display xiaowei profile. It works . 18
		const profile = new Discord.MessageEmbed()
			.setTitle("xwei`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/chixw_2907/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "xwei2907",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803517213364846652/xiaowei_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile vivien`)) {
		//  To display vivien profile. It works . 19
		const profile = new Discord.MessageEmbed()
			.setTitle("vv`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/vviviennnnn_yaan/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "v.mak",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803518268945596436/vivien_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile victor`)) {
		//  To display victor profile. It works . 20
		const profile = new Discord.MessageEmbed()
			.setTitle("vic`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value: "[Instagram](https://www.instagram.com/victorchung.jpg/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value: "[Steam](https://steamcommunity.com/id/victorchungmp4)",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803522058717626388/victor_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile ryan`)) {
		//  To display ryan profile. It works . 21
		const profile = new Discord.MessageEmbed()
			.setTitle("Ryan`s Profile")
			.setColor("RANDOM")
			.addFields({
				name: "\t<:whatsapp:803523739442348053>  \t",
				value: "+60 10-408 8312",
				inline: true,
			})
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803524706246197288/ryan_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile minon`)) {
		//  To display minon profile. It works . 22
		const profile = new Discord.MessageEmbed()
			.setTitle("Minon`s Profile")
			.setColor("RANDOM")
			.addFields({
				name: "\t<:whatsapp:803523739442348053>  \t",
				value: "+60 18-259 7022",
				inline: true,
			})
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803526943269978142/minon_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile mrtan`)) {
		//  To display mrtan profile. It works . 1
		const profile = new Discord.MessageEmbed()
			.setTitle("Mr tan`s Profile")
			.setDescription("Availability: 8am - 6am")
			.setColor("RANDOM")
			.addFields({
				name: "\t<:whatsapp:803523739442348053>  \t",
				value: "+60 11-1111 9901",
				inline: true,
			})
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803529740240814120/mrtan_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
	if (message.content.startsWith(`${prefix}profile missyy`)) {
		//  To display missyy profile. It works . 1
		const profile = new Discord.MessageEmbed()
			.setTitle("Miss Yi Ying`s Profile")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:whatsapp:803523739442348053>  \t",
					value: "+60 17-716 3866",
					inline: true,
				},
				{
					name: "\t<:outlooklogo:803531951524675625>  \t",
					value: "yiyinglee@sunway.edu.my ",
					inline: true,
				}
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/802119940966449152/803531234637905950/missyy_pro.jpg"
			)
			.setTimestamp();
		message.channel.send(profile);
	}
});

// > External Functions
function query(input) {
	// * Carlson's Query System
	let fuse = new fusejs(db.get("quotes").write(), options);
	let closeMatch = fuse.search(input);
	if (closeMatch.length == 0) {
		return ["No user found", "", "NULL"];
	}
	//console.log(closeMatch);
	let randgen =
		closeMatch[0].item.Quotes[
			parseInt(Math.random() * closeMatch[0].item.Quotes.length)
			];
	let pic =
		closeMatch[0].item.img[
			parseInt(Math.random() * closeMatch[0].item.img.length)
			];
	//console.log(result);
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

// > IPC with parent process
process.on("message", (comm) => {
	if (comm === "memusage") {
		process.send(new respond("memusage", process.memoryUsage()));
	}
	if (comm === "kill") {
		client.channels
			.fetch("755263209824321629", false, true)
			.then((channel) => {
				let offlinemessage = new Discord.MessageEmbed({
					description: "Going Offline Immediately!",
					color: "FF0000",
					footer: {
						text: "Console",
					},
				});
				offlinemessage.setTimestamp();
				channel.send(offlinemessage).then(() => {
					client.destroy();
					setTimeout(() => {
						process.exit();
					}, 1000);
				});
			})
			.catch(console.error);
	}
	if (comm === "userkill") {
		client.destroy();
		setTimeout(() => {
			process.exit();
		}, 5000);
	}
	if (comm === 'shutdown') {
		client.destroy();
		setTimeout(function () {
			process.exit(0)
		}, 1500)
	}
});

// > API key to login to start the bot
// ! DO NOT LEAK THIS KEY AS IT ALLOWS THE BOT TO DO ANYTHING
client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
