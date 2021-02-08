# The International of DIIT

![Node JS](https://cdn.discordapp.com/attachments/708883385140903976/802879722987716658/nodejs-mongodb.png)

> DIIT is a Discord Bot, built on the ground up , reimagined.
  - Built on the modern NodeJS Engine
  - Database powered by lowdb, a variant of MongoDB
  - Dark Magic powers

# Features
  - Timetable System and Reminders
  - Iconic Quotes in Embedded format
  - Integrated Gif finder
  - Integrated Memes finder
  - Dark Mode Friendly
  - Explode
  - Much More...

# Documentation
> Capable Functions include:
- [Iconic](###iconic)
- [Ping](###ping)
- [Help](###help)
- [Timetable Picture](###Timetable (Picture))
- [Timetable](###Timetable)
- [Description](###Description)
- [Gif](###Gif)
- [Memes](###Memes)
- [Play](#Play)
- [Volume](###Volume)
- [Stop](###Stop)
- [Skip](###Skip)
- [Queue](###Queue)
- [Remove from Queue](###Remove&#32;Queue)
- [Disconnect](###Disconnect)
- [Event](###Event)
- [Replacements](###Replacements)
- [Avatar](###Avatar)
- [Profile](###Profile)
---
### Iconic
```
$iconic [name]
where:
  name : optional

returns:
  random iconic quotes
```
If no name is provided then it will select a random name with a valid quote.

---
### Ping
```
$ping

returns:
  API and Bot Measured Latency
```
Display the current ping and bot round trip latency. Bot round trip latency sometimes may be in negative and this is a known issue.

---

### Help
```
$help

returns:
  help menu
```

---

### Timetable (Picture)
```
$timetablepic

returns:
  the current semester's timetable in picture form
```
---

### Description
```
$description

returns:
  the bot's information panel, excluding the help menu
```
---

### Gif
```
$gif [keywords]
where:
  keywords: any relevant tags to the desired gif

returns:
  a gif that matches the provided term.
```
If no gif is provided, an error is displayed

---
### Timetable
```
$timetable [today]
where:
  today : the literal string "today" or the desired weekday.

returns:
  A message that contains the timetable of the day.
```
Weekends are not avaliable and an error is displayed shall the user tries.

---
### Memes
```
$memes

returns:
  A random meme.
```

---
### Play
```
$play [link || songname]

where:
  link : Can be any valid link. See below for compatability
  songname : a song name that will be searched from youtube.

returns:
  Starts playing the requested song, if there is a song playing then it will be added to the queue.
```
User has to be in the same channel as the bot, an error is display shall the user does not met the conditions.

---
### Volume
```
$volume [integer]

where:
  integer : a value between 0 and 200;

returns:
  Sets the bot volume to the desired level.
```

---
### Stop
```
$stop

returns:
  Stops the current song. The bot does not leave the channel.
```

---
### Skip
```
$skip

returns:
  Skips the current playing song
```

---
### Queue
```
$skip

returns:
  Display the current song queue. A progress bar is also displayed for the current playing song.
```

---
### Remove Queue
```
$remove [integer]

where:
  integer : the current song queue number

returns:
  Removes the selected song from the queue.
```
The user is unable to remove the currently playing song from the queue.

---
### Disconnect
```
$dis

returns:
  Stops the bot, clears the currently playing queue and disconnects from the channel
```

---
### Event
```
$event

returns:
  All the events that are stored in the database. A countdown timer is also displayed along wit the date.
```

---
### Replacements
```
$replacements

returns:
  All the replacements class that are currently pending. Only modified by the database admins and developers.
```

---
### Avatar
```
$avatar [username]

where:
  username : the users' discord username. Only accepts tagged user. (including @)
returns:
  The tagged user's current profile picture.
```

---
### Profile
```
$profile [name]

where:
  name : the person's real life name. Strict spelling and punctuation.
returns:
  A custom crafted profile board with various links to other social media pages.
```
---
# Data Manipulation

### Iconic Quotes insert
```
$dbinsert

returns:
  Instructions on how to insert data into the iconic quotes database. Session limited to 15 seconds. Any input typed is accepted, including those from other channels.
```
---
### Iconic Quotes Delete
```
$dbdelete [name],[quote]

where:
  name : User name, strict spelling and punctuation,
  quote: quote to remove from database, much match entry in database. Strict spelling and punctuation.

returns:
  Comfirmation on operation.
```
---

### Events Insert
```
$eventinsert [eventName],[timecode]

where:
  eventName : The desired event name
  timecode :  A timecode. Format : YYYY-MM-DD"T"HHMMSS.

  Example of time code: 2021-02-14T150013

returns:
  Comfirmation on operation.
```
---

# Debug Commands
```
$debug [integer]

where:
  integer is 0 or 1
```
```
$userinfo [taggeduser]

where:
  taggeduser : a user that is tagged in the message.

```


# Tech
> The best discord bot is a bot that is system that is designed from the ground up

The International of DIIT uses a number of open source projects to work properly:

* [node.js](https://nodejs.org/en/) - evented I/O for the backend
* [lowdb](https://github.com/typicode/lowdb) - NoSQL Database for all stored data
* [discord.js](https://discord.js.org/#/) - duh


# Backend

The International of DIIT requires [Node.js](https://nodejs.org/) v12+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd diitbot
$ npm install -d
$ npm start
```

# Contributors

> Below are those who dedicated their time and effort to make this bot a sustainable project
- Tong Ken Soon - Project Initiator [Instagram](https://www.instagram.com/ikenot__/) [Github](https://github.com/TongKenSoon)
- Carlson Tan - Database and Search Engine Implementer [Instagram](https://www.instagram.com/carlson.x.destroyed/) [Github](https://github.com/EvasiveXkiller/)
- Jack Tok - Database Coder [Instagram](hhttps://www.instagram.com/jack_tok_/) [Github](https://github.com/OptimalLego)
- Tong Yong Xian - Databse Maintainer [Instagram](https://www.instagram.com/_yong_xian_/) [Github](https://github.com/YongXian1202)

# Todos

 - More stability Testing
 - Dont Explode

```
$iconic zhenyick
// I gon go sleep now
```
# License

MIT - [EvasiveXkiller](https://github.com/EvasiveXkiller)

