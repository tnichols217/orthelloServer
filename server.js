var express = require('express');
const { exec } = require("child_process");
const fs = require('fs');
var app = express();

app.get('*', function (req, res) {
    ID = req.params['0'].slice(1)
    if (!fs.existsSync(__dirname + "/boards/" + ID + ".svg")) {
        console.log("generating board")
        exec("python main.py -o ./boards/".concat(ID).concat(".svg -i ").concat(ID), (error, stdout, stderr) => {
            console.log(error, stdout, stderr)
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