const Discord = require("discord.js")
const fusejs = require("fuse.js");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);


const client = new Discord.Client();
const prefix = "$";

const options = {
    includeScore:true,
	keys: ["Name"],
}

let names = []
let dbinput = []
client.once("ready", () => {
    client.user.setPresence({
        status : 'dnd',
        activity :{
            name : "dead",
            type: "STREAMING",
            url:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    });
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
            for (let index = 0; index < db.get('quotes').write().length; index++) {
                //console.log(quotes[index].Name)
                names.push(db.get('quotes').write()[index].Name)
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
    if(command === "dbinsert") {
        //let userinput = message.content.replace("iconic" ,"").trim()
        let embedinstruction = new Discord.MessageEmbed({
            title: "Instructions",
            description: "1)Enter the name, then press [ Enter ] to continue\n 2)Enter the quote, press [ Enter ] when complete",
            footer : {
                text : "Custom Implementation"
            }
        })
        message.channel.send(embedinstruction)
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
            console.log(m.content);
            dbinput.push(m.content)
        });

        collector.on('end', m => {
            let embedcomfirm = new Discord.MessageEmbed({
                title: "Confirm?",
                description: "Name : " + dbinput[0] + "\n" + "Quote: " + dbinput[1],
                footer : {
                    text : "Are you sure to execute command? Type [ cancel ] to abort"
                }
            })
            message.channel.send(embedcomfirm)


            db.get('quotes').find({ Name : "Carlson" }).push("Something").write()

            const filter = comfirm => comfirm.content
            const comfirmcollector = message.channel.createMessageCollector(filter, { 
                max:1
            });
                comfirmcollector.on("collect", comfirm => {
                    if(comfirm.content == "accept" || message.author.bot) {
                        let namesarray = db.get("quotes").map("Name").value()
                        if(!namesarray.includes(dbinput[0])) {
                            message.channel.send("Name doesnt exists. Please contact database admin to add into database manually")
                            return
                        } else {
                            message.channel.send(dbinput[0])
                            message.channel.send(dbinput[1])
                        }
                        message.channel.send("Commited to database")
                    } else {
                        message.channel.send("Query Aborted")
                    }
                })
                comfirmcollector.on("end" , () => {
                    message.channel.send("Execution done")
                    dbinput = []
                })
        });
    }
    if(command == "dbview") {
        message.channel.send(db.getState())
    }
})

function query(input){
    let fuse = new fusejs(db.get('quotes').write(), options);
    let closeMatch = fuse.search(input);
    if(closeMatch.length == 0) {
        return ["No user found","", "NULL"]
    }
    console.log(closeMatch)
	let randgen = closeMatch[0].item.Quotes[parseInt(Math.random() * closeMatch[0].item.Quotes.length)]
    return [closeMatch[0].item.Name, randgen, closeMatch[0].score] 
}   

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs");
