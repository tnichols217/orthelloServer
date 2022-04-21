var express = require('express');
const https = require('https');
const { exec } = require("child_process");
const fs = require('fs');
var app = express();

app.get('*', function (req, res) {
    ID = req.params['0'].slice(1)
    if (ID.length < 2) {
        res.send("See if you can figure out how to use this thing :p")
        return
    }
    if (ID == "favicon.ico") {
        res.send(__dirname + "favicon.ico")
    }
    if (!fs.existsSync(__dirname + "/boards/" + ID + ".svg")) {
        exec("python main.py -l -o ./boards/".concat(ID).concat(".svg -i ").concat(ID), (error, stdout, stderr) => {
            res.sendFile(__dirname + "/boards/" + ID + ".svg");
        });
    }
    else {

        res.sendFile(__dirname + "/boards/" + ID + ".svg");
    }
})

https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/fullchain.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/heyo.ydns.eu/chain.pem')
}, app)
.listen(8080);