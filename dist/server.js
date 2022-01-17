"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tfjs_1 = require("./tfjs");
const express = require('express');
const path = require('path');
const app = express();
const file = require('express-fileupload');
app.use(file());
app.use(express.static('views'));
app.use('/images', express.static('images'));
app.get('/', (req, res) => {
    res.sendFile('index.html');
});
app.post('/classifier', (req, res) => {
    try {
        const imgPath = fileUpload(req);
        (0, tfjs_1.setupClassifier)(imgPath, res);
    }
    catch (err) {
        res.send({ error: 'Error occured while uploading file' });
    }
});
const fileUpload = (req) => {
    try {
        if (!req.files) {
            return;
        }
        const image = req.files.webcam;
        const fileName = image.name;
        const path = `/images/${fileName}`;
        image.mv(path).then((err) => {
            if (err) {
                throw new Error('Unable to move file');
            }
        });
        return path;
    }
    catch (err) {
        console.log(err);
    }
};
let PORT = 3000;
app.listen(PORT);
//# sourceMappingURL=server.js.map