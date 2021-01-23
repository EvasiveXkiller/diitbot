const Discord = require("discord.js");

const client = new Discord.Client();

const prefix = "$";

client.once("ready", () => {
	console.log("The International of DIIT Congress is online.");
});

client.on("message", (message) => {
    // * Breaks if the input is not valid
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
	let args = message.content.slice(prefix.length).split(/ +/); // ! i have no idea what it does
	let command = args.shift().toLowerCase();

    console.log(message.author.username+ "\n");
    console.log(message.content)
	// const args = message.content.slice(prefix.length).split(/ +/);
	// const command = args.shift().toLowerCase();

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
    }
    console.log(message.author.username)
	if (command === "embed") {
		let embed = new Discord.MessageEmbed()
			.setTitle("This is Embed Title")
			.setDescription("aaaaaaaaaa")
			.setColor(0xff0000)
            .setFooter("This is a Foot");
		message.channel.send(`${message.author},`,embed);
	}
	if (command === "hello") {
        message.channel.send("hey," + `${message.author},`);
        message.channel.send("I love shit");
	} else if (command == "destroy") {
		message.channel.send("bot going offline");
		client.destroy();
	}   
	else if(command === "avatar"){
		message.reply(message.author.displayAvatarURL());
	}
else if(command === "ping"){
	const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
	}
	else if(command === "sum"){
		const numArgs = args.map(x => parseFloat(x));
		const sum = numArgs.reduce((counter, x) => counter += x);
		message.reply(`The sum of all the arguments you provided is ${sum}!`);
	}
	else if(command === "pic"){
let logo = 'https://www.google.com/search?q=yongxian+gif&sxsrf=ALeKk03EH27vRjKX5hEetTQl6sPOsGKaOQ:1611368652726&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiW_5aBgLHuAhW0yDgGHRlzBWIQ_AUoAXoECA4QAw&biw=1536&bih=754#imgrc=1ZHKSg5AOsQqXM'

let hey = new Discord.MessageEmbed()
.setTitle('Example Text Embed')
.setURL('https://www.google.com/search?q=yongxian+gif&sxsrf=ALeKk03EH27vRjKX5hEetTQl6sPOsGKaOQ:1611368652726&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiW_5aBgLHuAhW0yDgGHRlzBWIQ_AUoAXoECA4QAw&biw=1536&bih=754#imgrc=1ZHKSg5AOsQqXM')
.setAuthor(message.author.username)
.setImage(logo)
.setThumbnail(logo)
.setFooter('This is a Footer')
.setColor('#00AAFF')
message.channel.send(hey)
	}
});
client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
