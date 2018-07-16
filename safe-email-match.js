#!/usr/bin/env node

/*!
* safe-email-match
*
* Copyright (c) 2018 Darren Smith.
* Licensed under the [TBC] license.
*/

;!function(undefined) {

	// Initiate Global Object
	var main = {};

	// Set Configuration
	main.hashSalt = "";
	main.localEmailCsvPath = "./email-db/local.csv";
	main.thirdPartyEmailCsvPath = "./email-db/thirdparty.csv";
	main.outputEmailCsvPath = "./email-db/output.csv";

	// Initiate email repositories
	main.localEmailCSV = "";
	main.thirdPartyEmailCSV = "";
	main.localEmails = [];
	main.thirdPartyEmails = [];
	main.thirdPartyEmailsIndexed = {};
	main.outputEmails = [];
	main.outputCSV = "";
	main.generate = {};
	main.match = {};

	// (Match) Include Library Modules
	main.parse = require('csv-parse');
	main.stringify = require('csv-stringify');
	main.fs = require('fs');
	main.crypto = require('crypto');

	// (Match) Import CSV Files
	main.match.importCSVFiles = function(){
		console.log(" - (Match) Importing CSV Files");
		var localEmailsLoaded = false;
		var thirdPartyEmailsLoaded = false;
		main.fs.readFile(main.localEmailCsvPath, 'utf8', function (err,data) { 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.localEmailCSV = data; 
				localEmailsLoaded = true;
				if(localEmailsLoaded && thirdPartyEmailsLoaded){ main.match.parseCSVFiles(); }
			} 
		});
		main.fs.readFile(main.thirdPartyEmailCsvPath, 'utf8', function (err,data) { 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.thirdPartyEmailCSV = data; 
				thirdPartyEmailsLoaded = true;
				if(localEmailsLoaded && thirdPartyEmailsLoaded){ main.match.parseCSVFiles(); }
			}
		});
	};

	// (Match) Parse Imported CSV Files 
	main.match.parseCSVFiles = function(){
		console.log(" - (Match) Parsing CSV Files");
		var localEmailsParsed = false;
		var thirdPartyEmailsParsed = false;
		main.parse(main.localEmailCSV, {}, function(err, output){ 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.localEmails = output; 
				localEmailsParsed = true;
				if(localEmailsParsed && thirdPartyEmailsParsed) { main.match.indexHashes(); }
			}
		});
		main.parse(main.thirdPartyEmailCSV, {}, function(err, output){ 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.thirdPartyEmails = output; 
				thirdPartyEmailsParsed = true;
				if(localEmailsParsed && thirdPartyEmailsParsed) { main.match.indexHashes(); }				
			} 
		});		
	}

	// (Match) Index Third Party Hash Repository
	main.match.indexHashes = function(){
		console.log(" - (Match) Indexing Hashes");
		for (var i = 0; i < main.thirdPartyEmails.length; i++) { main.thirdPartyEmailsIndexed[main.thirdPartyEmails[i][0]] = main.thirdPartyEmails[i][0]; }
		main.match.hashAndCompare();	
	}

	// (Match) Hash local Email Database, Compare and Write to Output Object
	main.match.hashAndCompare = function(){
		console.log(" - (Match) Hashing local Email Database and Comparing to Third Party Hashes");
		for (var i = 0; i < main.localEmails.length; i++) {
			var saltedEmail = main.localEmails[i][0] + main.hashSalt;
			var shasum = main.crypto.createHash('sha1');
			shasum.update(saltedEmail);
			main.localEmails[i][1] = shasum.digest('hex');
			if(main.thirdPartyEmailsIndexed[main.localEmails[i][1]]){
				main.outputEmails.push([main.localEmails[i][0],main.localEmails[i][1],main.thirdPartyEmailsIndexed[main.localEmails[i][1]]]);
			}
		}
		main.match.generateOutput();
	}

	// (Match) Generate Output CSV
	main.match.generateOutput = function(){
		console.log(" - (Match / Generate) Generating Output CSV and Saving to Disk");
		main.stringify(main.outputEmails, function(err, output){
			main.outputCSV = output;
			main.fs.writeFile(main.outputEmailCsvPath, main.outputCSV, function(err) {
				if(err) { return console.log(err); }
				console.log("Output CSV Saved Successfully");
				process.exit(0);
			});
		});		
	}

	// (Generate) Import CSV File
	main.generate.importCSVFile = function(){
		console.log(" - (Generate) Importing CSV File");
		main.fs.readFile(main.localEmailCsvPath, 'utf8', function (err,data) { 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.localEmailCSV = data;
				main.generate.parseEmailAddresses();
			} 
		});
	}

	// (Generate) Parse Email Addresses
	main.generate.parseEmailAddresses = function(){
		console.log(" - (Generate) Parsing CSV File");
		main.parse(main.localEmailCSV, {}, function(err, output){ 
			if (err) { 
				console.log(err); 
				process.exit(0);
			} else {
				main.localEmails = output; 
				main.generate.hashEmailAddresses();
			}
		});
	}

	// (Generate) Hash Email Addresses
	main.generate.hashEmailAddresses = function(){
		console.log(" - (Generate) Hashing Local Email Database");
		for (var i = 0; i < main.localEmails.length; i++) {
			var saltedEmail = main.localEmails[i][0] + main.hashSalt;
			var shasum = main.crypto.createHash('sha1');
			shasum.update(saltedEmail);
			main.localEmails[i][0] = shasum.digest('hex');
			main.outputEmails.push([main.localEmails[i][0]]);
		}
		main.match.generateOutput();
	}

	// Render Startup Banner to Command-Line User
	console.log("");
	console.log("----------------------------");
	console.log("Safe Email Match");
	console.log("Copyright 2018, Darren Smith");
	console.log("----------------------------");
	console.log("");

	// Clean up command line inputs
	if(process.argv[0].endsWith("sudo") && process.argv[1].endsWith("node") && !process.argv[2].startsWith("--max_old_space_size")) { var i = 3 }
	else if(process.argv[0].endsWith("sudo") && process.argv[1].endsWith("node") && process.argv[2].startsWith("--max_old_space_size")) { var i = 4 }
	else if (process.argv[0].endsWith("sudo") && !process.argv[1].endsWith("node") && !process.argv[2].startsWith("--max_old_space_size")) { var i = 2 }
	else if (process.argv[0].endsWith("sudo") && !process.argv[1].endsWith("node") && process.argv[2].startsWith("--max_old_space_size")) { var i = 3 }
	else if (process.argv[0].endsWith("node") && !process.argv[1].startsWith("--max_old_space_size")) { var i = 2 }
	else if (process.argv[0].endsWith("node") && process.argv[1].startsWith("--max_old_space_size")) { var i = 3 }
	else if (!process.argv[0].endsWith("node") && !process.argv[1].startsWith("--max_old_space_size")) { var i = 1 }
	else if (!process.argv[0].endsWith("node") && process.argv[1].startsWith("--max_old_space_size")) { var i = 2 }
	else { var i = 1 }

	// Checks if user is running Match, and Execute Match Pipeline if so
	if (process.argv[i] == "match") {
		main.localEmailCsvPath = process.argv[i+1];
		main.thirdPartyEmailCsvPath = process.argv[i+2];
		main.outputEmailCsvPath = process.argv[i+3];
		main.hashSalt = process.argv[i+4];
		console.log("Running Match...");
		main.match.importCSVFiles();
	}

	// Checks if user is running Generate, and Execute Generate Pipeline if so
	else if (process.argv[i] == "generate") {
		main.localEmailCsvPath = process.argv[i+1];
		main.outputEmailCsvPath = process.argv[i+2];
		main.hashSalt = process.argv[i+3];
		console.log("Running Generate...");
		main.generate.importCSVFile();
	}

	// Display command-line help if accepted parameters not included
	else {
		console.log("Usage");
		console.log("-----");
		console.log("");
		console.log("(1) Use Generate to generate a list of hashes from an initial list of email addresses (one email per line, single column CSV):")
		console.log("    > node safe-email-match.js generate input.csv output.csv SALT");
		console.log("");
		console.log("(2) Use Match to compare a list of third party hashes with a local email database and output crossover (first file - one hash per line. second file - one email per line. Both single column):")
		console.log("    > node safe-email-match.js match local.csv thirdparty.csv output.csv SALT");	
		console.log("");
		console.log("");	
	}

}();



