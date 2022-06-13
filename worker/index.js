require("dotenv").config();

const Queue = require("bull");
const { getActor } = require("./src/actor");
const { makeKeyPair, Actor } = require("@dfinity/agent");

const workerQueue = new Queue("icTranscoderWorker", process.env.REDIS_URL);
const workerTasksQueue = new Queue(
  "icTranscoderWorkerTasks",
  process.env.REDIS_URL
);

const kObj = JSON.parse(Buffer.from(process.env.DFX_KEY, "base64").toString());

const actor = getActor(
  process.env.DFX_HOST,
  process.env.DFX_CANISTERID,
  makeKeyPair(kObj.publicKey.data, kObj.secretKey.data)
);

workerQueue.process(async (job, doneCallback) => {
  const tasks = await actor.flush();

  tasks.forEach((t) => {
    workerTasksQueue.add(t);
  });

  doneCallback(null, { tasks });
});

// every five seconds fetch the queue canister
workerQueue.add({ foo: "bar" }, { repeat: { every: 5000 } });

workerTasksQueue.process((job, doneCallback) => {
  //   const { to, subject, body } = job.data;
  //   const msg = {
  //     to: to,
  //     from: process.env.SENDGRID_FROM,
  //     subject: "[ICQS] " + subject,
  //     text: body,
  //   };
  //   sgMail.send(msg);
  doneCallback(null);
});
