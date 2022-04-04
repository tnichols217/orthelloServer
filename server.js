var express = require('express');
const { exec } = require("child_process");
const fs = require('fs');
var app = express();

app.get('*', function (req, res) {
    ID = req.params['0'].slice(1)
    if (ID.length < 2) {
        res.send("See if you can figure out how to use this thing :p")
        return
    }
    console.log(ID)
    if (ID == "favicon.ico") {
        console.log("sending favicon")
        res.send(__dirname + "favicon.ico")
    }
    if (!fs.existsSync(__dirname + "/boards/" + ID + ".svg")) {
        exec("python main.py -o ./boards/".concat(ID).concat(".svg -i ").concat(ID), (error, stdout, stderr) => {
            res.sendFile(__dirname + "/boards/" + ID + ".svg");
        });
    }
    else {

        res.sendFile(__dirname + "/boards/" + ID + ".svg");
    }
})

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})