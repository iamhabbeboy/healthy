import { setupClassifier } from "./tfjs";
const express = require('express');
const path = require('path');
const app = express();
const file = require('express-fileupload');
app.use(file());

app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});

// route
app.post('/classifier', (req: any, res: any) => {
    try {
        // const imgPath = 'images/okro.jpeg';
        const imgPath = fileUpload(req);
        setupClassifier(imgPath, res);
    } catch (err) {
        res.send({ error: 'Error occured while uploading file' });
    }
});


const fileUpload = (req: any) => {
    try {
        if (!req.files) {
            return;
        }
        const image = req.files.webcam;
        const fileName = image.name;
        const path = `${__dirname}/images/${fileName}`;

        image.mv(path).then((err: any) => {
            if (err) {
                throw new Error('Unable to move file');
            }
        })
        return path;
    } catch (err) {
        console.log(err)
    }
}

// Listening to the port
let PORT = 3000;
app.listen(PORT)