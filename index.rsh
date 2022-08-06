"reach 0.1";
const [ isOutcome, WINNER, LOSER] = makeEnum(2);
const winner = (x, specialNumber) => ( (x == specialNumber) ? WINNER : LOSER )
assert(winner(4,4) == WINNER )
assert(winner(3,4) == LOSER )

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    startRaffle: Fun([], Object({
      tickets: UInt,
      nftId: Token
    })),
    
    winningNumber: Fun([UInt], UInt),
    getHash:Fun([Digest], Null),
    showWinningNumber:Fun([UInt], Null),
    showWinner: Fun([ Bool,Address], Null),
    
    seeDraws:Fun([Address, UInt], Null),
    ...hasRandom,
  });

  const Bob = API('Bob', {
    pickNumbers: Fun([UInt],  Bool),
    seeBalance: Fun([], Address)
  });
  init();

 Alice.only(() => {
    const {tickets, nftId} = declassify(interact.startRaffle());
    
    const _getWinningNumber = interact.winningNumber(tickets);
   const [_commitAlice, _saltAlice] = makeCommitment(interact, _getWinningNumber);
   const commitAlice = declassify(_commitAlice);
  });
  Alice.publish(tickets, nftId, commitAlice);
  Alice.interact.getHash(commitAlice);
  commit();
  const amt = 1;
  Alice.pay([[amt, nftId]]);
  const bobUsers = new Map(Address, UInt);
  commit();
  Alice.only(() => {
    const saltAlice = declassify(_saltAlice);
    const winningNumber = declassify(_getWinningNumber);
   });
  Alice.publish(saltAlice, winningNumber); 
 
  const [soldTickets] =
    parallelReduce([0])
    .invariant(balance() == balance())
    .while( soldTickets < tickets )
    .api_(Bob.pickNumbers, (bobsNumber) => {
      return [ 0, (send) => {
        bobUsers[this] = bobsNumber
        Alice.interact.seeDraws(this, bobsNumber)
        if (bobsNumber == winningNumber ){
          transfer(balance(nftId), nftId ).to(this)
          
          Alice.interact.showWinner(true, this)
          send(true);
          return [soldTickets + 1];
        }
        else {
          send(false);
          
          Alice.interact.showWinner(false, this)
          return [soldTickets + 1];
        }
      }]
    })
    .api_(Bob.seeBalance, () => {
      return [ 0, (k) => {
          k(this) 
          return[soldTickets]       
      }]
    })
  Alice.interact.showWinningNumber(winningNumber)
  transfer(balance(nftId), nftId).to(Alice);
  transfer(balance()).to(Alice);
  commit();
  exit();
});