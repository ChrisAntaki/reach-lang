import fetch from 'node-fetch';
import waitPort from 'wait-port';

const hostname = "http://localhost"
const port = 3001
const address = `${hostname}:${port}`

// wait for the server port to open
const waitForPort = async () => {
  const params = {
    port: port
  }
  const r = await waitPort(params)
  console.log(r)
}

// helper to make http requests
async function interact(method = 'GET', url = '', data = {}) {
  const response = await fetch(url, {
    method: method,
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  });
  return response.json();
}


// returns a list of the states that have happened
// currently just a list of ascending numbers
const getStates = async () => {
  const r = await interact(`GET`, `${address}/states`)
  console.log(r)
  return r;
}

// edges of the DAG state graph, represented as a list of pairs
// of numbers
const getEdges = async () => {
  const r = await interact(`GET`, `${address}/edges`)
  console.log(r)
  return r;
}

// returns the status of the "active" actor
// "active" means took an action most recently
const getStatus = async () => {
  const r = await interact(`GET`, `${address}/status`)
  console.log(r)
  return r;
}

// get the list of available actions
// at state s (integer)
// for actor a (integer)
async function getActions(s,a) {
  const r = await interact(`GET`, `${address}/actions/${s}/${a}`)
  console.log(r)
  return r;
}

// JSON dump of global Simulator info
// at state s (integer)
async function getStateGlobals(s) {
  const r = await interact(`GET`, `${address}/global/${s}`)
  console.log(r)
  return r;
}

// JSON dump of local Simulator info
// at state s (integer)
async function getStateLocals(s) {
  const r = await interact(`GET`, `${address}/local/${s}`)
  console.log(r)
  return r;
}

// returns a ":" delimited string
// for example: /Users/chike/reach-lang/examples/api-full/index.rsh:27:5:dot
// where 27 is the line number
// 5 is the column number
// for actor a (integer)
// at state s (integer)
async function getLoc(s,a) {
  const r = await interact(`GET`, `${address}/locs/${s}/${a}`)
  console.log(r)
  return r;
}

// load the program (Reach source code)
const load = async () => {
  const r = await interact('POST', `${address}/load`)
  console.log(r)
  return r;
}

// initialize the program for the Consensus
const init = async () => {
  const r = await interact('POST', `${address}/init`)
  console.log(r)
  return r
}

// at state s (integer)
// perform action a (integer)
// with a value v (Simulator.Core.DLVal)
// as an actor w (integer).
// by default or by passing 'false' the actor is unchanged.
// t provides the type of the value
// for example
// const a = {
//   tag: 'V_Tuple',
//   contents: [
//     {tag: 'V_UInt',
//      contents: 4444
//     },
//     {tag: 'V_UInt',
//      contents: 0}
//   ]}
// c.respondWithVal(2,2,0,a)
// this is the most interesting endpoint
// full documentation with all the values/types should exist elsewhere
// but there are numerous examples in ~/reach-lang/examples/simulator-*
const respondWithVal = async (s,a,v,w=false,t='number') => {
  const who = (w || w === 0) ? `&who=${w}` : ``
  const r = await interact('POST', `${address}/states/${s}/actions/${a}/?data=${v}${who}&type=${t}`)
  console.log(r)
  return r
}

// initialize the program for
// actor a (integer)
// at state s (integer)
// liv is the interact environment. it is a JSON object
// optionally, provide an account id acc (integer)
// for example :
// await c.initFor(0,0,JSON.stringify({'wager':{'tag':'V_UInt','contents':10}}))
const initFor = async (s,a,liv="{}",acc=false) => {
  const accParam = (acc || acc === 0) ? `&accountId=${acc}` : ``
  let livS = liv
  if (
    typeof liv === 'object' &&
    !Array.isArray(liv) &&
    liv !== null
  ) {
    livS = JSON.stringify(liv)
  }
  const r = await interact('POST', `${address}/init/${a}/${s}/?liv=${livS}${accParam}`)
  console.log(r)
  return r
}

// check if there are initialization interact details needed
// to run the program
// for actor a (integer)
const initDetails = async (a) => {
  const r = await interact('GET', `${address}/init_details/${a}`)
  console.log(r)
  return r
}

// create a new account
// at state s (integer)
const newAccount = async (s) => {
  const r = await interact('POST', `${address}/accounts/new/${s}`)
  console.log(r)
  return r
}

// create a new currency
// at state s (integer)
const newToken = async (s) => {
  const r = await interact('POST', `${address}/tokens/new/${s}`)
  console.log(r)
  return r
}

// perform a funds transfer
// at state s (integer)
// from account fr (integer)
// to account to (integer)
// for currency tok (integer)
// for amount amt (integer)
const transfer = async (s,fr,to,tok,amt) => {
  const r = await interact('POST', `${address}/transfer/${s}/?from=${fr}&to=${to}&token=${tok}&amount=${amt}`)
  console.log(r)
  return r
}

// resets the Simulator server entirely
// all state is deleted
const resetServer = async () => {
  const r = await interact('POST', `${address}/reset`)
  console.log(r)
  return r
}

// ping the server for a friendly greeting ^_^
const ping = async () => {
  const r = await interact(`GET`, `${address}/ping`)
  console.log(r)
  return r;
}

// we expose certain methods to be available in a user provided
// Simulation "script" sequence of commands
const clientMethods = {
  "getStates" : getStates,
  "getStatus" : getStatus,
  "getActions" : getActions,
  "load" : load,
  "init" : init,
  "respondWithVal" : respondWithVal,
  "ping" : ping,
  "waitForPort" : waitForPort,
  "initFor" : initFor,
  "getStateLocals" : getStateLocals,
  "getStateGlobals" : getStateGlobals,
  "getEdges" : getEdges,
  "resetServer" : resetServer,
  "newAccount" : newAccount,
  "newToken" : newToken
}

// run a single Simulation "script" command
const interpCommand = async (comm) => {
  const fnstring = comm[0];
  const fnparams = comm.slice(1);
  const fn = clientMethods[fnstring];
  const r = await fn.apply(null, fnparams);
  console.log(r)
  return r;
}

// run an entire JSON list of commands
const interp = async (comms) => {
  for (const co of comms) {
    await interpCommand(co);
  }
}

export {
  getStates,
  getStatus,
  getActions,
  load,
  init,
  respondWithVal,
  ping,
  waitForPort,
  initFor,
  getStateLocals,
  getStateGlobals,
  getEdges,
  resetServer,
  interpCommand,
  interp,
  getLoc,
  newAccount,
  transfer,
  newToken,
  initDetails
};
