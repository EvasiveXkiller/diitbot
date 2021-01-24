const Discord = require("discord.js")
const fusejs = require("fuse.js");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter)

const client = new Discord.Client();
const prefix = "$";

const options = {
    includeScore:true,
	keys: ["Name"],
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
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
    db.read()
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
        let output, localoutput

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
                while(true) {
                    localoutput = query(names[parseInt(Math.random() * names.length)])
                    if(typeof localoutput[1] !== "undefined") {
                        break
                    }
                    localoutput = []
                }
                output = localoutput
        } else {
            console.log("branch2")
            localoutput = query(userinput)
            if(typeof localoutput[1] === "undefined") {
                localoutput[1] = "[ Empty ]"
            }
            output = localoutput
        }   
        let embed = new Discord.MessageEmbed({
            title: output[1],
            description: "--*" + output[0] + "*",
            color: randomColor.toUpperCase(),//colors[getRandomArbitrary(0,99)],
            url:"https://www.youtube.com/watch?v=cvh0nX08nRw",
            footer: {
                text:"The International Server " + date.getFullYear() + "\n Confidence: " + output[2]
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
                text : "nosql"
            }
        })
        message.channel.send(embedinstruction)
        const filter = m => m.content
        const collector = message.channel.createMessageCollector(filter, { 
            time: 15000,
            max:2
        });

        collector.on('collect', m => {
            if(m.content == "$dbinsert") {
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
                color:"FF9900",
                footer : {
                    text : "Are you sure to execute command? Type [ cancel ] to abort"
                }
            })
            message.channel.send(embedcomfirm)

            const filter = comfirm => comfirm.content
            const comfirmcollector = message.channel.createMessageCollector(filter, { 
                max:1
            });
                comfirmcollector.on("collect", comfirm => {
                    if(comfirm.content == "accept" || message.author.bot) {
                        let namesarray = db.get("quotes").map("Name").value()
                        if(!namesarray.includes(dbinput[0])) {
                            let embed = new Discord.MessageEmbed({
                                title: "Commit Aborted",
                                description : "Name not found in database.\n Please contact admin for more details \nDatabase not modified",
                                color:"FF0000",
                                footer :{
                                    text : "nosql"
                                }
                            })
                            message.channel.send(embed)
                            return
                        } else {
                            let edit = db.get('quotes').find({Name : dbinput[0]}).value()
                            let newdata = [...edit.Quotes]
                            newdata.push(dbinput[1])
                            db.get("quotes")
                                .find({ Name: dbinput[0]})
                                .assign({ Quotes : newdata})
                                .write()
                        }
                        let embed = new Discord.MessageEmbed({
                            title: "Commit Successful",
                            description : "Summary\nName : " + dbinput[0] + "\nData : " + dbinput[1],
                            color: "00FF00",
                            footer :{
                                text : "nosql"
                            }
                        })
                        embed.setTimestamp()
                        message.channel.send(embed)
                    } else {
                        let embed = new Discord.MessageEmbed({
                            title: "Commit Aborted",
                            description : "Database not modified",
                            color: "0000FF",
                            footer :{
                                text : "nosql"
                            }
                        })
                        message.channel.send(embed)
                    }
                })
                comfirmcollector.on("end" , () => {
                    //message.channel.send("Execution done")
                    dbinput = []
                })
        });
    }
    if(command == "dbview") {     
            message.channel.send(JSON.stringify(db.getState())).catch((e) => {
                message.channel.send("String overload!\n" + e)
            })
    }
    if(command == "dbdelete") {
        let userinputpre = message.content.replace("$dbdelete" ,"").trim()
        let userinputSplit = userinputpre.split(",")
        console.log(userinputSplit)
        // * checking begins here
        let allnames = db.get("quotes").map("Name").value()
        if(!allnames.includes(userinputSplit[0])) {
            let messagelocal = new Discord.MessageEmbed({
                title: "Commit Error",
                description: userinputSplit[0] + " is not a valid user in the database\nPlease check the syntax",
                color : "FF0000",
                footer : {
                    text : "nosql"
                }
            })
            messagelocal.setTimestamp()
            message.channel.send(messagelocal)
            return
        }
        let localquotes = db.get("quotes").find({Name : userinputSplit[0]}).get("Quotes").value()
        if(!localquotes.includes(userinputSplit[1])) {
            let messagelocal = new Discord.MessageEmbed({
                title: "Commit Error",
                description: "Quote not found in database\nPlease check the syntax",
                color : "FF0000",
                footer : {
                    text : "nosql"
                }
            })
            messagelocal.setTimestamp()
            message.channel.send(messagelocal)
            return
        }
        let updatedquotes = localquotes.remove(userinputSplit[1])
            db.get("quotes")
            .find({ Name: userinputSplit[0]})
            .assign({ Quotes : updatedquotes})
            .write()
        let messagelocal = new Discord.MessageEmbed({
            title: "Commit Successful",
            description: userinputSplit[0] + " has been removed",
            color : "00FF00",
            footer : {
                text : "nosql"
            }
        })
        messagelocal.setTimestamp()
        message.channel.send(messagelocal)
    }
    // if(command === "jacktest") {
    //     let result = dbjack.get("Monday")
    //     let sendcurrent = ""
    //     let preprocess = Object.entries(result)
    //     for (let index = 0; index < preprocess.length; index++) {
    //         for (let index2 = 0; index2 < preprocess[index].length; index2++) {
    //             sendcurrent + preprocess[index][index2]
    //         }
    //     message.channel.send(sendcurrent)
    //     }
    // }
})
function query(input){
    let fuse = new fusejs(db.get('quotes').write(), options)
    let closeMatch = fuse.search(input);
    if(closeMatch.length == 0) {
        return ["No user found","", "NULL"]
    }
    console.log(closeMatch)
    let randgen = closeMatch[0].item.Quotes[parseInt(Math.random() * closeMatch[0].item.Quotes.length)]
    let result = [closeMatch[0].item.Name, randgen, closeMatch[0].score] 
    console.log(result)
    return result
}   

client.login("ODAyMTE4MTAwMjEyMTIxNjAw.YAqksQ.QkVbWD8IDVzJijJBH0SdZYlqAHs")