const fetch = require("node-fetch");
// import { KeyPair } from "@dfinity/agent/src/auth";

const {
  HttpAgent,
  Principal,
  makeActorFactory,
  makeAuthTransform,
  makeNonceTransform,
} = require("@dfinity/agent");

// global.btoa = require("btoa");
// global.crypto = new Crypto();

const candid = ({ IDL }) => {
  const TranscodeRequest = IDL.Record({
    url: IDL.Text,
    codec: IDL.Text,
  });
  const QueueConfig = IDL.Record({
    administrators: IDL.Vec(IDL.Principal),
    workers: IDL.Vec(IDL.Principal),
    writers: IDL.Vec(IDL.Principal),
  });
  return IDL.Service({
    flush: IDL.Func([], [IDL.Vec(TranscodeRequest)], []),
    setConfig: IDL.Func([QueueConfig], [], []),
    getConfig: IDL.Func([], [QueueConfig], ["query"]),
    greet: IDL.Func([], [], ["query"]),
    whoami: IDL.Func([], [IDL.Principal], []),
    enqueue: IDL.Func([TranscodeRequest], [], []),
  });
};

const getActor = (host, canisterId, keypair) => {
  const canId = Principal.fromText(canisterId);
  const httpAgent = new HttpAgent({
    host: host,
    fetch,
    principal: Principal.selfAuthenticating(keypair.publicKey),
    credentials: null,
  });
  httpAgent.addTransform(makeNonceTransform());
  httpAgent.setAuthTransform(makeAuthTransform(keypair));

  let actor = makeActorFactory(candid)({
    canisterId: canId,
    agent: httpAgent,
  });

  //   console.log("actor", actor);

  return actor;
};

module.exports = {
  getActor,
};
