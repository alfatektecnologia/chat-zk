const {zkVerifySession, ZkVerifyEvents} = require("zkverifyjs");
const fs = require("fs");
const proof = fs.readFileSync("../chat_vk_proof/proof.hex").toString()
const public = fs.readFileSync("../chat_vk_proof/pub.hex").toString()
const session = await zkVerifySession.start().Volta().withAccount("seed-phrase")

let vk = fs.readFileSync("../chat_vk_proof/vk.hex").toString()

const {events, regResult} = await session.registerVerificationKey().ultraplonk().execute(vk.split("\n")[0]);

events.on(ZkVerifyEvents.Finalized, (eventData) => {
    console.log('Verification finalized:', eventData);
    fs.writeFileSync("vkey.json", JSON.stringify({"hash": eventData.statementHash}, null, 2));
    return eventData.statementHash
});

const vkey = require("./vkey.json")
session.subscribe([
    {event: ZkVerifyEvents.NewAggregationReceipt, callback: async(eventData) => {
        console.log('New aggregation receipt:', eventData);
        let statementpath = await session.getAggregateStatementPath(eventData.blockHash, parseInt(eventData.data.domainId), parseInt(eventData.data.aggregationId), statement);
        console.log('Statement path:', statementpath);
        const statementproof = {
            ...statementpath,
            domainId: parseInt(eventData.data.domainId),
            aggregationId: parseInt(eventData.data.aggregationId),
        };
        fs.writeFile("aggregation.json", JSON.stringify(statementproof));
    }, options:{domainId:0}}
])

const {events: verifyEvents} = await session.verify().ultraplonk().withRegisteredVk().execute({proofData:{
    proof: proof.split("\n")[0],
    vk: vkey.hash,
    publicSignals: public.split("\n").slice(0,-1),
}, domainId: 0})

events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
    console.log("Included in block", eventData);
    statement = eventData.statement
})
