"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib = require("amqplib");
const fs = require("fs");
const yargs = require("yargs");
let queueuser = getParameter(true, 'FILEPUMP_QUEUE_USER', 'u', undefined);
let queuepassword = getParameter(true, 'FILEPUMP_QUEUE_PASSWORD', 'p', undefined);
let queuename = getParameter(true, 'FILEPUMP_QUEUE_NAME', 'q', undefined);
let queueserver = getParameter(true, 'FILEPUMP_QUEUE_SERVER', 's', undefined);
let inputdir = getParameter(true, 'FILEPUMP_INPUT_DIR', 'i', '//inputfiles');
(() => __awaiter(void 0, void 0, void 0, function* () {
    const queue = queuename;
    const conn = yield amqplib.connect('amqp://' + queueuser + ':' + queuepassword + '@' + queueserver);
    const ch1 = yield conn.createChannel();
    yield ch1.assertQueue(queue);
    let filesscanned = [];
    setInterval(() => {
        fs.readdir(inputdir, (err, files) => {
            files.forEach(file => {
                if (!filesscanned.find(element => element === file)) {
                    let messagetostore = {
                        "storagetype": "file",
                        "directory": inputdir,
                        "file": file
                    };
                    console.log(JSON.stringify(messagetostore));
                    ch1.sendToQueue(queue, Buffer.from(JSON.stringify(messagetostore)));
                    filesscanned.push(file);
                }
            });
        });
    }, 1000);
}))();
function getParameter(mandatory, environmentvariablename, argoption, defaultvalue) {
    let valuetoreturn = undefined;
    valuetoreturn = process.env[environmentvariablename];
    if (valuetoreturn === undefined || valuetoreturn === '') {
        let argv = yargs.argv;
        valuetoreturn = argv[argoption];
    }
    if (valuetoreturn === undefined || valuetoreturn === '') {
        valuetoreturn = defaultvalue;
    }
    if (mandatory) {
        if (valuetoreturn === undefined || valuetoreturn === '') {
            console.log("parameter is mandatory, please specify either command line option " +
                argoption + ' or environment variable ' + environmentvariablename);
            process.exit(1);
        }
    }
    return valuetoreturn;
}
