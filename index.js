"use strict";
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
(async () => {
    const queue = queuename;
    const conn = await amqplib.connect('amqp://' + queueuser + ':' + queuepassword + '@' + queueserver);
    const ch1 = await conn.createChannel();
    await ch1.assertQueue(queue);
    let filesscanned = [];
    setInterval(() => {
        fs.readdir(inputdir, (err, files) => {
            files.forEach(file => {
                if (!filesscanned.find(element => element == file)) {
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
    }, 1);
})();
