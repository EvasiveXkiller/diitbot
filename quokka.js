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
            "I gon go sleep now"
        ],
	},
    {
		Name: "Carlson",
		Quotes: [
            "Hi Back, I'm dad",
            "I can finish myself also",
            "Your halal very noisy",
            "Can you hear the driller"
        ],
	},
]

let userinput = "Jack";

const fusejs = require("fuse.js")
const options = {
    includeScore: true,
    keys: ["Name"]
}


let fuse = new fusejs(quotes, options)

let closeMatch = fuse.search(userinput)
let randgen = closeMatch[0].item.Quotes[parseInt(Math.random() * closeMatch[0].item.Quotes.length)]

console.log(randgen)
console.log(closeMatch[0].item.Name) //* author output




// let names = Object.keys(quotes); // * convert json heads to array
// let values = Object.values(quotes); // * locate the actual quotes

// console.log(values.length);
// console.log(values[0].length);

// console.log(names[0]);
// console.log(values[0][0]);

// console.log(names.indexOf(""));
