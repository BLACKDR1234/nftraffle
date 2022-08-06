import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const stdlib = loadStdlib({ REACH_NO_WARN: 'Y' });
const sbal = stdlib.parseCurrency(100);
const accAlice = await stdlib.newTestAccount(sbal);


const ctcAlice = accAlice.contract(backend);

const bobs = await stdlib.newTestAccounts(5, sbal);
const ctcWho = (whoi) =>
  bobs[whoi].contract(backend, ctcAlice.getInfo());
console.log('WELCOME TO WHO WANTS TO GET AN NFT')
const rsh = await stdlib.launchToken(accAlice, "REACH", "RSH", { supply: 1});
  console.log('NFT HAS BEEN CREATED');
  const nftParams = {
    tickets: 5,
    nftId: rsh.id


  }

  await bobs[0].tokenAccept(nftParams.nftId);
  await bobs[1].tokenAccept(nftParams.nftId);
  await bobs[2].tokenAccept(nftParams.nftId);
  await bobs[3].tokenAccept(nftParams.nftId);
  await bobs[4].tokenAccept(nftParams.nftId);

const play = async (whoi, pick) => {
  
  const who = bobs[whoi];
  const ctc = ctcWho(whoi);

  const y = await ctc.apis.Bob.pickNumbers(pick);
  console.log(`Player ${whoi} ticket number is ${pick}`);
  if(y){
    console.log('Player', whoi, 'sees you won the Raffle')
  }
  else console.log('Player', whoi, ' sees you did not win the raffle')
}


await Promise.all([
  backend.Alice(ctcAlice, {
    
    startRaffle: () =>{
      const x = nftParams.tickets;
      console.log('The Number of Tickets: ',  x)
      console.log('RAFFLE DRAW PARAMETERS SENT TO THE BACKEND');
      return nftParams;
      
    },
    
    winningNumber : (X) => {
      const num = (Math.floor(Math.random() * X) + 1);
      return num;
    },
    getHash : (hash) => {
      console.log('WINNING NUMBER HASH: ', hash);
    },
    showWinningNumber : (x) => {
      console.log(`WINNING NUMBER: ${x}`)
    },
    showWinner : (x, y) => {
     if(x){
      console.log(`Alice sees ${stdlib.formatAddress(y)} Won the raffle `)
      console.log(`PAYMENT HAS BEEN COMPLETE`)
     }
     else console.log(`Alice sees ${stdlib.formatAddress(y)} did not win the raffle `)
    },
    seeDraws: (x, y) => {
      console.log(`Alice sees ${stdlib.formatAddress(x)} choose ${y} `)
    },
    ...stdlib.hasRandom
  }),

await play(0,3),
await play(1,4),
await play(2,5),
await play(3,2),
await play(4,1),
]);

const p1After = await bobs[0].balancesOf([rsh.id]);
const p2After = await bobs[1].balancesOf([rsh.id]);
const p3After = await bobs[2].balancesOf([rsh.id]);
const p4After = await bobs[3].balancesOf([rsh.id]);
const p5After = await bobs[4].balancesOf([rsh.id]);
const alicBalance = await accAlice.balancesOf([rsh.id]);

console.log('Player 1 balance after the raffle',p1After.toString(), rsh.sym);
console.log('Player 2 balance after the raffle',p2After.toString(), rsh.sym);
console.log('Player 3 balance after the raffle',p3After.toString(), rsh.sym);
console.log('Player 4 balance after the raffle',p4After.toString(), rsh.sym);
console.log('Player 5 balance after the raffle',p5After.toString(), rsh.sym);
console.log('Alice balance after the raffle',alicBalance.toString(), rsh.sym);
