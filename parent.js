const { fork } = require("child_process");
const readline = require("readline"); // * for command line control;

const formatMemoryUsage = (data) =>
	`${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
let thread_main;
let thread_music;
let thread_games;
let userkill;

function launchmain() {
	if (thread_main != null) {
		console.log("thread_main running");
	}
	// mainInstance = spawn("node", ["main.js"], {
	// 	stdio: ["pipe", "pipe", "pipe", "ipc"],
	// });
	thread_main = fork("./main.js", [], { silent: true });
	thread_main.stdout.on("data", (data) => {
		console.log("thread_main: ");
		console.log(data.toString());
	});

	thread_main.stderr.on("data", (data) => {
		console.log("thread_main: " + data.toString());
		console.log("> ");
	});

	thread_main.on("message", (data) => {
		if (data.title == "memusage") {
			let localdata = data.respond;
			let localmem = {
				rss: `${formatMemoryUsage(
					localdata.rss
				)} -> Resident Set Size - total memory allocated for the process execution`,
				heapTotal: `${formatMemoryUsage(
					localdata.heapTotal
				)} -> total size of the allocated heap`,
				heapUsed: `${formatMemoryUsage(
					localdata.heapUsed
				)} -> actual memory used during the execution`,
				external: `${formatMemoryUsage(
					localdata.external
				)} -> V8 external memory`,
			};
			console.log("thread_main: ");
			console.log(localmem);
		}
		if (data.title == "reset") {
			console.log("thread_main: ");
			console.log(data);
			if(thread_games != null) {
				thread_games.send("userkill");
			}
			if(thread_main != null) {
				thread_main.send("userkill");
			}
			if(thread_music != null) {
				thread_music.send("userkill");
			}
			userkill = true;
		}
	});

	thread_main.on("error", (err) => {
		console.log("thread_main: ");
		console.log(err);
	});

	thread_main.on("exit", () => {
		if (userkill == true) {
			relaunch();
			userkill = false;
		}
		console.log("thread_main: Exited successfully");
		process.stdout.write("> ");
		thread_main = undefined;
	});
}

function launchmusic() {
	if (thread_music != null) {
		console.log("thread_music running");
	}
	// mainInstance = spawn("node", ["main.js"], {
	// 	stdio: ["pipe", "pipe", "pipe", "ipc"],
	// });
	thread_music = fork("./thread_music.js", [], { silent: true });
	thread_music.stdout.on("data", (data) => {
		console.log("thread_music: ");
		console.log(data.toString());
	});

	thread_music.stderr.on("data", (data) => {
		console.log("thread_music: " + data.toString());
		console.log("> ");
	});

	thread_music.on("message", (data) => {
		if (data.title == "memusage") {
			let localdata = data.respond;
			let localmem = {
				rss: `${formatMemoryUsage(
					localdata.rss
				)} -> Resident Set Size - total memory allocated for the process execution`,
				heapTotal: `${formatMemoryUsage(
					localdata.heapTotal
				)} -> total size of the allocated heap`,
				heapUsed: `${formatMemoryUsage(
					localdata.heapUsed
				)} -> actual memory used during the execution`,
				external: `${formatMemoryUsage(
					localdata.external
				)} -> V8 external memory`,
			};
			console.log("thread_music: ");
			console.log(localmem);
		}
		if (data.title == "reset") {
			console.log("thread_music: ");
			console.log(data);
			thread_music.send("userkill");
			userkill = true;
		}
	});

	thread_music.on("error", (err) => {
		console.log("thread_music: ");
		console.log(err);
	});

	thread_music.on("exit", () => {
		if (userkill == true) {
			relaunch();
			userkill = false;
		}
		console.log("thread_music: Exited successfully");
		process.stdout.write("> ");
		thread_music = undefined;
	});
}

function launchgames() {
	if (thread_games != null) {
		console.log("thread_games running");
	}
	// mainInstance = spawn("node", ["main.js"], {
	// 	stdio: ["pipe", "pipe", "pipe", "ipc"],
	// });
	thread_games = fork("./thread_games.js", [], { silent: true });
	thread_games.stdout.on("data", (data) => {
		console.log("thread_games:");
		console.log(data.toString());
	});

	thread_games.stderr.on("data", (data) => {
		console.log("thread_games " + data.toString());
		console.log("> ");
	});

	thread_games.on("message", (data) => {
		if (data.title == "memusage") {
			let localdata = data.respond;
			let localmem = {
				rss: `${formatMemoryUsage(
					localdata.rss
				)} -> Resident Set Size - total memory allocated for the process execution`,
				heapTotal: `${formatMemoryUsage(
					localdata.heapTotal
				)} -> total size of the allocated hveap`,
				heapUsed: `${formatMemoryUsage(
					localdata.heapUsed
				)} -> actual memory used during the execution`,
				external: `${formatMemoryUsage(
					localdata.external
				)} -> V8 external memory`,
			};
			console.log("thread_games: ");
			console.log(localmem);
		}
		if (data.title == "reset") {
			console.log("thread_games ");
			console.log(data);
			thread_games.send("userkill");
			userkill = true;
		}
	});

	thread_games.on("error", (err) => {
		console.log("thread_games ");
		console.log(err);
	});

	thread_games.on("exit", () => {
		if (userkill == true) {
			relaunch();
			userkill = false;
		}
		console.log("thread_games: Exited successfully");
		process.stdout.write("> ");
		thread_games = undefined;
	});
}

rl.on("line", (data) => {
	if (data == "mem") {
		if (thread_main != null) {
			if (thread_main != null) {
				thread_main.send("memusage");
			}
			if (thread_games != null) {
				thread_games.send("memusage");
			}
			if (thread_music != null) {
				thread_music.send("memusage");
			}
		}
	}
	if (data == "killall") {
		if (thread_main != null) {
			thread_main.send("kill");
		}
		if (thread_games != null) {
			thread_games.send("kill");
		}
		if (thread_music != null) {
			thread_music.send("kill");
		}
	}
	if (data === "killmain") {
		if (thread_main != null) {
			thread_main.send("kill");
		}
	}
	if (data === "killmusic") {
		if (thread_music != null) {
			thread_music.send("kill");
		}
	}
	if (data === "killgames") {
		if (thread_games != null) {
			thread_games.send("kill");
		}
	}
	if (data === "startmain") {
		if (thread_main == null) {
			launchmain();
		}
	}
	if (data === "startmusic") {
		if (thread_music == null) {
			launchmusic();
		}
	}
	if (data === "startgames") {
		if (thread_games == null) {
			launchgames();
		}
	}
	if (data === "startall") {
		if (
			thread_main == null &&
			thread_games == null &&
			thread_music == null
		) {
			launchgames();
			launchmain();
			launchmusic();
		} else {
			console.log("Some threads are still active");
			console.log("thread_main: " + thread_main);
			console.log("thread_games: " + thread_games);
			console.log("thread_music: " + thread_music);
			console.log("Perform a manual start or manual stop");
		}
	}
	if (data === "status") {
		console.log("thread_main: " + thread_main);
		console.log("thread_games: " + thread_games);
		console.log("thread_music: " + thread_music);
	}
	if (data == "parentexit") {
		if (
			thread_main == null &&
			thread_games == null &&
			thread_music == null
		) {
			process.exit();
		} else {
			console.log(
				"An instance is running, stop manually before executing it"
			);
		}
	}
	process.stdout.write("> ");
});

function onBoot() {
	console.log("International Bot System v1.2.0 © All Rights Reserved");
	console.log("Node: " + process.versions.node);
	process.stdout.write("> ");
}

function relaunch() {
	setTimeout(() => {
		launchmain();
		launchgames();
		launchmusic();
	}, 30000);
}

onBoot();
