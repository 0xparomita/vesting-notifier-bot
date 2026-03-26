const sgMail = require('@sendgrid/mail');
const { ethers } = require("ethers");
const fs = require('fs');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function generateCsv(vaults) {
    const path = `./report.csv`;
    const csvWriter = createCsvWriter({
        path: path,
        header: [
            { id: "beneficiary", title: "Beneficiary" },
            { id: "claimable", title: "Claimable Tokens" }
        ]
    });
    const records = vaults.map(v => ({
        beneficiary: v.beneficiary,
        claimable: ethers.formatEther(v.claimableNow)
    }));
    await csvWriter.writeRecords(records);
    return path;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const lens = new ethers.Contract(process.env.LENS_ADDRESS, ["function getGlobalState(address) view returns (tuple(address,address,uint256,uint256,uint256)[], tuple(uint256,uint256))"], provider);

    const [vaults, stats] = await lens.getGlobalState(process.env.FACTORY_ADDRESS);
    const csvPath = await generateCsv(vaults);
    const attachment = fs.readFileSync(csvPath).toString("base64");

    const msg = {
        to: process.env.TREASURY_EMAIL,
        from: 'reports@yourdao.com',
        subject: `Weekly Vesting Audit - ${new Date().toLocaleDateString()}`,
        text: `Total claimable tokens across all vaults: ${ethers.formatEther(stats.totalClaimableAcrossAll)}`,
        attachments: [{
            content: attachment,
            filename: "vesting_report.csv",
            type: "text/csv",
            disposition: "attachment"
        }]
    };

    await sgMail.send(msg);
    console.log("Report sent to treasury.");
}

main().catch(console.error);
