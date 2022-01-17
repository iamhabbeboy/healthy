"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupClassifier = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const fs_1 = require("fs");
class ImageModel {
    constructor(signaturePath) {
        this.outputKey = "Confidences";
        const signatureData = (0, fs_1.readFileSync)(signaturePath, "utf8");
        this.signature = JSON.parse(signatureData);
        this.modelPath = `file://dataset/${this.signature.filename}`;
        [this.width, this.height] = this.signature.inputs.Image.shape.slice(1, 3);
        this.outputName = this.signature.outputs[this.outputKey].name;
        this.classes = this.signature.classes.Label;
        this.exportModelVersion = this.signature.export_model_version;
        this.latestModelVersion = 1;
    }
    checkVersion() {
        if (this.exportModelVersion !== this.latestModelVersion) {
            console.log("Exported model version doesn't match this sample. If there are issues, please export a new model");
        }
    }
    async load() {
        this.checkVersion();
        this.model = await tf.loadGraphModel(this.modelPath);
    }
    dispose() {
        if (this.model) {
            this.model.dispose();
        }
    }
    async predict(image) {
        if (!!this.model) {
            const confidencesTensor = tf.tidy(() => {
                const [imgHeight, imgWidth] = image.shape.slice(0, 2);
                const normalizedImage = tf.div(image, tf.scalar(255));
                const reshapedImage = normalizedImage.reshape([1, ...normalizedImage.shape]);
                let top = 0;
                let left = 0;
                let bottom = 1;
                let right = 1;
                if (imgHeight != imgWidth) {
                    const size = Math.min(imgHeight, imgWidth);
                    left = (imgWidth - size) / 2 / imgWidth;
                    top = (imgHeight - size) / 2 / imgHeight;
                    right = (imgWidth + size) / 2 / imgWidth;
                    bottom = (imgHeight + size) / 2 / imgHeight;
                }
                const croppedImage = tf.image.cropAndResize(reshapedImage, [[top, left, bottom, right]], [0], [this.height, this.width]);
                if (this.model) {
                    return this.model.execute({ [this.signature.inputs.Image.name]: croppedImage }, this.outputName);
                }
            });
            if (confidencesTensor) {
                const confidencesArray = await confidencesTensor.data();
                console.log(confidencesArray);
                confidencesTensor.dispose();
                const output = [];
                for (let i = 0; i < this.classes.length; i++) {
                    output.push({ label: this.classes[i], confidence: confidencesArray[i] });
                }
                output.sort((a, b) => { return a.confidence > b.confidence ? -1 : 1; });
                return { predictions: output };
            }
        }
        else {
            console.error("Model not loaded, please await this.load() first.");
        }
    }
}
async function setupClassifier(imgPath, serverResponse) {
    const image = await fs_1.promises.readFile(imgPath);
    const decodedImage = tf.node.decodeImage(image, 3);
    const model = new ImageModel('dataset/signature.json');
    await model.load();
    const results = await model.predict(decodedImage);
    serverResponse.send(results);
    model.dispose();
}
exports.setupClassifier = setupClassifier;
//# sourceMappingURL=tfjs.js.map