const Discord = require("discord.js")
const fusejs = require("fuse.js");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);


const client = new Discord.Client();
const prefix = "$";

let quotes = db.get('quotes').write();
const options = {
    includeScore:true,
	keys: ["Name"],
}

let names = []
let dbinput = []
client.once("ready", () => {
    console.log("The International of DIIT Congress is online.");
});

client.on("message", (message) => {
	// * Breaks if the input is not valid
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
	let args = message.content.slice(prefix.length).split(/ +/); // * splits into words array
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
        message.channel.send(`${message.author}` + ", Do you want to try saving yourself as pdf? It might work though. Saving space as an added bonus")
    }
    if(command === "dbtest") {
        //let userinput = message.content.replace("iconic" ,"").trim()
        const filter = m => m.content
        const collector = message.channel.createMessageCollector(filter, { 
            time: 15000,
            max:2
        });

        collector.on('collect', m => {
            if(m.content == "$dbtest") {
                message.channel.send("In Progress. Cannot start another instance!")
                return
            }
            if(dbinput.length == 0) {
                message.channel.send("Please enter the second variable")
            }
            console.log(m.content);
            dbinput.push(m.content)
        });

        collector.on('end', m => {
            message.channel.send("Done")
            console.log("end")
            message.channel.send("First input is " + dbinput[0])
            message.channel.send("2nd " + dbinput[1])
            dbinput.length = 0
        });
    }
    if(command == "dbview") {
        message.channel.send(quotes)
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
