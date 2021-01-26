const Discord = require("discord.js");
const fusejs = require("fuse.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

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
		if (verbosedebug == 0) {
			return;
		}
		message.channel.send(JSON.stringify(db.getState()).substring(0, 1999));
		message.channel.send(
			JSON.stringify(db.getState()).substring(2000, 3999)
		);
	}
	if (command === "dbdelete") {
		if (verbosedebug == 0) {
			return;
		}
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
					value:
						"https://github.com/EvasiveXkiller/diitbot-public/blob/main/README.md",
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
				value:
					"Carlson(Database Implementer)\t Jack(Database Coder) \t Ken(Initiator) \t\t\t\t\t\t\t\t Yong Xian(Coder) ",
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
		let closeMatch = fuse.search(userinput);
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
	if (command === "timetable") {
		// > jack
		let userinput = message.content
			.replace("$timetable", "")
			.trim()
			.toLowerCase();
		let arraychecker = Object.keys(dbjack.getState());
		if (!arraychecker.includes(userinput)) {
			message.channel.send("Please check your syntax!");
			return;
		}
		let preprocess = Object.entries(dbjack.get(userinput).value());
		let sendcurrent = "\n";

		for (let index = 0; index < preprocess.length; index++) {
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
	if (command === "memes") {
		// > jack
		let items = dbjack.get("meme").value();
		var memearray =
			items[Math.floor(Math.random() * items.length - 1).toString()];
		message.channel.send(memearray);
	}
	if (command === "debug") {
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
	if (message.content.startsWith(`${prefix}profile ken`)) {
		// To display ken profile. It works . 1
		const profile = new Discord.MessageEmbed()
			.setTitle("Ken`s Profile")
			.setDescription("I like icecream and waffles")
			.setColor("RANDOM")
			.addFields(
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/kenn_tong/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/jack_tok_/?hl=en)",
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
					value:
						"[Steam](https://steamcommunity.com/profiles/76561198129537202)",
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
				value:
					"[Instagram](https://www.instagram.com/_yong_xian_/?hl=en)",
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
					value:
						"[Facebook](https://www.facebook.com/carlson.X.Destroyed)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/carlson.x.destroyed/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value:
						"[Steam](https://steamcommunity.com/id/theuniquetechnix)",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value: "[Twitch](https://www.twitch.tv/evasivexkiller)",
					inline: true,
				},
				{
					name: "\t<:youtube:803173627759296552> \t",
					value:
						"[YouTube](https://www.youtube.com/channel/UCF_5rEee3uoEF_MVNaMeNAA)",
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
					value:
						"[Steam](https://steamcommunity.com/profiles/76561198349598005)",
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
					value:
						"[Instagram](https://www.instagram.com/jun.karls/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value:
						"[Steam](https://steamcommunity.com/profiles/76561198253612891)",
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
					value:
						"[Facebook](https://www.facebook.com/momo.lee.754365)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/iliketoeatdou/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "leehuish4n",
					inline: true,
				},
				{
					name: "\t<:youtube:803173627759296552> \t",
					value:
						"[YouTube](https://www.youtube.com/channel/UCeLZJqAhND7_pW7wEcLWLiA)",
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
					value:
						"[Facebook](https://www.facebook.com/katkatweerose.tien)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/katherinetienn/?hl=en)",
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
					value:
						"[Facebook](https://www.facebook.com/ngmeiling.michelle)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/_michelle_ng/?hl=en)",
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
					value:
						"[Facebook](https://www.facebook.com/profile.php?id=100013145261662)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/ivanwoy/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/pavan_jassal/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:snapchat:803124100133814283> \t",
					value: "pavan_jassal",
					inline: true,
				},
				{
					name: "\t<:twitch:803166637477855243> \t",
					value:
						"[Twitch](https://www.twitch.tv/informal_killer/about)",
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
					value:
						"[Facebook](https://www.facebook.com/pandalung.sheila)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/sheila__1017/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/wchanee_/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/yi_jiez/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/khowe__01/?hl=en)",
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
					value:
						"[Facebook](https://www.facebook.com/dennis.tan.58910)",
					inline: true,
				},
				{
					name: "\t<:insta:803124128194101248>  \t",
					value:
						"[Instagram](https://www.instagram.com/dennis_tan31/?hl=en)",
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
					value:
						"[Steam](https://steamcommunity.com/profiles/76561198264497133)",
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
					value:
						"[Instagram](https://www.instagram.com/yukilow0615/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/chixw_2907/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/vviviennnnn_yaan/?hl=en)",
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
					value:
						"[Instagram](https://www.instagram.com/victorchung.jpg/?hl=en)",
					inline: true,
				},
				{
					name: "\t<:steam:803166421797699594> \t",
					value:
						"[Steam](https://steamcommunity.com/id/victorchungmp4)",
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
	console.log(closeMatch);
	let randgen =
		closeMatch[0].item.Quotes[
			parseInt(Math.random() * closeMatch[0].item.Quotes.length)
		];
	let result = [closeMatch[0].item.Name, randgen, closeMatch[0].score];
	console.log(result);
	return result;
}
function toTitleCase(str) {
	// * Title case for schedule
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}
// > Once the bot is ready set discord status and log in console
client.once("ready", () => {
	client.user.setPresence({
		status: "dnd",
		activity: {
			name: "anything you like",
			type: "STREAMING",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		},
	});
	console.log("The International of DIIT Congress is online.");
});

// > API key to login to start the bot
// ! DO NOT LEAK THIS KEY AS IT ALLOWS THE BOT TO DO ANYTHING
client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");