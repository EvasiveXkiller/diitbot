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

	console.log(message.author.username + "\n");
	console.log(message.content);

	if (command === "embed") {
        let preprocess = message.content.replace("$embed", "")
        console.log(preprocess)
        let finalmessage = preprocess
		let embed = new Discord.MessageEmbed({
            title:"Download more ram here now",
            description:finalmessage,
            type:"video",
            color:"red",
            url:"https://www.youtube.com/watch?v=cvh0nX08nRw",
            footer:"this is an elephant foot"
        })
		message.channel.send(embed);
    }
    if(command === "moreram") {
        let preprocess = message.content.replace("$embed", "")
        console.log(preprocess)
        let finalmessage = preprocess
		let embed = new Discord.MessageEmbed({
            title:"Download more ram here now",
            description:finalmessage,
            type:"video",
            color:"red",
            url:"https://www.youtube.com/watch?v=cvh0nX08nRw",
            footer:"this is an elephant foot"
        })
		message.channel.send(embed);
    }
    if(command === "dead") {
        let preprocess = message.content.replace("$embed", "")
        console.log(preprocess)
        let finalmessage = preprocess
		let embed = new Discord.MessageEmbed({
            title:"We dead",
            //description:finalmessage,
            image:{
                url:"https://cdn.discordapp.com/attachments/754343242224631811/802079453282697246/unknown.png"
            },
            type:"image",
            color:"red",
            url:"https://cdn.discordapp.com/attachments/754343242224631811/802079453282697246/unknown.png",
            footer:"this is an elephant foot"
        })
		message.channel.send(embed);
    }
	if (command === "hello ${user.tag}") {
		console.log(message.author.username);
	}
	if (command === "hello") {
		message.channel.send("hey!");
	} else if (command == "destroy") {
		message.channel.send("bot going offline");
		client.destroy();
    }
    if(command === "quotes") {
        
    }
});

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
