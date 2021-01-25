const Discord = require("discord.js");
const fusejs = require("fuse.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// > DB Connection on Carlson
const adapter = new FileSync("db.json");
const db = low(adapter);

// > DB Connection on Jack

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
}
const optionsken = {
    // * Ken param for search system
    includeScore: true,
    // Search in `author` and in `tags` array
    keys: ['tags']
}

// > Important Variables
let names = [];
let dbinput = [];
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
			for (
				let index = 0;
				index < db.get("quotes").write().length;
				index++
			) {
				//console.log(quotes[index].Name)
				names.push(db.get("quotes").write()[index].Name);
			}
			//console.log(names[parseInt(Math.random() * names.length)])
			console.log("branch1");
			while (true) {
				localoutput = query(
					names[parseInt(Math.random() * names.length)]
				);
				if (typeof localoutput[1] !== "undefined") {
					break;
				}
				localoutput = [];
			}
			output = localoutput;
		} else {
			console.log("branch2");
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
					"\n Confidence: " +
					output[2],
			},
		});
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
			dbinput.push(m.content);
		});

		collector.on("end", (m) => {
			let embedcomfirm = new Discord.MessageEmbed({
				title: "Confirm?",
				description:
					"Name : " + dbinput[0] + "\n" + "Quote: " + dbinput[1],
				color: "FF9900",
				footer: {
					text:
						"Are you sure to execute command? Type [ cancel ] to abort",
				},
			});
			message.channel.send(embedcomfirm);

			const filter = (comfirm) => comfirm.content;
			const comfirmcollector = message.channel.createMessageCollector(
				filter,
				{
					max: 1,
				}
			);
			comfirmcollector.on("collect", (comfirm) => {
				if (comfirm.content == "accept" || message.author.bot) {
					let namesarray = db.get("quotes").map("Name").value();
					if (!namesarray.includes(dbinput[0])) {
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
				//message.channel.send("Execution done")
				dbinput = [];
			});
		});
	}
	if (command === "dbview") {
		message.channel.send(JSON.stringify(db.getState()).substring(0, 1999));
		message.channel.send(
			JSON.stringify(db.getState()).substring(2000, 3999)
		);
	}
	if (command === "dbdelete") {
		let userinputpre = message.content.replace("$dbdelete", "").trim();
		let userinputSplit = userinputpre.split(",");
		console.log(userinputSplit);
		// * checking begins here
		let allnames = db.get("quotes").map("Name").value();
		if (!allnames.includes(userinputSplit[0])) {
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
		let updatedquotes = localquotes.remove(userinputSplit[1]);
		db.get("quotes")
			.find({ Name: userinputSplit[0] })
			.assign({ Quotes: updatedquotes })
			.write();
		let messagelocal = new Discord.MessageEmbed({
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
		});
	}
	if (command === "ping") {
		let pingmessage = new Discord.MessageEmbed({
			description: `API Latency is ${Math.round(client.ws.ping)}ms`,
		});
		pingmessage.setTimestamp();
		message.channel.send(pingmessage);
	}
	if (command === "help") {
        // * This is an embed list of nevigator for user to guide the user to type command they want. You can take this for now
        // > Ken
		// > ken
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
					"timetable - To display current timetable"
			);
		message.channel.send(example);
	}
	if (command === "timetable") {
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
				{ name: "Server Rules", value: "rules: " },
				{ name: "\u200B", value: "\u200B" },
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
				value:
					"Carlson(Database Implementer)\t Jack(Database Coder) \t Ken(Initiator) \t\t\t\t\t\t\t\t Yong Xian(Coder) ",
			})
			.setFooter(
				"Why are you reading this?",
				"https://media.discordapp.net/attachments/802119940966449152/802432617005187092/diit.jpg?width=670&height=670"
			);
		message.channel.send(exampleEmbed);
    }
    if(command === "gif") {
        let userinput = message.content.replace("$gif" ,"").trim()
        let fuse = new fusejs(dbken.get("gifs").value(), optionsken)
        let closeMatch = fuse.search(userinput)
        console.log(closeMatch[0].item.link)
        message.channel.send(closeMatch[0].item.link)
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
	console.log(closeMatch);
	let randgen =
		closeMatch[0].item.Quotes[
			parseInt(Math.random() * closeMatch[0].item.Quotes.length)
		];
	let result = [closeMatch[0].item.Name, randgen, closeMatch[0].score];
	console.log(result);
	return result;
}

// > Once the bot is ready set discord status and log in console
client.once("ready", () => {
	client.user.setPresence({
		status: "dnd",
		activity: {
			name: "dead",
			type: "STREAMING",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		},
	});
	console.log("The International of DIIT Congress is online.");
});

// > API key to login to start the bot
// ! DO NOT LEAK THIS KEY AS IT ALLOWS THE BOT TO DO ANYTHING
client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
