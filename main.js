const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '$';

client.once('ready', () => {
console.log('The International of DIIT Congress is online.');
});

client.on('message', message => {
if(!message.content.startsWith(prefix) || message.author.bot) return;

const args = message.content.slice(prefix.length).split(/ +/);
const command = args.shift().toLowerCase();

if(command === 'hello'){
    message.channel.send('hey!');
}

if(message.content === "embed"){
    let embed = new Discord.MessageEmbed()
    .setTitle("This is Embed Title")
    .setDescription("aaaaaaaaaa")
    .setColor("Red")
    .setFooter("This is a Foot")
    message.channel.send(embed)
}
});

