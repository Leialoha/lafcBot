var fs = require('fs');
var path = require('path');

module.exports = (dir, fileTypes = ['.js'], ignore = new RegExp('^-')) => {
	var filesToReturn = [];
	function walkDir(currentPath) {
		var files = fs.readdirSync(currentPath).filter(path => !ignore.test(path));
		for (var i in files) {
			var curFile = path.join(currentPath, files[i]);      
			if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
				filesToReturn.push(curFile.replace(dir, ''));
			} else if (fs.statSync(curFile).isDirectory()) {
				walkDir(curFile);
			}
		}
	};
	walkDir(dir);
	return filesToReturn; 
}
 