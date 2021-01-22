const Discord = require("discord.js");

const client = new Discord.Client();

const prefix = "$";

client.once("ready", () => {
	console.log("The International of DIIT Congress is online.");
});

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
    // console.log(message);
	let args = message.content.slice(prefix.length).split(/ +/); // ! i have no idea what it does
    let command = args.shift().toLowerCase();

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

if(message.content === "embed"){
    let embed = new Discord.MessageEmbed()
    .setTitle("This is Embed Title")
    .setDescription("aaaaaaaaaa")
    .setColor("Red")
    .setFooter("This is a Foot")
    message.channel.send(embed)
}
	if (command === "hello ${user.tag}") {
    // console.log(command);
    // console.log("something");
    console.log(message.author.username)
	if (command === "embed") {
		let embed = new Discord.MessageEmbed()
			.setTitle("This is Embed Title")
			.setDescription("aaaaaaaaaa")
			.setColor(0xff0000)
			.setFooter("This is a Foot");
		message.channel.send(embed);
	}
	if (command === "hello") {
		message.channel.send("hey!");
	} else if (command == "destroy") {
        message.channel.send("bot going offline");
        client.destroy();
	}
});
client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
