const Discord = require("discord.js")
const fusejs = require("fuse.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const client = new Discord.Client();
const prefix = "$";
const options = {
    includeScore:true,
	keys: ["Name"],
}

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt:"cmd@diit:: "
})

function cmdinput() {
    rl.prompt();
    rl.on('line',(line) => {
        switch(line) {
            case "echo":
                console.log("Replied: " + line)
                break
            case stop:
                console.log("Stopping Immediately")
                client.destroy();
                break
            case "listdb":
                console.log("testdb")
            default:
                console.log("Unknown command")
                break
        }
        rl.prompt();
    })
}

let names = []
let quotes = [
    {
        Name: "Yong Xian",
        Quotes: [
            "lol let's go",
            "You Lagging wei",
            "FOS",
            "They have but they don't",
            "Hair can light up the entire kampung wei",
            "We're here for a good time not a long time",
            "When you cough right, does your lungs go upwards ah?",
            "and and",
        ],
    },
    {
        Name: "Zhen Yick",
        Quotes: [
            "Damn tired wei",
            "Damn treshhhh wei",
            "Macam mane oh",
            "My computer dying wei",
            "Wait WHAAt?",
            "Eye pad",
            "I gon go sleep now",
        ],
    },
    {
        Name: "Carlson",
        Quotes: [
            "Hi Back, I'm dad",
            "I can finish myself also",
            "Your halal very noisy",
            "Can you hear the driller",
        ],
    },
]
client.once("ready", () => {
    console.log("The International of DIIT Congress is online.");
    cmdinput()
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
        let output
        let userinput = message.content.replace("iconic" ,"").trim()
        // * random color generator
        let randomColor = Math.floor(Math.random()*16777215).toString(16)
        let date = new Date()
        if (message.content == "$iconic") {
            for (let index = 0; index < quotes.length; index++) {
                //console.log(quotes[index].Name)
                names.push(quotes[index].Name)
            }
            //console.log(names[parseInt(Math.random() * names.length)])
            console.log("branch1")
            output = query(names[parseInt(Math.random() * names.length)])
        } else {
            console.log("branch2")
            output = query(userinput)
        }

        let embed = new Discord.MessageEmbed({
            title: output[1],
            description:output[0],
            color: randomColor.toUpperCase(),//colors[getRandomArbitrary(0,99)],
            url:"https://www.youtube.com/watch?v=cvh0nX08nRw",
            footer: {
                text:"*The International Server " + date.getFullYear() + "*\n Confidence: " + output[2]
            }
        })
        message.channel.send(embed);
    }
    if(command === "destroy") {
        client.destroy()
    }
    if(command === "help") {
        message.channel.send("Helping?  i Guess not")
        message.channel.send("https://tenor.com/view/jack-triggered-diit-international-gif-19946915")
    }
    if(command === "save") {
        message.channel.send(`${message.author}` + ", Do you want to try saving yourself as pdf?It might work though. Saving space as an added bonus")
    }
})

function query(input){
    let fuse = new fusejs(quotes, options);
    let closeMatch = fuse.search(input);
    if(closeMatch.length == 0) {
        return ["No user found","", "NULL"]
    }
    console.log(closeMatch)
	let randgen = closeMatch[0].item.Quotes[parseInt(Math.random() * closeMatch[0].item.Quotes.length)]
    return [closeMatch[0].item.Name, randgen, closeMatch[0].score] 
}   



  
  

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
