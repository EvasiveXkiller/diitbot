"use strict";

/**
 * Beyond this point is code taken from discord uno
 * There are no guarantees that this will work reliably
 *
 * The code below might cause errors such as
 *
 * `Maximum Call Stack Size exceeded.`
 *
 * This is mainly due to recursive functions being called too many times.
 *
 * ESLint will be disabled beyond this point, as the code is mainly from a library
 * and there are bad practices involved down there.
 * - Carlson
 */
/* eslint-disable */


const Discord = require("discord.js");
const __importDefault
    = (this && this.__importDefault)
    || function (mod) {return mod && mod.__esModule ? mod : { default: mod };};
const client = new Discord.Client();
const canvas_1 = __importDefault(require("canvas"));
const Cards_1 = require("./Cards");
const discordUNO = {
	storage: new Discord.Collection(),
	gameCards: new Discord.Collection(),
	winners: new Discord.Collection(),
	settings: new Discord.Collection(),
	embedColor: "#FF0000",
};

const prefix = "$";
let enableuno = 1;

client.on("message", async (message) => {

	// * Breaks if the input is not valid
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}

	// * splits into words array
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "uno") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		enableuno = 1;
		const unoembed = new Discord.MessageEmbed({
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
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await createGame(message);
		}
	}
	if (command === "unojoin") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await addUser(message);
		}
	}
	if (command === "unostart") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await startGame(message);
		}
	}
	if (command === "unoend") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await endGame(message);
		}
	}
	if (command === "unoplay") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await playCard(message).catch((error) => {
				console.log(error);
				console.log(discordUNO);
			});
			console.log(discordUNO);
		}
	}
	if (command === "unoleave") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await removeUser(message);
		}
	}
	if (command === "unodraw") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await draw(message);
			console.log(discordUNO.storage.get(message.channel.id));
		}
	}
	if (command === "uno!") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await UNO(message);
		}
	}
	if (command === "unoviewself") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await viewCards(message);
		}
	}
	if (command === "unoviewtable") {
		if (message.channel.type === "dm" || message.channel.type === "group") {
			message.channel.send("DMs are not supported!");
			return;
		}
		if (enableuno === 1) {
			await viewTable(message).catch((error) => {
				console.log(error);
				console.log(discordUNO);
			});
		}
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

client.once("ready", () => {
	console.log("thread_games ready");
});

async function createGame(message) {

	// * Should be stable
	if (!discordUNO.settings.get(message.channel.id)) {
		discordUNO.settings.set(message.channel.id, {
			jumpIns: false,
			reverse: false,
			seven: false,
			stacking: false,
			wildChallenge: false,
			zero: false,
		});
	}
	if (!discordUNO.winners.get(message.channel.id)) {
		discordUNO.winners.set(message.channel.id, []);
	}
	discordUNO.gameCards.set(
		message.channel.id,
		JSON.parse(JSON.stringify(Cards_1.cards)),
	);
	if (discordUNO.storage.get(message.channel.id)) {
		return message.channel.send(
			"There is already a game going on in this channel. Please join that one instead or create a new game in another channel.",
		);
	}
	discordUNO.storage.set(message.channel.id, {
		guild: message.guild.id,
		channel: message.channel.id,
		creator: message.author.id,
		active: false,
		users: [
			{
				id: message.author.id,
				name: message.author.username,
				hand: createCards(message, 7, false),
				safe: false,
			},
		],
		topCard: createCards(message, 1, true)[0],
		currentPlayer: 1,
	});
	const Embed = new Discord.MessageEmbed()
		.setColor(discordUNO.embedColor)
		.setAuthor(
			`${message.author.tag} created an UNO! game! You can now join the game!`,
			message.author.displayAvatarURL({ format: "png" }),
		);
	return message.channel.send("", { embed: Embed });
}

async function addUser(message) {

	// * Should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game in this channel. Instead you can create a new game!",
		);
	if (foundGame.users.some((data) => data.id === message.author.id))
		return message.channel.send(
			`${message.author}, you are already in the current channels UNO! game`,
		);
	if (foundGame.active)
		return message.channel.send(
			"You can no longer join this UNO! game. Try making a new one in another channel.",
		);
	foundGame.users.push({
		id: message.author.id,
		name: message.author.username,
		hand: createCards(message, 7, false),
		safe: false,
	});
	if (foundGame.users.length === 10) {
		foundGame.active = true;
		discordUNO.storage.set(message.channel.id, foundGame);
		const BadUsers = [];
		for (const user of foundGame.users) {
			const userHand = user.hand;
			const userOb = message.client.users.cache.get(user.id);
			const Embed = new Discord.MessageEmbed()
				.setDescription(
					`Your current hand has ${
						userHand.length
					} cards. The cards are\n${userHand
						.map((data) => data.name)
						.join(" | ")}`,
				)
				.setColor(discordUNO.embedColor)
				.setAuthor(
					userOb.username,
					userOb.displayAvatarURL({ format: "png" }),
				);
			try {
				const m = await userOb.send("", { embed: Embed });
				user.DM = { channelId: m.channel.id, messageId: m.id };
			} catch (err) {
				BadUsers.push(userOb.id);
			}
		}
		if (BadUsers.length > 0) {
			const BadEmbed = new Discord.MessageEmbed()
				.setAuthor(
					"Turn DM's On!",
					message.client.user.displayAvatarURL({ format: "png" }),
				)
				.setDescription(
					`${BadUsers.map((u) =>
						message.client.users.cache.get(u),
					).join(
						", ",
					)} please turn your DM's on if you want to view your cards!`,
				)
				.setColor(discordUNO.embedColor);
			message.channel.send("", { embed: BadEmbed });
		}
		const Embed = new Discord.MessageEmbed()
			.setColor(discordUNO.embedColor)
			.setDescription(`**Top Card:** ${foundGame.topCard.name}`)
			.setFooter(
				`Current Player: ${
					message.client.users.cache.get(
						foundGame.users[foundGame.currentPlayer].id,
					).tag
				}`,
			);
		return message.channel.send("", { embed: Embed });
	}
	discordUNO.storage.set(message.channel.id, foundGame);
	return message.channel.send(
		`${message.author} joined ${message.channel}'s UNO! game!`,
	);
}

async function removeUser(message) {

	// * Should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game to leave from, try creating one instead!",
		);
	if (!foundGame.users.some((data) => data.id === message.author.id))
		return message.channel.send(
			"You can't leave a game that you haven't joined.",
		);
	if (foundGame.creator === message.author.id)
		return message.channel.send(
			"You can't leave your own game. Try ending the game instead.",
		);
	const msg = await message.channel.send(
		`${message.author}, are you sure you want to leave the game?`,
	);
	await Promise.all([msg.react("✅"), msg.react("❌")]);
	const filter = (reaction, user) =>
		user.id === message.author.id
        && ["✅", "❌"].includes(reaction.emoji.name);
	const response = await msg.awaitReactions(filter, { max: 1 });
	if (response.size > 0) {
		const reaction = response.first();
		if (reaction.emoji.name === "✅") {
			const userHand = foundGame.users.find(
				(user) => user.id === message.author.id,
			).hand;
			returnCards(message, userHand);
			foundGame.users.splice(
				foundGame.users.findIndex(
					(data) => data.id === message.author.id,
				),
				1,
			);
			discordUNO.storage.set(message.channel.id, foundGame);
			msg.edit(
				`${message.author} has been successfully removed from the game.`,
			);
		} else {
			msg.edit("Cancelled removal.");
		}
	}
}

async function viewCards(message) {

	// * should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game going on in this channel to view cards in. Try creating one instead.",
		);
	if (!foundGame.active)
		return message.channel.send(
			"This game hasn't started yet, you can't do that in a game that hasn't started yet!",
		);
	if (!foundGame.users.find((u) => u.id === message.author.id))
		return message.channel.send(
			"You can't view your hand in a game you haven't joined.",
		);
	const userHand = foundGame.users.find(
		(user) => user.id === message.author.id,
	).hand;
	if (!foundGame.users.find((u) => u.id === message.author.id).DM) {
		const user = foundGame.users.find((u) => u.id === message.author.id);
		const Embed = new Discord.MessageEmbed()
			.setColor(discordUNO.embedColor)
			.setDescription(
				`Your current hand has ${
					userHand.length
				} cards. The cards are\n${userHand
					.map((data) => data.name)
					.join(" | ")}`,
			)
			.setAuthor(
				message.author.username,
				message.author.displayAvatarURL({ format: "png" }),
			);
		try {
			const m = await message.author.send("", { embed: Embed });
			message.channel.send(`${message.author}, check your DMs!`);
			user.DM = {
				channelId: m.channel.id,
				messageId: m.id,
			};
			discordUNO.storage.set(message.channel.id, foundGame);
		} catch (err) {
			const BadEmbed = new Discord.MessageEmbed()
				.setAuthor(
					message.author.username,
					message.author.displayAvatarURL({ format: "png" }),
				)
				.setColor(discordUNO.embedColor)
				.setDescription(
					"You need to have DM's enabled on this server for me to be able to DM you your cards!",
				);
			return message.channel.send("", { embed: BadEmbed });
		}
	} else {
		const Embed = new Discord.MessageEmbed()
			.setColor(discordUNO.embedColor)
			.setDescription(
				`Your current hand has ${
					userHand.length
				} cards. The cards are\n${userHand
					.map((data) => data.name)
					.join(" | ")}`,
			)
			.setAuthor(
				message.author.username,
				message.author.displayAvatarURL({ format: "png" }),
			);
		const authorChannel = message.client.channels.cache.get(
			foundGame.users.find((u) => u.id === message.author.id).DM.channelId,
		);
		const authorMsg = authorChannel.messages.cache.get(
			foundGame.users.find((u) => u.id === message.author.id).DM.messageId,
		);
		message.channel.send(`${message.author}, check your DMs!`);
		return authorMsg.edit("", { embed: Embed });
	}
}

async function playCard(message) {
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game to play a card in! Try making a new game instead.",
		);
	if (!foundGame.active)
		return message.channel.send(
			"This game hasn't started yet, you can't do that in a game that hasn't started yet!",
		);
	const settings = discordUNO.settings.get(message.channel.id);
	const user = settings.jumpIns
		? foundGame.users.find((u) => u.id === message.author.id)
		: foundGame.users[foundGame.currentPlayer];
	const card = message.content.split(" ").slice(1).join(" ");
	if (!card) return message.channel.send("Please provide a valid card.");
	const cardObject = user.hand.find(
		(crd) => crd.name.toLowerCase() === card.toLowerCase(),
	);
	if (!cardObject && settings.jumpIns)
		return message.channel.send("It isn't your turn yet!");
	else if (!cardObject && !settings.jumpIns)
		return message.channel.send("It isn't your turn yet!");
	let jumpedIn = false;
	if (settings.jumpIns) {
		if (
			cardObject.name === foundGame.topCard.name
            && foundGame.users[foundGame.currentPlayer].id !== message.author.id
		) {
			jumpedIn = true;
			foundGame.currentPlayer = foundGame.users.findIndex(
				(u) => u.id === message.author.id,
			);
		} else if (
			cardObject.name !== foundGame.topCard.name
            && foundGame.users[foundGame.currentPlayer].id !== message.author.id
		)
			return message.channel.send("You can't jump in with that card...");
		else if (
			checkTop(foundGame.topCard, cardObject)
            && foundGame.users[foundGame.currentPlayer].id === message.author.id
		)
			jumpedIn = false;
	} else if (user.id !== message.author.id)
		return message.channel.send(
			"Jump in's are disabled in this game, and it isn't your turn yet!",
		);
	if (!checkTop(foundGame.topCard, cardObject) && jumpedIn === false)
		return message.channel.send(
			`You can't play that card! Either play a ${foundGame.topCard.value} Card or a ${foundGame.topCard.color} Card.`,
		);
	const lastPlayer = foundGame.currentPlayer;
	foundGame.topCard = cardObject;
	foundGame.users[lastPlayer].hand.splice(
		foundGame.users[lastPlayer].hand.findIndex(
			(crd) => crd.name === cardObject.name,
		),
		1,
	);
	foundGame.users[lastPlayer].safe = false;
	const special = await doSpecialCardAbility(message, cardObject, foundGame);
	if (!special) {
		foundGame.currentPlayer = nextTurn(
			foundGame.currentPlayer,
			"normal",
			settings,
			foundGame,
		);
		discordUNO.storage.set(message.channel.id, foundGame);
		const Embed = new Discord.MessageEmbed()
			.setDescription(
				`${foundGame.users[lastPlayer].name} played a ${
					cardObject.name
				}. It is now ${
					foundGame.users[foundGame.currentPlayer].name
				}'s turn.`,
			)
			.setColor(discordUNO.embedColor)
			.setAuthor(
				foundGame.users[foundGame.currentPlayer].name,
				message.client.users.cache
					.get(foundGame.users[foundGame.currentPlayer].id)
					.displayAvatarURL({ format: "png" }),
			);
		if (foundGame.users[lastPlayer].hand.length >= 1)
			message.channel.send("", { embed: Embed });
	}
	let gameLength = foundGame.users.length;
	for (let i = 0; i < gameLength; i++) {
		if (foundGame.users[i].hand.length < 1) {
			const winners = discordUNO.winners.get(message.channel.id);
			winners.push({ id: foundGame.users[i].id });
			discordUNO.winners.set(message.channel.id, winners);
			foundGame.users.splice(
				foundGame.users.findIndex(
					(u) => u.id === foundGame.users[i].id,
				),
				1,
			);
			i--;
			gameLength--;
			const Embed = new Discord.MessageEmbed()
				.setAuthor(
					message.author.username,
					message.author.displayAvatarURL({ format: "png" }),
				)
				.setColor(discordUNO.embedColor)
				.setDescription(
					`${message.author} went out with 0 cards! It is now ${
						foundGame.users[foundGame.currentPlayer].name
					}'s turn!`,
				);
			if (foundGame.users.length > 1)
				return message.channel.send("", { embed: Embed });
			else {
				winners.push({ id: foundGame.users[i].id });
				discordUNO.winners.set(message.channel.id, winners);
				foundGame.users.splice(
					foundGame.users.findIndex(
						(u) => u.id === foundGame.users[i].id,
					),
					1,
				);
				const attach = new Discord.MessageAttachment(
					await displayWinners(message, winners),
					"Winners.png",
				);
				Embed.setAuthor(
					message.client.user.username,
					message.client.user.displayAvatarURL({ format: "png" }),
				)
					.attachFiles([attach])
					.setImage("attachment://Winners.png")
					.setDescription(
						`${message.author} went out with 0 cards! There was only one person left in the game so scores have been calculated!`,
					);
				return message.channel.send("", { embed: Embed });
			}
		}
	}
	const channel = message.client.channels.cache.get(
		foundGame.users[lastPlayer].DM.channelId,
	);
	const msg = channel.messages.cache.get(
		foundGame.users[lastPlayer].DM.messageId,
	);
	msg.channel
		.send(
			`${message.client.users.cache.get(foundGame.users[lastPlayer].id)}`,
		)
		.then((m) => m.delete());
	const Embed = new Discord.MessageEmbed()
		.setColor(discordUNO.embedColor)
		.setAuthor(
			message.author.username,
			message.author.displayAvatarURL({ format: "png" }),
		)
		.setDescription(
			`Your new hand has ${
				foundGame.users[lastPlayer].hand.length
			} cards.\n${foundGame.users[lastPlayer].hand
				.map((crd) => crd.name)
				.join(" | ")}`,
		);
	return msg.edit("", { embed: Embed });
}

function checkTop(topCard, playedCard) {

	// * Should be stable
	if (
		topCard.color === playedCard.color
        || topCard.value === playedCard.value
        || playedCard.value === "Wild"
        || playedCard.value === "Wild Draw Four"
	)
		return true;
	else return false;
}

function nextTurn(player, type, settings, storage) {

	// * should be stable
	switch (type) {
	case "normal":
		if (settings.reverse) {
			if (player - 1 < 0) {
				return storage.users.length - 1;
			} else {
				return player - 1;
			}
		} else if (player + 1 >= storage.users.length) {
			return 0;
		} else {
			return player + 1;
		}
	case "skip":
		if (settings.reverse) {
			if (storage.users.length == 2) {
				return player;
			} else {
				if (player - 2 == 0) {
					return 0;
				} else if (player - 2 == -1) {
					return storage.users.length - 1;
				} else if (player - 2 == -2) {
					return storage.users.length - 2;
				} else {
					return player - 2;
				}
			}
		} else {
			if (storage.users.length == 2) {
				return player;
			} else {
				if (player + 2 == storage.users.length) {
					return 0;
				} else if (player + 2 > storage.users.length) {
					return 1;
				} else if (player == 0 && storage.users.length >= 3) {
					return 2;
				}

				// else if (player - 2 < 0) {
				// 	return storage.users.length - 2;
				// }
				else {
					return player + 2;
				}
			}
		}
	}
}

async function viewTable(message) {

	// * should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game currently in this channel! Try creating one instead.",
		);
	if (foundGame.users.length < 2)
		return message.channel.send(
			"There are too few players in the game to view the current table status!",
		);
	const settings = discordUNO.settings.get(message.channel.id);
	canvas_1.default.registerFont("./assets/fonts/Manrope-Bold.ttf", {
		family: "manropebold",
	});
	canvas_1.default.registerFont("./assets/fonts/Manrope-Regular.ttf", {
		family: "manroperegular",
	});
	const canvas = canvas_1.default.createCanvas(2000, 1000);
	const ctx = canvas.getContext("2d");
	const random = Math.floor(Math.random() * 5); // Random from 0 - 4
	const fileName = `Table_${random}.png`;
	const image = await canvas_1.default.loadImage(
		`./assets/cards/table/${fileName}`,
	);
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	const table = await canvas_1.default.loadImage(
		"./assets/cards/table/UNO_Table.png",
	);
	ctx.drawImage(
		table,
		canvas.width / 4 - 100,
		canvas.height / 3 - 100,
		canvas.width / 2 + 200,
		canvas.height / 3 + 200,
	);
	const TopCard = await canvas_1.default.loadImage(foundGame.topCard.image);
	ctx.drawImage(
		TopCard,
		canvas.width / 2 + 35,
		canvas.height / 2 - TopCard.height / 5,
		120.75,
		175,
	);
	const bcard = await canvas_1.default.loadImage(
		"./assets/cards/table/deck/Deck.png",
	);
	let x1 = canvas.width / 2 - (120.75 + 28);
	let y1 = canvas.height / 2 - TopCard.height / 5 + 2;
	for (let i = 0; i < 3; i++) {
		ctx.drawImage(bcard, x1, y1, 120.75, 175);
		x1 += 12;
		y1 -= 12;
	}
	let x = 330;
	let y = canvas.height / 2;
	let counter = 0;
	ctx.textAlign = "center";
	ctx.fillStyle = "#ffffff";
	for (let i = 0; i < foundGame.users.length; i++) {
		ctx.font = "40px manropebold";
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, 60, 0, 2 * Math.PI, true);
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#ffffff";
		ctx.stroke();
		ctx.clip();
		const image = await canvas_1.default.loadImage(
			await message.guild.members.cache
				.get(foundGame.users[i].id)
				.user.displayAvatarURL({ format: "png" }),
		);
		ctx.drawImage(
			image,
			x - image.width / 2 + 4,
			y - image.height / 2 + 4,
			120,
			120,
		);
		ctx.closePath();
		ctx.restore();
		console.log(foundGame.currentPlayer);
		if (
			foundGame.users[i]
            && foundGame.users[i].id
            === foundGame.users[foundGame.currentPlayer].id
		) {
			ctx.fillStyle = "#ffffff";
			ctx.save();
			const crown = await canvas_1.default.loadImage(
				"https://discordapp.com/assets/98fe9cdec2bf8ded782a7bf1e302b664.svg",
			);
			ctx.translate(x - crown.width / 2 + 87, y - crown.height / 2 - 103);
			ctx.rotate((42 * Math.PI) / 180);
			ctx.drawImage(crown, -5, 20, 60, 60);
			ctx.restore();
		}
		if (counter < 5) {
			const cardImage = await canvas_1.default.loadImage(
				"./assets/cards/table/deck/Deck.png",
			);
			ctx.drawImage(
				cardImage,
				x - cardImage.width / 2 + 60,
				y - 40,
				55.2,
				80,
			);
			ctx.font = "70px manropebold";
			ctx.fillText(
				foundGame.users[i]
					? foundGame.users[i].hand.length.toString()
					: "X",
				x - 180,
				y + 25,
			);
		} else {
			const cardImage = await canvas_1.default.loadImage(
				"./assets/cards/table/deck/Deck.png",
			);
			ctx.drawImage(
				cardImage,
				x + cardImage.width / 2 - 60,
				y - 40,
				55.2,
				80,
			);
			ctx.font = "70px manropebold";
			ctx.fillText(
				foundGame.users[i]
					? foundGame.users[i].hand.length.toString()
					: "X",
				x + 105,
				y + 25,
			);
		}
		switch (counter) {
		case 0:
			x = x + 150;
			y = y - 300;
			break;
		case 1:
			x = x + 350;
			y = y - 30;
			break;
		case 2:
			x = x + 370;
			y = y;
			break;
		case 3:
			x = x + 350;
			y = y + 30;
			break;
		case 4:
			x = x + 120;
			y = y + 300;
			break;
		case 5:
			x = x - 120;
			y = y + 300;
			break;
		case 6:
			x = x - 350;
			y = y + 30;
			break;
		case 7:
			x = x - 370;
			y = y;
			break;
		case 8:
			x = x - 350;
			y = y - 30;
			break;
		}
		counter++;
	}
	ctx.fillStyle = "#ffffff";
	ctx.font = "70px manropebold";
	ctx.textAlign = "left";
	const width = ctx.measureText("Rotation: ").width;
	ctx.fillText(
		"Rotation: ",
		canvas.width - 200 - width - 30,
		canvas.height - 50,
	);
	const IMAGE = await canvas_1.default.loadImage(
		settings.reverse
			? "./assets/rotation/counter_clock-wise.png"
			: "./assets/rotation/clock-wise.png",
	);
	ctx.drawImage(IMAGE, canvas.width - 200, canvas.height - 120, 100, 87.36);
	ctx.fillText("Turn: ", 120, canvas.height - 50);
	ctx.fillStyle = "#ffffff";
	const WIDTH = ctx.measureText("Turn: ").width;
	ctx.fillText(
		`${foundGame.users[foundGame.currentPlayer].name}`,
		WIDTH + 105 + 10,
		canvas.height - 50,
	);
	return message.channel.send("Current Game State", {
		files: [new Discord.MessageAttachment(canvas.toBuffer("image/png"))],
	});
}

function draw(message) {

	// * Should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"You can't draw cards from a game that doesn't exist! Try making one instead!",
		);
	if (!foundGame.users.some((user) => user.id === message.author.id))
		return message.channel.send(
			"You can't draw cards in this game! You aren't part of it!",
		);
	if (!foundGame.active)
		return message.channel.send(
			"You can't draw cards from a game that hasn't started yet!",
		);
	if (foundGame.users[foundGame.currentPlayer].id !== message.author.id)
		return message.channel.send(
			"You can't draw cards yet! It isn't your turn.",
		);
	const beforeCondition
        = foundGame.users[foundGame.currentPlayer].hand.find((c) => c.color === foundGame.topCard.color)
        || foundGame.users[foundGame.currentPlayer].hand.find((c) => c.value === foundGame.topCard.value)
        || foundGame.users[foundGame.currentPlayer].hand.find((c) => c.value === "null");
	if (beforeCondition)
		return message.channel.send(
			"You already have a card in your hand that you can play! Try playing that instead.",
		);
	const newCard = createCards(message, 1, false);
	const foundSettings = discordUNO.settings.get(message.channel.id);
	foundGame.users[foundGame.currentPlayer].hand.push(newCard[0]);
	const author = message.author;
	const nextUser = message.client.users.cache.get(
		foundGame.users[
			nextTurn(
				foundGame.currentPlayer,
				"normal",
				foundSettings,
				foundGame,
			)
		].id,
	);
	const condition
        = foundGame.users[foundGame.currentPlayer].hand.find((c) => c.color === foundGame.topCard.color)
        || foundGame.users[foundGame.currentPlayer].hand.find((c) => c.value === foundGame.topCard.value)
        || foundGame.users[foundGame.currentPlayer].hand.find((c) => c.value === "null");
	const DrawEmbed = new Discord.MessageEmbed()
		.setColor(discordUNO.embedColor)
		.setDescription(
			`${
				message.author
			}, you drew 1 card! Check your DM's for your new hand.${
				!condition
					? ` ${
						message.author.username
					} couldn't play a card. It is now ${
						message.client.users.cache.get(
							foundGame.users[
								nextTurn(
									foundGame.currentPlayer,
									"normal",
									foundSettings,
									foundGame,
								)
							].id,
						).username
					}'s turn.`
					: ""
			}`,
		)
		.setAuthor(
			!condition ? nextUser.username : author.username,
			!condition
				? nextUser.displayAvatarURL({ format: "png" })
				: author.displayAvatarURL({ format: "png" }),
		);
	message.channel.send("", { embed: DrawEmbed });
	if (!condition)
		foundGame.currentPlayer = nextTurn(
			foundGame.currentPlayer,
			"normal",
			foundSettings,
			foundGame,
		);
	discordUNO.storage.set(message.channel.id, foundGame);
	const channel = message.client.channels.cache.get(
		foundGame.users.find((u) => u.id === message.author.id).DM.channelId,
	);
	const msg = channel.messages.cache.get(
		foundGame.users.find((u) => u.id === message.author.id).DM.messageId,
	);
	msg.channel.send(`${message.author}`).then((m) => m.delete());
	const Embed = new Discord.MessageEmbed()
		.setColor(discordUNO.embedColor)
		.setAuthor(
			message.author.username,
			message.author.displayAvatarURL({ format: "png" }),
		)
		.setDescription(
			`You drew 1 card. Your new hand has ${
				foundGame.users.find((u) => u.id === message.author.id).hand
					.length
			} cards.\n\n${foundGame.users
				.find((u) => u.id === message.author.id)
				.hand.map((c) => c.name)
				.join(" | ")}`,
		);
	return msg.edit("", { embed: Embed });
}

async function doSpecialCardAbility(message, card, data) {
	let special = false;
	const settings = discordUNO.settings.get(message.channel.id);
	let type;
	const authorChannel = message.client.channels.cache.get(
		data.users.find((u) => u.id === message.author.id).DM.channelId,
	);
	const authorMsg = authorChannel.messages.cache.get(
		data.users.find((u) => u.id === message.author.id).DM.messageId,
	);
	const nextUserChannel = message.client.channels.cache.get(
		data.users[nextTurn(data.currentPlayer, "normal", settings, data)].DM
			.channelId,
	);
	const nextUserMsg = nextUserChannel.messages.cache.get(
		data.users[nextTurn(data.currentPlayer, "normal", settings, data)].DM
			.messageId,
	);

	// * const skipNextUserChannel = <DMChannel>message.client.channels.cache.get(data.users[this.nextTurn(data.currentPlayer, "skip", settings, data)].DM.channelId)
	// * const skipNextUserMsg = skipNextUserChannel.messages.cache.get(data.users[this.nextTurn(data.currentPlayer, "skip", settings, data)].DM.messageId);
	const Embed = new Discord.MessageEmbed().setColor(discordUNO.embedColor);
	if (card.name.toLowerCase() === "wild draw four") {

		// Done
		special = true;
		let color;
		const msg = await message.channel.send(
			`${message.author}, which color would you like to switch to? 🔴, 🟢, 🔵, or 🟡. You have 30 seconds to respond.`,
		);
		const filter = (reaction, u) =>
			["🔴", "🟢", "🔵", "🟡"].includes(reaction.emoji.name)
            && u.id === message.author.id;
		await Promise.all([
			msg.react("🔴"),
			msg.react("🟢"),
			msg.react("🔵"),
			msg.react("🟡"),
		]);
		const collected = await msg.awaitReactions(filter, {
			max: 1,
			time: 30000,
		});
		const reaction = collected.first();
		if (reaction !== undefined) {
			if (reaction.emoji.name === "🟢") {
				color = "green";
			} else if (reaction.emoji.name === "🔴") {
				color = "red";
			} else if (reaction.emoji.name === "🔵") {
				color = "blue";
			} else if (reaction.emoji.name === "🟡") {
				color = "yellow";
			}
		}
		const colors = { 1: "green", 2: "red", 3: "blue", 4: "yellow" };
		if (!color) {
			const math = Math.floor(Math.random() * 4) + 1;
			color = colors[math];
		}
		data.topCard.color = color;
		const nextUser = nextTurn(data.currentPlayer, "normal", settings, data);
		const user = message.client.users.cache.get(data.users[nextUser].id);
		let challenge = false;

		// ! notused wild challenge
		if (settings.wildChallenge) {
			const ChallEmbed = new Discord.MessageEmbed()
				.setColor(discordUNO.embedColor)
				.setDescription(
					`${message.author.tag} has played a Wild Draw Four, ${user}, would you like to challenge this? If they had another card they could have played, they draw 6 instead, otherwise, you draw 6. If you decide not to challenge, you draw the normal 4 cards.`,
				)
				.setAuthor(
					user.username,
					user.displayAvatarURL({ format: "png" }),
				);
			const msg = await message.channel.send("", ChallEmbed);
			await Promise.all([msg.react("✅"), msg.react("❌")]);
			const f = (reaction, u) =>
				["✅", "❌"].includes(reaction.emoji.name) && u.id === user.id;
			const collected2 = await msg.awaitReactions(f, {
				max: 1,
				time: 30000,
			});
			if (collected2.size > 0) {
				const reaction2 = collected2.first();
				switch (reaction2.emoji.name) {
				case "✅":
					challenge = true;
					break;
				case "❌":
					challenge = false;
					break;
				default:
					challenge = false;
					break;
				}
			}
			const challenged = message.author;
			const challenger = user;
			const nextTurnUser = await client.users.fetch(
				data.users[nextTurn(data.currentPlayer, "skip", settings, data)]
					.id,
			).username;
			let challengeWIN;
			if (challenge) {

				// ! not implemented
				if (
					data.users
						.find((user) => user.id === challenged.id)
						.hand.find((crd) => crd.value === data.topCard.value)
                    || data.users.find((user) => user.id === challenged.id).hand.find((crd) => crd.color === data.topCard.color)
				) {
					type = "normal";
					challengeWIN = true;
					const newCards = createCards(message, 6, false);
					newCards.forEach((c) => {
						data.users
							.find((user) => user.id === challenged.id)
							.hand.push(c);
					});
					Embed.setAuthor(
						message.author.username,
						message.author.displayAvatarURL({ format: "png" }),
					).setDescription(
						`You've been caught! You drew 6 cards.\n\n${data.users
							.find((u) => u.id === user.id)
							.hand.map((c) => c.name)
							.join(" - ")}`,
					);
					authorMsg.edit("", { embed: Embed });
					authorMsg.channel
						.send("Attention.")
						.then((m) => m.delete());
					ChallEmbed.setDescription(
						`${message.author.tag} just played a ${card.name} on ${challenger.tag} and lost the challege! ${challenged.tag} drew 6 cards. It is now ${challenger.tag}'s turn!`,
					);
					msg.edit("", { embed: ChallEmbed });
				} else {
					type = "skip";
					challengeWIN = false;
					const newCards = createCards(message, 6, false);
					newCards.forEach((c) => {
						data.users
							.find((user) => user.id === challenger.id)
							.hand.push(c);
					});
					Embed.setAuthor(
						challenger.username,
						challenger.displayAvatarURL({ format: "png" }),
					).setDescription(
						`Looks like you lost the challenge! You drew 6 cards.\n\n${data.users
							.find((u) => u.id === user.id)
							.hand.map((c) => c.name)
							.join(" - ")}`,
					);
					nextUserMsg.edit("", { embed: Embed });
					nextUserMsg.channel
						.send("Attention.")
						.then((m) => m.delete());
					ChallEmbed.setDescription(
						`${message.author.tag} just played a ${card.name} on ${challenger.tag} and won the challenge! ${challenger.tag} drew 6 cards. It is now ${nextTurnUser.tag}'s turn!`,
					);
					msg.edit("", { embed: ChallEmbed });
				}
			} else {
				type = "skip";
				challengeWIN = null;
				const newCards = createCards(message, 4, false);
				newCards.forEach((c) => {
					data.users[nextUser].hand.push(c);
				});
				const userToSend = message.client.users.cache.get(
					data.users[nextUser].id,
				);
				Embed.setAuthor(
					userToSend.username,
					userToSend.displayAvatarURL({ format: "png" }),
				).setDescription(
					`Looks like you decided not to challenge. You drew 4 cards.\n\n${data.users[
						nextUser
					].hand
						.map((c) => c.name)
						.join(" - ")}`,
				);
				nextUserMsg.edit("", { embed: Embed });
				nextUserMsg.channel
					.send(`${userToSend}`)
					.then((m) => m.delete());
				ChallEmbed.setDescription(
					`${message.author.tag} just played a ${card.name} on ${challenger.tag}. ${challenger.tag} decided not to challenge... They drew 4 cards and it is now ${nextTurnUser.tag}'s turn.`,
				);
				msg.edit("", { embed: ChallEmbed });
			}
		} else {
			const nextIndex = nextTurn(
				data.currentPlayer,
				"skip",
				settings,
				data,
			);
			const nextTurnUser = data.users[nextIndex].name;
			console.log(nextTurnUser);
			type = "skip";
			const newCards = createCards(message, 4, false);
			newCards.forEach((c) => {
				data.users[nextUser].hand.push(c);
			});
			const userToSend = message.client.users.cache.get(
				data.users[nextUser].id,
			);
			Embed.setAuthor(
				userToSend.username,
				userToSend.displayAvatarURL({ format: "png" }),
			).setDescription(
				`Looks like you decided not to challenge. You drew 4 cards.\n\n${data.users[
					nextUser
				].hand
					.map((c) => c.name)
					.join(" | ")}`,
			);
			nextUserMsg.edit("", { embed: Embed });
			nextUserMsg.channel.send(`${userToSend}`).then((m) => m.delete());
			const RegEmbed = new Discord.MessageEmbed()
				.setDescription(
					`${message.author.tag} just played a ${card.name} on ${userToSend.tag} and ${userToSend.tag} drew 4 cards. It is now ${nextTurnUser}'s turn.`,
				)
				.setColor(discordUNO.embedColor)
				.setAuthor(
					user.username,
					user.displayAvatarURL({ format: "png" }),
				);
			message.channel.send("", { embed: RegEmbed });
		}
	} else if (card.name.toLowerCase() === "wild") {

		// Done
		type = "normal";
		special = true;
		let color;
		const EmMsg = new Discord.MessageEmbed()
			.setDescription(
				`${message.author}, which color would you like to switch to? \🔴, \🟢, \🔵, or \🟡. You have 30 seconds to respond.`,
			)
			.setColor(discordUNO.embedColor)
			.setAuthor(
				message.author.username,
				message.author.displayAvatarURL({ format: "png" }),
			);
		const msg = await message.channel.send("", { embed: EmMsg });
		const filter = (reaction, user) => {
			if (user.bot) return;
			if (user.id !== message.author.id) return;
			return (
				["🔴", "🟢", "🔵", "🟡"].includes(reaction.emoji.name)
                && user.id === message.author.id
			);
		};
		await Promise.all([
			msg.react("🟢"),
			msg.react("🔴"),
			msg.react("🔵"),
			msg.react("🟡"),
		]);
		const collected = await msg.awaitReactions(filter, {
			max: 1,
			time: 30000,
		});
		const reaction = collected.first();
		if (reaction !== undefined) {
			if (reaction.emoji.name === "🟢") {
				color = "green";
			} else if (reaction.emoji.name === "🔴") {
				color = "red";
			} else if (reaction.emoji.name === "🔵") {
				color = "blue";
			} else if (reaction.emoji.name === "🟡") {
				color = "yellow";
			}
		}
		const colors = { 1: "green", 2: "red", 3: "blue", 4: "yellow" };
		if (!color) {
			const math = Math.floor(Math.random() * 4) + 1;
			color = colors[math];
		}
		data.topCard.color = color;
		Embed.setAuthor(
			message.author.username,
			message.author.displayAvatarURL({ format: "png" }),
		).setDescription(
			`You played a Wild and changed the color to ${color}.\n\n${data.users
				.find((u) => u.id === message.author.id)
				.hand.map((c) => c.name)
				.join(" | ")}`,
		);
		authorMsg.edit("", { embed: Embed });
		authorMsg.channel.send("Attention.").then((m) => m.delete());
		const MsgEmbed = new Discord.MessageEmbed()
			.setDescription(
				`${message.author.tag} played a ${
					card.name
				} and switched the color to ${color}. It is now ${
					data.users[
						nextTurn(data.currentPlayer, "normal", settings, data)
					].name
				}'s turn`,
			)
			.setColor(discordUNO.embedColor)
			.setAuthor(
				message.guild.members.cache.get(
					data.users[
						nextTurn(data.currentPlayer, "normal", settings, data)
					].id,
				).user.username,
				message.guild.members.cache
					.get(
						data.users[
							nextTurn(
								data.currentPlayer,
								"normal",
								settings,
								data,
							)
						].id,
					)
					.user.displayAvatarURL({ format: "png" }),
			);
		msg.edit("", { embed: MsgEmbed });
	} else if (card.name.toLowerCase().includes("reverse")) {

		// Done
		special = true;
		settings.reverse = !settings.reverse;
		if (data.users.length === 2) type = "skip";
		else type = "normal";
		authorMsg.channel.send("Attention.").then((m) => m.delete());
		Embed.setAuthor(
			message.author.username,
			message.author.displayAvatarURL({ format: "png" }),
		).setDescription(
			`You played a ${card.name}. You now have ${
				data.users.find((u) => u.id === message.author.id).hand.length
			} cards.\n\n${data.users
				.find((u) => u.id === message.author.id)
				.hand.map((c) => c.name)
				.join(" | ")}`,
		);
		authorMsg.edit("", { embed: Embed });
		const MsgEmbed = new Discord.MessageEmbed()
			.setDescription(
				`${message.author.tag} played a ${card.name}. It is now ${
					data.users[
						nextTurn(data.currentPlayer, type, settings, data)
					].name
				}'s turn`,
			)
			.setAuthor(
				message.client.users.cache.get(
					data.users[
						nextTurn(data.currentPlayer, type, settings, data)
					].id,
				).username,
				message.client.users.cache
					.get(
						data.users[
							nextTurn(data.currentPlayer, type, settings, data)
						].id,
					)
					.displayAvatarURL({ format: "png" }),
			)
			.setColor(discordUNO.embedColor);
		message.channel.send("", { embed: MsgEmbed });
	} else if (card.name.toLowerCase().includes("skip")) {

		// Done
		type = "skip";
		special = true;
		authorMsg.channel.send("Attention.").then((m) => m.delete());
		Embed.setAuthor(
			message.author.username,
			message.author.displayAvatarURL({ format: "png" }),
		).setDescription(
			`You played a ${card.name}. You now have ${
				data.users.find((u) => u.id === message.author.id).hand.length
			} cards.\n\n${data.users
				.find((u) => u.id === message.author.id)
				.hand.map((c) => c.name)
				.join(" | ")}`,
		);
		authorMsg.edit("", { embed: Embed });
		const SendEmbed = new Discord.MessageEmbed()
			.setDescription(
				`${message.author.tag} skipped ${
					data.users[
						nextTurn(data.currentPlayer, "normal", settings, data)
					].name
				} with a ${card.name}. It is now ${
					data.users[
						nextTurn(data.currentPlayer, "skip", settings, data)
					].name
				}'s turn!`,
			)
			.setAuthor(
				message.client.users.cache.get(
					data.users[
						nextTurn(data.currentPlayer, "skip", settings, data)
					].id,
				).username,
				message.client.users.cache
					.get(
						data.users[
							nextTurn(data.currentPlayer, "skip", settings, data)
						].id,
					)
					.displayAvatarURL({ format: "png" }),
			)
			.setColor(discordUNO.embedColor);
		message.channel.send("", { embed: SendEmbed });
	} else if (card.name.toLowerCase().includes("zero")) {

		// Done
		// ! not using this card, ignoring
		if (settings.zero) {
			type = "normal";
			special = true;
			const userCount = data.users.length;
			const reverse = settings.reverse;
			const tempHand = [];
			if (reverse) {
				for (let i = userCount - 1; i >= 0; i--) {
					tempHand.push(data.users[i].hand);
					if (tempHand.length > 1) {
						const toSet = tempHand.shift();
						data.users[i].hand = toSet;
					}
					if (i === 0) {
						const toSet = tempHand.pop();
						data.users[userCount - 1].hand = toSet;
					}
				}
			} else {
				for (let i = 0; i < userCount; i++) {
					tempHand.push(data.users[i].hand);
					if (tempHand.length > 1) {
						const toSet = tempHand.shift();
						data.users[i].hand = toSet;
					}
					if (i === userCount - 1) {
						const toSet = tempHand.pop();
						data.users[0].hand = toSet;
					}
				}
			}
			for (const u of data.users) {
				const uChannel = message.client.channels.cache.get(
					u.DM.channelId,
				);
				const uMsg = uChannel.messages.cache.get(u.DM.messageId);
				uChannel.send("Attention.").then((m) => m.delete());
				Embed.setAuthor(
					message.client.users.cache.get(u.id).username,
					message.client.users.cache
						.get(u.id)
						.displayAvatarURL({ format: "png" }),
				).setDescription(
					`${message.author} played a ${
						card.name
					}. Your new hand has ${
						u.hand.length
					} cards.\n\n${u.hand.map((c) => c.name).join(" | ")}.`,
				);
				uMsg.edit("", { embed: Embed });
			}
			const SendMessage = new Discord.MessageEmbed()
				.setDescription(
					`${message.author.tag} played a ${
						card.name
					}. Everyone rotated their hand ${
						settings.reverse ? "counter clock-wise" : "clock-wise"
					}. It is now ${
						message.guild.members.cache.get(
							data.users[
								nextTurn(
									data.currentPlayer,
									"normal",
									settings,
									data,
								)
							].id,
						).user.tag
					}'s turn.`,
				)
				.setColor(discordUNO.embedColor)
				.setAuthor(
					message.guild.members.cache.get(
						data.users[
							nextTurn(
								data.currentPlayer,
								"normal",
								settings,
								data,
							)
						].id,
					).user.username,
					message.guild.members.cache
						.get(
							data.users[
								nextTurn(
									data.currentPlayer,
									"normal",
									settings,
									data,
								)
							].id,
						)
						.user.displayAvatarURL({ format: "png" }),
				);
			message.channel.send("", { embed: SendMessage });
		}
	} else if (card.name.toLowerCase().includes("seven")) {

		// Done
		// ! not using this card, ignoring
		if (settings.seven) {
			type = "normal";
			special = true;
			const players = data.users.length;
			let reactions;
			const playerEmojis = {
				2: ["1️⃣"],
				3: ["1️⃣", "2️⃣"],
				4: ["1️⃣", "2️⃣", "3️⃣"],
				5: ["1️⃣", "2️⃣", "3️⃣", "4️⃣"],
				6: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"],
				7: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"],
				8: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"],
				9: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"],
				10: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
			};
			for (const string of Object.keys(playerEmojis)) {
				if (parseInt(string) === players) {

					// @ts-ignore
					reactions = playerEmojis[string];
				}
			}
			const dataToChooseFrom = data.users.filter(
				(user) => user.id !== message.author.id,
			);
			const numbers = {
				0: "1️⃣",
				1: "2️⃣",
				2: "3️⃣",
				3: "4️⃣",
				4: "5️⃣",
				5: "6️⃣",
				6: "7️⃣",
				7: "8️⃣",
				8: "9️⃣",
			};

			// @ts-ignore
			const desciption = dataToChooseFrom
				.map(
					(user) =>
						`${
							numbers[
								(
									dataToChooseFrom.findIndex(
										(u) => u.id === user.id,
									) + 1
								).toString()
							]
						} - ${
							message.guild.members.cache.get(user.id).user.tag
						} has ${user.hand.length} cards`,
				)
				.join("\n");
			const EmbedMsg = new Discord.MessageEmbed()
				.setDescription(
					`${message.author} who would you like to swap cards with?\n\n${desciption}`,
				)
				.setColor(discordUNO.embedColor)
				.setAuthor(
					message.author.username,
					message.author.displayAvatarURL({ format: "png" }),
				);
			const msg = await message.channel.send("", { embed: EmbedMsg });
			const filter = (reaction, user) =>
				reactions.includes(reaction.emoji.name)
                && message.author.id === user.id;
			reactions.forEach((e) => {
				msg.react(e);
			});
			const response = await msg.awaitReactions(filter, { max: 1 });
			const reaction = response.first();
			let swapToUser;
			const emojis = {
				"1️⃣": 0,
				"2️⃣": 1,
				"3️⃣": 2,
				"4️⃣": 3,
				"5️⃣": 4,
				"6️⃣": 5,
				"7️⃣": 6,
				"8️⃣": 7,
				"9️⃣": 8,
			};
			if (reaction) {
				const emoji = reaction.emoji.name;

				// @ts-ignore
				const num = emojis[emoji];
				swapToUser = dataToChooseFrom[num];
			} else {
				const math
                    = Math.floor(Math.random() * dataToChooseFrom.length) + 1;
				swapToUser = dataToChooseFrom[math];
			}
			const authorHand = data.users.find(
				(user) => user.id === message.author.id,
			).hand;
			const authorId = message.author.id;
			const toSwapHand = data.users.find(
				(user) => user.id === swapToUser.id,
			).hand;
			const toSwapToId = swapToUser.id;
			const author = message.author;
			const user = message.guild.members.cache.get(swapToUser.id).user;
			data.users.find((user) => user.id === authorId).hand = toSwapHand;
			data.users.find((u) => u.id === toSwapToId).hand = authorHand;
			Embed.setDescription(
				`You swapped hands with ${user}! You now have ${
					data.users.find((u) => u.id === author.id).hand.length
				} cards!\n\n${data.users
					.find((u) => u.id === author.id)
					.hand.map((c) => c.name)
					.join(" | ")}`,
			).setAuthor(
				message.author.username,
				message.author.displayAvatarURL({ format: "png" }),
			);
			authorMsg.edit("", Embed);
			authorChannel.send("Attention.").then((m) => m.delete());
			const userChannel = message.client.channels.cache.get(
				data.users.find((u) => u.id === user.id).DM.channelId,
			);
			const userMsg = userChannel.messages.cache.get(
				data.users.find((u) => u.id === user.id).DM.messageId,
			);
			Embed.setDescription(
				`${author} swapped hands with you! You now have ${
					data.users.find((u) => u.id === user.id).hand.length
				} cards!\n\n${data.users
					.find((u) => u.id === user.id)
					.hand.map((c) => c.name)
					.join(" | ")}`,
			).setAuthor(
				user.username,
				user.displayAvatarURL({ format: "png" }),
			);
			userChannel.send("Attention.").then((m) => m.delete());
			userMsg.edit("", { embed: Embed });
			EmbedMsg.setDescription(
				`${
					message.author
				} swapped hands with ${user}! It is now ${message.client.users.cache.get(
					data.users[
						nextTurn(data.currentPlayer, "normal", settings, data)
					].id,
				)}'s turn!`,
			).setAuthor(
				message.client.users.cache.get(
					data.users[
						nextTurn(data.currentPlayer, "normal", settings, data)
					].id,
				).username,
				message.client.users.cache
					.get(
						data.users[
							nextTurn(
								data.currentPlayer,
								"normal",
								settings,
								data,
							)
						].id,
					)
					.displayAvatarURL({ format: "png" }),
			);
			msg.edit("", { embed: EmbedMsg }).then((m) =>
				m.reactions.removeAll(),
			);
		}
	} else if (card.name.toLowerCase().includes("draw two")) {

		// Done
		type = "skip";
		special = true;
		const newCards = createCards(message, 2, false);
		const skippedUser
            = data.users[nextTurn(data.currentPlayer, "normal", settings, data)];
		newCards.forEach((c) => skippedUser.hand.push(c));
		Embed.setDescription(
			`${message.author} played a ${
				card.name
			}. You drew 2 cards. Your new hand has ${
				skippedUser.hand.length
			} cards.\n\n${skippedUser.hand.map((c) => c.name).join(" | ")}`,
		).setAuthor(
			skippedUser.username,
			message.client.users.cache
				.get(skippedUser.id)
				.displayAvatarURL({ format: "png" }),
		);
		nextUserMsg.edit("", { embed: Embed });
		nextUserChannel.send("Attention.").then((m) => m.delete());
		const counter = nextTurn(data.currentPlayer, "skip", settings, data);
		console.log(counter);
		const SendEmbed = new Discord.MessageEmbed()
			.setAuthor(
				data.users[counter].name,
				message.client.users.cache
					.get(
						data.users[
							nextTurn(data.currentPlayer, "skip", settings, data)
						].id,
					)
					.displayAvatarURL({ format: "png" }),
			)
			.setColor(discordUNO.embedColor)
			.setDescription(
				`${message.author.tag} played a ${card.name} on ${
					skippedUser.name
				}. They drew two cards and it is now ${
					data.users[
						nextTurn(data.currentPlayer, "skip", settings, data)
					].name
				}'s turn!`,
			);
		message.channel.send("", { embed: SendEmbed });
	}
	if (special) {
		if (data.users[data.currentPlayer].hand.length < 1) type = "normal";
		data.currentPlayer = nextTurn(data.currentPlayer, type, settings, data);
		discordUNO.settings.set(message.channel.id, settings);
		discordUNO.storage.set(message.channel.id, data);
	}
	return special;
}

async function startGame(message) {

	// * should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game going on in this channel to start. Try creating one instead.",
		);
	if (foundGame.creator !== message.author.id)
		return message.channel.send(
			"Only the creator of the game can force start the game.",
		);
	if (foundGame.users.length < 2)
		return message.channel.send(
			"Please wait for at least 2 players before trying to start the game.",
		);
	if (foundGame.active)
		return message.channel.send("You can't start an already active game.");
	foundGame.active = true;
	discordUNO.storage.set(message.channel.id, foundGame);
	const BadUsers = [];
	for (const user of foundGame.users) {
		const userHand = user.hand;
		const userOb = message.client.users.cache.get(user.id);
		const Embed = new Discord.MessageEmbed()
			.setDescription(
				`Your current hand has ${
					userHand.length
				} cards. The cards are\n${userHand
					.map((data) => data.name)
					.join(" | ")}`,
			)
			.setColor(discordUNO.embedColor)
			.setAuthor(
				userOb.username,
				userOb.displayAvatarURL({ format: "png" }),
			);
		try {
			const m = await userOb.send("", { embed: Embed });
			user.DM = { channelId: m.channel.id, messageId: m.id };
		} catch (err) {
			BadUsers.push(userOb.id);
		}
	}
	if (BadUsers.length > 0) {
		const BadEmbed = new Discord.MessageEmbed()
			.setAuthor(
				"Turn DM's On!",
				message.client.user.displayAvatarURL({ format: "png" }),
			)
			.setDescription(
				`${BadUsers.map((u) => message.client.users.cache.get(u)).join(
					", ",
				)} please turn your DM's on if you want to view your cards!`,
			)
			.setColor(discordUNO.embedColor);
		message.channel.send("", { embed: BadEmbed });
	}
	const Embed = new Discord.MessageEmbed()
		.setColor(discordUNO.embedColor)
		.setDescription(`**Top Card:** ${foundGame.topCard.name}`)
		.setFooter(
			`Current Player: ${
				message.client.users.cache.get(
					foundGame.users[foundGame.currentPlayer].id,
				).tag
			}`,
		);
	return message.channel.send("", { embed: Embed });
}

function outOfCards(cardType) {

	// * should be stable
	for (const card of cardType) {
		if (card.inPlay < card.count) return false;
	}
	return true;
}

function createCards(message, amount, topCard) {

	// ? might overflow?
	if (!topCard) topCard = false;
	let counter = 0;
	const cardHand = [];
	const cards = discordUNO.gameCards.get(message.channel.id);
	do {
		let math = Math.floor(Math.random() * 4) + 1;
		const math2 = Math.random();
		if (topCard == false) {
			if (math2 < 0.074) {
				math = 5;
			}
		}
		const notYellow = [redCard, greenCard, blueCard, wildCard];
		const randomNotYellow
            = notYellow[Math.floor(Math.random() * notYellow.length)];
		const notRed = [yellowCard, greenCard, blueCard, wildCard];
		const randomNotRed = notRed[Math.floor(Math.random() * notRed.length)];
		const notGreen = [yellowCard, redCard, blueCard, wildCard];
		const randomNotGreen
            = notGreen[Math.floor(Math.random() * notGreen.length)];
		const notBlue = [yellowCard, redCard, greenCard, wildCard];
		const randomNotBlue
            = notBlue[Math.floor(Math.random() * notBlue.length)];
		const notWild = [yellowCard, redCard, greenCard, blueCard];
		const randomNotWild
            = notWild[Math.floor(Math.random() * notWild.length)];

		function yellowCard() {
			const tempMath = Math.floor(Math.random() * cards.yellow.length);
			if (outOfCards(cards.yellow)) return randomNotYellow();
			if (cards.yellow[tempMath].inPlay >= cards.yellow[tempMath].count)
				return yellowCard();
			cardHand.push(cards.yellow[tempMath]);
			cards.yellow[tempMath].inPlay += 1;
		}

		function redCard() {
			const tempMath2 = Math.floor(Math.random() * cards.red.length);
			if (outOfCards(cards.red)) return randomNotRed();
			if (cards.red[tempMath2].inPlay >= cards.red[tempMath2].count)
				return redCard();
			cardHand.push(cards.red[tempMath2]);
			cards.red[tempMath2].inPlay += 1;
		}

		function greenCard() {
			const tempMath3 = Math.floor(Math.random() * cards.green.length);
			if (outOfCards(cards.green)) return randomNotGreen();
			if (cards.green[tempMath3].inPlay >= cards.green[tempMath3].count)
				return greenCard();
			cardHand.push(cards.green[tempMath3]);
			cards.green[tempMath3].inPlay += 1;
		}

		function blueCard() {
			const tempMath4 = Math.floor(Math.random() * cards.blue.length);
			if (outOfCards(cards.blue)) return randomNotBlue();
			if (cards.blue[tempMath4].inPlay >= cards.blue[tempMath4].count)
				return blueCard();
			cardHand.push(cards.blue[tempMath4]);
			cards.blue[tempMath4].inPlay += 1;
		}

		function wildCard() {
			const tempMath5 = Math.floor(Math.random() * cards.wild.length);
			if (outOfCards(cards.wild)) return randomNotWild();
			if (cards.wild[tempMath5].inPlay >= cards.wild[tempMath5].count)
				return wildCard();
			cardHand.push(cards.wild[tempMath5]);
			cards.wild[tempMath5].inPlay += 1;
		}

		switch (math) {
		case 1:
			yellowCard();
			break;
		case 2:
			redCard();
			break;
		case 3:
			greenCard();
			break;
		case 4:
			blueCard();
			break;
		case 5:
			wildCard();
			break;
		}
		counter++;
	} while (counter < amount);
	discordUNO.gameCards.set(message.channel.id, cards);
	return cardHand;
}

async function returnCards(message, cards) {

	// * should be stable
	const gameCards = discordUNO.gameCards.get(message.channel.id);
	for (const card of cards) {
		let userdCard;
		switch (card.color) {
		case "red":
			userdCard = gameCards.red.find((c) => c.name === card.name);
			userdCard.inPlay -= 1;
			break;
		case "yellow":
			userdCard = gameCards.yellow.find((c) => c.name === card.name);
			userdCard.inPlay -= 1;
			break;
		case "blue":
			userdCard = gameCards.blue.find((c) => c.name === card.name);
			userdCard.inPlay -= 1;
			break;
		case "green":
			userdCard = gameCards.green.find((c) => c.name === card.name);
			userdCard.inPlay -= 1;
			break;
		case null:
			userdCard = gameCards.wild.find((c) => c.name === card.name);
			userdCard.inPlay -= 1;
			break;
		}
	}
}

async function displayWinners(message, foundWinners) {

	// * should be stable
	const canvas = canvas_1.default.createCanvas(700, 500);
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#282a2c";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#2e3033";
	ctx.fillRect(0, 0, canvas.width, 25);
	ctx.fillRect(0, 0, 25, canvas.height);
	ctx.fillRect(canvas.width - 25, 0, canvas.width, canvas.height);
	ctx.fillRect(0, canvas.height - 25, canvas.width, canvas.height);
	const podium = await canvas_1.default.loadImage(
		"./assets/podium/podium.png",
	);
	ctx.drawImage(
		podium,
		canvas.width / 7 + 5,
		canvas.height / 2 - 50,
		500,
		190,
	);
	ctx.strokeStyle = "#282a2c";
	let x1 = 110;
	ctx.font = "15px manropebold";
	for (let i = 0; i < foundWinners.length; i++) {
		const winner = foundWinners[i];
		const avatarURL = message.guild.members.cache
			.get(winner.id)
			.user.displayAvatarURL({ format: "png" });
		const avatar = await canvas_1.default.loadImage(avatarURL);
		ctx.save();
		switch (i) {
		case 0:
			ctx.beginPath();
			ctx.arc(
				canvas.width / 2,
				canvas.height / 2 - 100,
				50,
				0,
				2 * Math.PI,
				true,
			);
			ctx.stroke();
			ctx.clip();
			ctx.drawImage(
				avatar,
				canvas.width / 2 - 50,
				canvas.height / 2 - 150,
				100,
				100,
			);
			ctx.closePath();
			break;
		case 1:
			ctx.beginPath();
			ctx.arc(
				355 / 2 + 20,
				canvas.height / 2 - 50,
				50,
				0,
				2 * Math.PI,
				true,
			);
			ctx.stroke();
			ctx.clip();
			ctx.drawImage(
				avatar,
				355 / 2 + 20 - 50,
				canvas.height / 2 - 100,
				100,
				100,
			);
			ctx.closePath();
			break;
		case 2:
			ctx.beginPath();
			ctx.arc(
				canvas.width / 2 + 355 / 2 - 20,
				canvas.height / 2 - 35,
				50,
				0,
				2 * Math.PI,
				true,
			);
			ctx.stroke();
			ctx.clip();
			ctx.drawImage(
				avatar,
				canvas.width / 2 + 355 / 2 - 20 - 50,
				canvas.height / 2 - 35 - 50,
				100,
				100,
			);
			ctx.closePath();
			break;
		default:
			const placement
                    = i === 3
                    	? "4th"
                    	: i === 4
                    		? "5th"
                    		: i === 5
                    			? "6th"
                    			: i === 6
                    				? "7th"
                    				: i === 7
                    					? "8th"
                    					: i === 8
                    						? "9th"
                    						: "10th";
			ctx.fillStyle = "#ffffff";
			ctx.beginPath();
			ctx.textAlign = "center";
			ctx.fillText(placement, x1, canvas.height - 70 - 25);
			ctx.arc(x1, canvas.height - 60, 25, 0, Math.PI * 2, true);
			ctx.stroke();
			ctx.clip();
			ctx.drawImage(avatar, x1 - 25, canvas.height - 60 - 25, 50, 50);
			ctx.closePath();
			x1 += 80;
			break;
		}
		ctx.restore();
	}
	return canvas.toBuffer("image/png");
}

async function endGame(message) {

	// * should be stable
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game to end... Try making one instead!",
		);
	if (foundGame.creator !== message.author.id)
		return message.channel.send(
			"You can't end this game! Only the creator can end this game!",
		);
	if (!foundGame.active)
		return message.channel.send(
			"You can't end a game that hansn't started yet!",
		);
	const foundWinners = discordUNO.winners.get(message.channel.id);
	const sortedUsers = foundGame.users.sort(
		(a, b) => a.hand.length - b.hand.length,
	);
	const length = sortedUsers.length;
	for (let i = 0; i < length; i++) {
		foundWinners.push({ id: sortedUsers[i].id });
	}
	foundGame.users = [];
	discordUNO.storage.set(message.channel.id, foundGame);
	discordUNO.winners.set(message.channel.id, foundWinners);
	const winnersImage = await displayWinners(message, foundWinners);
	discordUNO.storage.delete(message.channel.id);
	discordUNO.gameCards.delete(message.channel.id);
	discordUNO.winners.delete(message.channel.id);
	return message.channel.send(
		`The game has been ended by ${message.author}! Scores have been calculated.`,
		{
			files: [new Discord.MessageAttachment(winnersImage)],
		},
	);
}

function UNO(message) {
	const foundGame = discordUNO.storage.get(message.channel.id);
	if (!foundGame)
		return message.channel.send(
			"There is no game in this channel to call people out in!",
		);
	if (!foundGame.active)
		return message.channel.send(
			"This game hasn't started yet, you can't do that in a game that hasn't started yet!",
		);
	const user = message.mentions.users.first() || message.author;
	const Embed = new Discord.MessageEmbed()
		.setAuthor(user.username, user.displayAvatarURL({ format: "png" }))
		.setColor(discordUNO.embedColor);
	if (user.id === message.author.id) {
		if (foundGame.users.find((u) => u.id === user.id).safe)
			return message.channel.send(
				"You are already safe, did you mean to mention someone?",
			);
		if (foundGame.users.find((u) => u.id === user.id).hand.length > 1)
			return message.channel.send(
				"You can't use this command when you have more than one card left in your hand!",
			);
		foundGame.users.find((u) => u.id === user.id).safe = true;
		discordUNO.storage.set(message.channel.id, foundGame);
		return message.channel.send(`${user.tag}, you are now safe!`);
	} else {
		if (user.bot)
			return message.channel.send("Bots can't play this game silly.");
		if (!foundGame.users.some((u) => u.id === user.id))
			return message.channel.send("That user isn't in the game silly.");
		const playerData = foundGame.users.find((u) => u.id === user.id);
		const authorData = foundGame.users.find(
			(u) => u.id === message.author.id,
		);
		const newCards = createCards(message, 2, false);
		if (playerData.safe) {
			return message.channel.send(
				`OOPS! Looks like that person was safe ${message.author}!`,
			);
		} else {
			if (playerData.hand.length === 1) {
				newCards.forEach((c) => playerData.hand.push(c));
				discordUNO.storage.set(message.channel.id, foundGame);
				const channel = message.client.channels.cache.get(
					foundGame.users.find((u) => u.id === user.id).DM.channelId,
				);
				const msg = channel.messages.cache.get(
					foundGame.users.find((u) => u.id === user.id).DM.messageId,
				);
				msg.channel.send(`${user}`).then((m) => m.delete());
				Embed.setDescription(
					`Looks like you were called out on 1 card left! You drew 2 cards. Your new hand has ${
						playerData.hand.length
					} cards.\n\n${playerData.hand
						.map((c) => c.name)
						.join(" | ")}`,
				);
				msg.edit("", { embed: Embed });
				return message.channel.send(
					`${user.tag} was called out by ${message.author.tag} on 1 card left! They drew 2 more cards.`,
				);
			} else {
				newCards.forEach((c) => authorData.hand.push(c));
				discordUNO.storage.set(message.channel.id, foundGame);
				const channel = message.client.channels.cache.get(
					foundGame.users.find((u) => u.id === user.id).DM.channelId,
				);
				const msg = channel.messages.cache.get(
					foundGame.users.find((u) => u.id === user.id).DM.messageId,
				);
				msg.channel.send(`${user}`).then((m) => m.delete());
				Embed.setDescription(
					`Oops! Looks like that person didn't have 1 card left! You drew 2 cards. Your new hand has ${
						authorData.hand.length
					} cards.\n\n${authorData.hand
						.map((c) => c.name)
						.join(" | ")}`,
				);
				msg.edit("", { embed: Embed });
				return message.channel.send(
					`OOPS! Looks like that person didn't have 1 card left! ${message.author.tag} drew 2 cards!`,
				);
			}
		}
	}
}

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
