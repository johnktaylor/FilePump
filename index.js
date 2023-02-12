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
let argv = yargs.argv;
let queueuser = argv['u'];
let queuepassword = argv['p'];
let queuename = argv['q'];
let queueserver = argv['s'];
let inputdir = argv['i'];
if (queueuser == undefined) {
    queueuser = process.env.FILEPUMP_QUEUE_USER;
    if (queueuser == undefined || queueuser == '') {
        console.log('you need to specify either a -u parameter of define FILEPUMP_QUEUE_USER environment variable');
        process.exit(1);
    }
}
if (queuepassword == undefined) {
    queuepassword = process.env.FILEPUMP_QUEUE_PASSWORD;
    if (queuepassword == undefined || queuepassword == '') {
        console.log('you need to specify either a -p parameter of define FILEPUMP_QUEUE_PASSWORD environment variable');
        process.exit(1);
    }
}
if (queuename == undefined) {
    queuename = process.env.FILEPUMP_QUEUE_NAME;
    if (queuename == undefined || queuename == '') {
        console.log('you need to specify either a -q parameter of define FILEPUMP_QUEUE_NAME environment variable');
        process.exit(1);
    }
}
if (queueserver == undefined) {
    queueserver = process.env.FILEPUMP_QUEUE_SERVER;
    if (queueserver == undefined || queueserver == '') {
        console.log('you need to specify either a -s parameter of define FILEPUMP_QUEUE_SERVER environment variable');
        process.exit(1);
    }
}
if (inputdir == undefined) {
    inputdir = process.env.FILEPUMP_INPUT_DIR;
    if (inputdir == undefined || inputdir == '') {
        inputdir = '/inputfiles';
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const queue = queuename;
    const conn = yield amqplib.connect('amqp://' + queueuser + ':' + queuepassword + '@' + queueserver);
    const ch1 = yield conn.createChannel();
    yield ch1.assertQueue(queue);
    let filesscanned = [];
    setInterval(() => {
        fs.readdir(inputdir, (err, files) => {
            files.forEach(file => {
                if (!filesscanned.find(element => element == file)) {
                    console.log(file);
                    ch1.sendToQueue(queue, Buffer.from(file));
                    filesscanned.push(file);
                }
            });
        });
    }, 1);
}))();
