// how long until inherit and keys to use (random keys here)
const YEARS_OF_DELAY = 1; // here must be (< 388 days)
const myKeyPair = bitcoin.ECPair.makeRandom();
const famKeyPair = bitcoin.ECPair.makeRandom();

// calculate relative lock time, has to be multiple of 512 seconds
const relativeLockTime = bitcoin.script.number.encode(bip68encode({
    seconds: Math.floor(YEARS_OF_DELAY * 365.25 * 24 * 60 * 60 / 512) * 512
}));

// contract
const op = bitcoin.opcodes;
const redeemScript = bitcoin.script.compile([
  op.OP_IF,
    myKeyPair.publicKey, op.OP_CHECKSIG,
  op.OP_ELSE,
    relativeLockTime, op.OP_CHECKSEQUENCEVERIFY, op.OP_DROP,
    famKeyPair.publicKey, op.OP_CHECKSIG,
  op.OP_ENDIF
]);

const p2sh = bitcoin.payments.p2sh({
  redeem: { output: redeemScript, network: bitcoin.networks.bitcoin }
}).address;

console.log('BACK UP ALL THIS');
console.log('my private key:', myKeyPair.toWIF());
console.log('fam private key:',famKeyPair.toWIF());
console.log('script hex:', redeemScript.toString('hex'));
console.log('contract address:', p2sh);
