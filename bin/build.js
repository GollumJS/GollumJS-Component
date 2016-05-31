

console.log ("=== Build GollumJS Component ===");

var exec = require('child_process').exec;
fs = require('fs');

var build = function () {

	fs.readFile(__dirname + "/../include.json", "utf8", function (err, data) {
		if (err) throw err;

		var files = JSON.parse(data);

		fs.readFile(__dirname + "/../package.json", "utf8", function (err, data) {
			if (err) throw err;

			var package = JSON.parse(data);
			var content = "";

			for (var i = 0; i < files.length; i++) {


				var buf = fs.readFileSync(__dirname + "/../" + files[i], "utf8");

				content += buf + "\n\n";
			}

			fs.writeFile(__dirname + "/../build/" + package.name + ".js", content, function (err) {
				if (err) {
					return console.error(err);
				}
				console.log(__dirname + "/../build/" + package.name + ".js" + " => OK");
			});
			fs.writeFile(__dirname + "/../build/" + package.name + "-min.js", content, function (err) {
				if (err) {
					return console.error(err);
				}
				console.log(__dirname + "/../build/" + package.name + "-min.js" + " => OK");
			});
			fs.writeFile(
				__dirname + "/../index.js",
				content,
				function (err) {
					if (err) {
						return console.error(err);
					}
					console.log(__dirname + "/../index.js => OK");
				}
			);
		});
	});
};

var pack = function () {
	var command = 'node '+__dirname+'/pack-component.js --web-path '+__dirname+'/../web';
	console.log('Run:', command);
	exec(command, function (error, stdout, stderr) {
		console.log(stdout);
		console.error(stderr);
		if (error !== null) {
			console.error('exec error: ' + error);
		}
		console.log('=== End pack GollumJSCompoent ===');
		build();
	});
};
pack();
