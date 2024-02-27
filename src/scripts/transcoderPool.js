import axios from 'axios'
import { request } from 'graphql-request'


import Web3 from "web3"
let web3 = new Web3(process.env.VUE_APP_GETH_URL)
let rawUris = JSON.parse(process.env.VUE_APP_OPEN_POOL_API)

async function getData(urls) {
    let data = []
    for (const uri of urls) {
        await axios.get(uri).then(function (response) {
            if (response && response.data)
                data.push(response.data)
        }).catch(function (error) {
            console.log(error)
            return data
        });
    }
    return data
}

export async function getTranscoders() {
    let uris = []
    for (const url of rawUris) {
        uris.push(url + `/transcoders`)
    }
    let regions = await getData(uris)

    regions = [].concat.apply([], regions)
    let transcoders = []
    regions.forEach(r => {
        for (let t in r) {
            if (r[t] != undefined && r[t] instanceof Object) {
                r[t]["EthAddress"] = t
                transcoders.push(r[t])
            }
        }
    })

    return formatTranscoders(
        transcoders
    )
}

function formatTranscoders(stats) {
    let transcoders = []
    for (let transcoder in stats) {
        let trans = stats[transcoder];
        if (trans == undefined) {
            trans = {
                Pending: 0.00,
                Payout: 0.00,
                Region: "",
                Nodes: []
            };
        }

        transcoders.push({
            address: trans.EthAddress,
            pending: web3.utils.fromWei(trans.Pending.toString(), 'ether').substring(0, 8) + " Ξ",
            payout: web3.utils.fromWei(trans.Payout.toString(), 'ether').substring(0, 8) + " Ξ",
            capacity: trans.Nodes.reduce((total, cap) => {
                total.Capacity += cap.Capacity
                return total
            }).Capacity,
            nodes: trans.Nodes.map(t => t.Address),
            region: trans.Region
        })
    }
    return transcoders
}

async function poolEarnings() {
    const query = `{
        winningTicketRedeemeds {
                hash
                faceValue
                recipient(where: {id: "0xb1c579757622d8ca7bd42542cb0325de1c8e1f8d"})
            }
        }`

    let data = await request(process.env.VUE_APP_LIVEPEER_SUBGRAPH, query)
    let earnings = data.winningTicketRedeemeds.reduce((a, b) => {
        let c = web3.utils.toBN(a.faceValue.toString()).add(web3.utils.toBN(b.faceValue.toString())).toString()
        return { faceValue: c }
    })
    return earnings.faceValue
}

export async function getNodeStatus() {
    try {
        let uris = []
        for (const url of rawUris) {
            uris.push(url + `/status`)
        }
        let statusses = await getData(uris)

        let totalPayouts = statusses.map(s => web3.utils.toBN(s.TotalPayouts.toString()))
        totalPayouts = totalPayouts.reduce((p, n) => p.add(n))
        let stats = {
            lpVersion: statusses[0].Version,
            commission: statusses[0].Commission,
            basePrice: statusses[0].BasePrice,
            totalPayouts: web3.utils.fromWei(totalPayouts.toString(), 'ether')
        }
        return stats
    } catch (e) {
        console.log(e)
    }
}
