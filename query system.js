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
];

let userinput = "iconic ";

console.log(userinput.replace("iconic" ,"").trim().toLowerCase())

const fusejs = require("fuse.js");
const options = {
	includeScore: true,
	keys: ["Name"],
};
let names = [];

if (userinput !== null) {
	for (let index = 0; index < quotes.length; index++) {
		//console.log(quotes[index].Name)
		names.push(quotes[index].Name);
	}
	//console.log(names[parseInt(Math.random() * names.length)])
	query(names[parseInt(Math.random() * names.length)]);
} else {
	query(userinput);
}

function query(input) {
	let fuse = new fusejs(quotes, options);

	let closeMatch = fuse.search(userinput);
	let randgen =
		closeMatch[0].item.Quotes[
			parseInt(Math.random() * closeMatch[0].item.Quotes.length)
		];

	console.log(randgen);
	console.log(closeMatch[0].item.Name); //* author output
}

let prefix = "$"
let message = {
	content : "$something here ashefgsjkhefb afkjahebk"
}

if (!message.content.startsWith("$")) {
	return;
}
console.log(message.content.slice(prefix.length).split(/ +/))
console.log(message.content.slice(prefix.length).split(/ +/).shift().toLowerCase())
console.log(message.content.replace("$something" , ""))
console.log(message.content)
