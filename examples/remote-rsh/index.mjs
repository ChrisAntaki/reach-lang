import {loadStdlib} from '@reach-sh/stdlib';
import * as backendC from './build/index.mainC.mjs';
import * as backendS from './build/index.mainS.mjs';

const stdlib = loadStdlib();

if ( stdlib.connector === 'ALGO' ) { process.exit(0); }

const sBal = stdlib.parseCurrency(100);
const [ accA, accB ] =
  await stdlib.newTestAccounts(2, sBal);

const tokR = await stdlib.launchToken(accA, 'gil', 'GIL');
const tok = tokR.id;

const go = async (acc, who) => {
  acc.setDebugLabel(who);
  acc.setGasLimit(5000000);
  await acc.tokenAccept(tok);
  await tokR.mint(acc, sBal);
  return async () => {
    console.log(who, 'balance', await stdlib.balancesOf(acc, [ null, tok ]));
  };
};
const showA = await go(accA, 'A');
const showB = await go(accB, 'B');
const show = async () => {
  await showA();
  await showB();
};

await show();
const x = stdlib.parseCurrency('4.2');
const ctcA = accA.contract(backendS);
console.log('A starting');
await ctcA.p.D({ x, tok,
  ready: async (serverInfo) => {
    console.log('A ready with', serverInfo);
    const ctcB = accB.contract(backendC);
    console.log('B starting with', serverInfo);
    await ctcB.p.D({ serverInfo,
      inform: async (...args) => {
        console.log('B saw', ...args);
      }
    });
    console.log('B done');
  },
});
console.log('A done');
await show();
