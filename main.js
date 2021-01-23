const Discord = require("discord.js");
const search = require('js-search')

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
    // * quotes generator and publisher
    if(command === "iconic") {
        let quotes = require("./quotes.json")
        let tempvar = Object.values(quotes)
        tempvar[0]
        let randquotes = tempvar[parseInt(Math.random() * tempvar.length)]
        

        // * random color generator
        let randomColor = Math.floor(Math.random()*16777215).toString(16);

        let date = new Date()
        
        let output = new Discord.MessageEmbed({
            title: randquotes[0],
            description:"name",
            color: randomColor.toUpperCase(),//colors[getRandomArbitrary(0,99)],
            url:"https://www.youtube.com/watch?v=cvh0nX08nRw",
            footer: {
                text:"The International Server " + date.getFullYear()
            }
        })
        let embed = new Discord.MessageEmbed()
        message.channel.send(output);
    }
    if(command === "destroy") {
        client.destroy()
    }
});

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
