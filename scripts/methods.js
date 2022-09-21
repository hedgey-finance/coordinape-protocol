const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const rpcUrl = 'https://goerli.infura.io/v3/d914410e6fcd4d8b97cb451ba5ef6456';
const web3 = new Web3(rpcUrl);
const apeDistributor = require('../artifacts/contracts/ApeProtocol/ApeDistributor.sol/ApeDistributor.json');
const apeAddress = '0x185102b7a92903096834ce3abd5c19143d483956';
const vault = require('../artifacts/contracts/ApeProtocol/wrapper/beacon/ApeVault.sol/ApeVaultWrapperImplementation.json');

const wallet = {
    publicKey: '',
    privateKey: '',
}

async function sendTx(contractAddress, encodedABI) {
    const publicKey = wallet.publicKey;
    const privKey = wallet.privateKey;
    const privateKey = Buffer.from(privKey, 'hex');
    const transactionNonce = await web3.eth.getTransactionCount(publicKey, "pending");
    const gwei = Math.round((await web3.eth.getGasPrice())*1.2);
    let transactionObject = {
        nonce: web3.utils.toHex(transactionNonce),
        gasLimit: web3.utils.toHex(8000000),
        gasPrice: web3.utils.toHex(gwei),
        to: contractAddress,
        from: publicKey,
        data: encodedABI,
        value: web3.utils.toHex(value)
    }
    // const gasLimit = await web3.eth.estimateGas(transactionObject);
    // transactionObject.gasLimit = gasLimit;
    const tx = new Tx(transactionObject, { chain: 'goerli' });
    tx.sign(privateKey);
    const serializedEthTx = tx.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedEthTx.toString('hex')).on('transactionHash', (hash) => {
        console.log(hash);
    })
        .on('receipt', (receipt) => {
            console.log(`tx hash: ${receipt.transactionHash}`);
            console.log(`status: ${receipt.status}`);
        })
        .catch(console.log);
}

async function getOwner(address) {
    const contract = new web3.eth.Contract(vault.abi, address);
    const owner = await contract.methods.owner().call();
    console.log(owner);
    return owner;
}

async function distributeTokens(details) {
    const contract = new web3.eth.Contract(apeDistributor.abi, apeAddress);
    const encodedABI = await contract.methods.tapEpochAndDistribute(
        details.vault,
        details.circle,
        details.token,
        details.users,
        details.amounts,
        details.amount,
        details.tapType
    );
    console.log(encodedABI);
    //sendTx(apeAddress, encodedABI);
}

const byts = web3.utils.hexToBytes('0x636972636c652d312d3336353300000000000000000000000000000000000000');

const deets = {
    vault: '0x7F04ED40a29Fd6A2a93481d5E250BddefA6E1f34',
    circle: byts,
    token: '0xe13fb676e9bdd7afda91495ec4e027fc63212fc3',
    users: ['0x771616292384fdde7cf784098d9e3b3f44927c7f', '0x7a7ed51f8c2eb3ee88ce6b2d03b62772176d03ed', '0x0c4fab8d9dbe774708eec313bf0295278e307bcd'],
    amounts: ['50000000000000000000', '10000000000000000000', '7000000000000000000000'],
    amount: '7060000000000000000000',
    tapType: '2'
}

//distributeTokens(deets)

async function setAdmin(circle, admin) {
    const contract = new web3.eth.Contract(apeDistributor.abi, apeAddress);
    const encodedABI = await contract.methods.updateCircleAdmin(circle, admin).encodeABI();
    console.log(encodedABI);
}

setAdmin(byts, wallet.publicKey);