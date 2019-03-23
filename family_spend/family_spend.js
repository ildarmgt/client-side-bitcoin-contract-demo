// SETTINGS: backups and spending choices
const MY_PRIVATE_KEY = 'Kxy9aqev9aSuSRhiFp6KuMtYMW33z79ra8Es6iWcFmh83U2aNfAh';
const FAM_PRIVATE_KEY = 'L2yqXBcwR2xULUJ4pXZbKvEDS8H6hhp7AaWK3mEH1djsFKq98CYi';
const SCRIPT_HEX = '6321025aa85e44ef3e6b7c104eb9a378b5c3cbdbbe183f3f1d8acb27bcf89ef0b265c1ac6703c3f040b2752102fe9bf1bf6afd6c2da3f0dd28c21eae01c5cf2ddbaf4202b37143ebd38a0abe52ac68';
const SPEND_FROM_TXID = 'ce2acea70cd911c423d8c1007213761b1478d25052f30f71bdce56a76a6eebb5';
const SPEND_FROM_VOUT = 0;
const UNSPENT_VALUE = 0.0005 * 1e8; // satoshi in output
const FEE_TO_PAY = 5000; // amount to spend on fee in satoshi
const WHERE_TO_SEND = '3JQtLGuiwPgYp5AW44b5so69gzr4oDVnSh'; // family's wallet

// build tx to sign for main net, 1 unspent input, 1 new output
const network = bitcoin.networks.bitcoin;
const buildTx = new bitcoin.TransactionBuilder(network);
buildTx.addInput(SPEND_FROM_TXID, SPEND_FROM_VOUT, 0xfffffffe);
buildTx.addOutput(WHERE_TO_SEND, UNSPENT_VALUE - FEE_TO_PAY);
const tx = buildTx.buildIncomplete();

// calculate its hash and sign for w/e key
const hashType = bitcoin.Transaction.SIGHASH_ALL;
const hashForSignature = tx.hashForSignature(
  0, Buffer.from(SCRIPT_HEX, 'hex'), hashType
);
const famKeyPair = bitcoin.ECPair.fromWIF(FAM_PRIVATE_KEY, network)
const famSignature = bitcoin.script.signature.encode(
  famKeyPair.sign(hashForSignature), hashType
);

// submit values and original script
const inputScriptFamSpending = bitcoin.payments.p2sh({
  redeem: {
    input: bitcoin.script.compile([
      famSignature,
      bitcoin.opcodes.OP_FALSE
    ]),
    output: Buffer.from(SCRIPT_HEX, 'hex')
  }
}).input;
tx.setInputScript(0, inputScriptFamSpending);
console.log('Spend contract via this raw tx:', tx.toHex());
console.log('fee sat/byte:', (FEE_TO_PAY/tx.virtualSize()).toFixed(3));
