import amqplib = require('amqplib');
import fs = require('fs');
import { env } from 'process';
import yargs = require('yargs')

let queueuser:string|undefined = getParameter(true, 'FILEPUMP_QUEUE_USER', 'u', undefined);
let queuepassword:string|undefined = getParameter(true, 'FILEPUMP_QUEUE_PASSWORD', 'p', undefined);
let queuename:string|undefined = getParameter(true, 'FILEPUMP_QUEUE_NAME', 'q', undefined);
let queueserver:string|undefined = getParameter(true, 'FILEPUMP_QUEUE_SERVER', 's', undefined)
let inputdir:string = getParameter(true, 'FILEPUMP_INPUT_DIR', 'i', '//inputfiles');

(async () => {
  const queue = queuename;
  const conn = await amqplib.connect('amqp://' + queueuser + ':' + queuepassword + '@' + queueserver);
  const ch1 = await conn.createChannel();
  await ch1.assertQueue(queue);

  let filesscanned:string[] = [];

  setInterval(() => {
    fs.readdir(inputdir, (err:any, files:any) => {
      files.forEach(file => {
        if(!filesscanned.find(element => element === file)) {
          let messagetostore = {
            "storagetype":"file",
            "directory":inputdir,
            "file":file
          }

          console.log(JSON.stringify(messagetostore));
          ch1.sendToQueue(queue, Buffer.from(JSON.stringify(messagetostore)));
          filesscanned.push(file);
        }
      })
    });
  }, 1000);
})();

function getParameter(
  mandatory:boolean,
  environmentvariablename:string, 
  argoption:string,
  defaultvalue:string|undefined):string 
{
  let valuetoreturn = undefined;
  valuetoreturn = process.env[environmentvariablename]
  if(valuetoreturn === undefined || valuetoreturn === '') {
    let argv=yargs.argv;
    valuetoreturn = argv[argoption];
  }

  if(valuetoreturn === undefined || valuetoreturn === '') {
    valuetoreturn = defaultvalue
  }

  if (mandatory) {
    if (valuetoreturn === undefined || valuetoreturn === '') {
      console.log(
        "parameter is mandatory, please specify either command line option " + 
        argoption + ' or environment variable ' + environmentvariablename)
        process.exit(1);
    }
  }
  return valuetoreturn;
}