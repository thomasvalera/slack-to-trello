var express = require('express');
var bodyParser = require('body-parser');
var Trello = require("node-trello");
var trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);

var app = express();
var port = process.env.PORT || 3000;
 
app.use(bodyParser.urlencoded({ extended: true }));
 
function postToTrello(listId, command, text, cb) {
    var regex = /"(.*?)"/g;
    var name = regex.exec(text);
    var desc = regex.exec(text);

    if (name == null || desc == null) {
    	throw new Error('Oh hamburgers! Format is /' + command + ' "card name" "card description"');
    }

	var card_data = {
		"name" : name[1],
		"desc" : desc[1]
	};

	trello.post("/1/lists/" + listId + "/cards", card_data, cb);
}

app.post('/*', function(req, res) {
  	var listId = req.params[0];
    var command = req.body.command,
        text = req.body.text;

    postToTrello(listId, command, text, function(err, data) {
		if (err) throw err;
  		console.log(data);
  		res.status(200).send('created card');
    });
});

// test route
app.get('/', function (req, res) { res.status(200).send('SupportKit.io loves Slack and Trello!') });
 
// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});
 
app.listen(port, function () {
  console.log('Started Slack-To-Trello ' + port);
});