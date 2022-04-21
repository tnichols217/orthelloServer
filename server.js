var express = require('express');
const https = require('https');
const { exec } = require("child_process");
const fs = require('fs');
var app = express();
const uuid = require('uuid')

var activeGames = {

}

var returnBoardWrapper = (ID, res) => {
    if (ID.length == 1) {
        returnBoard("", res)
        return
    }
    returnBoard(ID[1], res)
}

var returnBoard = (ID, res) => {
    if (!fs.existsSync(__dirname + "/boards/b" + ID + ".svg")) {
        exec("python main.py -l -o ./boards/b".concat(ID).concat(".svg -i ").concat(ID), (error, stdout, stderr) => {
            res.sendFile(__dirname + "/boards/b" + ID + ".svg");
        });
    }
    else {

        res.sendFile(__dirname + "/boards/b" + ID + ".svg");
    }
}

var game = (ID, res) => {
    if (ID.length == 2) {
        if (ID[1] == "") {
            res.redirect("../" + ID[0])
            return
        }
        res.redirect("/" + ID.join("/") + "/")
    }
    if (ID.length == 1) {
        var uu = uuid.v4()
        res.redirect("./" + ID[0] + "/" + uu + '/')
        activeGames[uu] = ""
        console.log(activeGames)
        return
    }
    if (ID.length > 2) {

        console.log(activeGames)

        console.log(ID[1])
        if (!(ID[1] in activeGames)) {
            console.log("unknown UUID")
            res.redirect("..")
        }
        console.log(activeGames[ID[1]])
        if (ID[2].length >= activeGames[ID[1]].length) {
            activeGames[ID[1]] = ID[2]
            returnBoard(ID[2], res)
            return
        }
        res.redirect("/" + ID[0] + "/" + ID[1] + "/" + activeGames[ID[1]])
        return
    }
}

var mapDirs = {
    "b": returnBoardWrapper,
    "g": game
}

app.get('*', (req, res) => {
    ID = req.params['0'].slice(1)
    args = req.params['0'].split("/")
    args.shift()
    console.log(args)
    if (args.length < 1) {
        res.send("See if you can figure out how to use this thing :p")
        return
    }

    if (args[0] in mapDirs) {
        mapDirs[args[0]](args, res)
    }
    else {
        res.send("invalid URL")
    }


})

https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/fullchain.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/chain.pem')
}, app)
    .listen(8080);