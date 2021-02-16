const { spawn, fork } = require("child_process");
const readline = require("readline"); // * for command line control;

const formatMemoryUsage = (data) =>
	`${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
let mainInstance;
let userkill;

function launch() {
	if (mainInstance != null) {
		console.log(
			"An instance is running, stop manually before executing it"
		);
	}
	// mainInstance = spawn("node", ["main.js"], {
	// 	stdio: ["pipe", "pipe", "pipe", "ipc"],
	// });
	mainInstance = fork("./main.js", [], { silent: true });
	mainInstance.stdout.on("data", (data) => {
		console.log("stdout: " + data);
	});

	mainInstance.stderr.on("data", (data) => {
		console.log(data.toString());
		console.log("> ");
	});

	mainInstance.on("message", (data) => {
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
			console.log(localmem);
		}
		if (data.title == "reset") {
			console.log(data);
			mainInstance.send("userkill");
			userkill = true;
		}
	});

	mainInstance.on("error", (err) => {
		console.log(err);
	});

	mainInstance.on("exit", () => {
		if (userkill == true) {
			relaunch();
			userkill = false;
		}
		console.log("Status: Exited successfully");
		process.stdout.write("> ");
		mainInstance = undefined;
	});
}

rl.on("line", (data) => {
	if (data == "mem") {
		if (mainInstance != null) {
			mainInstance.send("memusage");
		}
	}
	if (data == "kill") {
		if (mainInstance != null) {
			mainInstance.send("kill");
		}
	}
	if (data === "start") {
		if (mainInstance == null) {
			launch();
		}
	}
	if (data === "state") {
		if (mainInstance != null) {
			console.log("An instance is running");
		} else {
			console.log("No Instance running");
		}
	}
	if (data == "parentexit") {
		if (mainInstance != null) {
			console.log(
				"An instance is running, stop manually before executing it"
			);
		} else {
			process.exit();
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
		launch();
	}, 30000);
}

onBoot();
