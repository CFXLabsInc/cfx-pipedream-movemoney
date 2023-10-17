// To use previous step data, pass the `steps` object to the run() function
export default defineComponent({
  async run({ steps, $ }) {
    // Return data to use it in future steps
    const data = steps.trigger.event;
    const postBalances = data.body.map((x)=> {
      return Object.fromEntries(x.meta.postBalances.map((val,idx) => ([`${x.transaction.message.accountKeys[idx]}.${x.transaction.message.accountKeys[idx]}`, {mint: "11111111111111111111111111111111", balance: val/10**9}])))
    }).reduce((accumulator, currentObj) => {
    for (let key in currentObj) {
        if (accumulator.hasOwnProperty(key)) {
            accumulator[key] += currentObj[key];
        } else {
            accumulator[key] = currentObj[key];
        }
    }
    return accumulator;
       }, {});

    const preBalances = data.body.map((x)=> {
      return Object.fromEntries(x.meta.preBalances.map((val,idx) => ([`${x.transaction.message.accountKeys[idx]}.${x.transaction.message.accountKeys[idx]}`, {mint: "11111111111111111111111111111111", balance: val/10**9}])))
    }).reduce((accumulator, currentObj) => {
    for (let key in currentObj) {
        if (accumulator.hasOwnProperty(key)) {
            accumulator[key] += currentObj[key];
        } else {
            accumulator[key] = currentObj[key];
        }
    }
    return accumulator;
       }, {});

    
    const preTokenBalances = data.body.map((x)=> {
      return Object.fromEntries(x.meta.preTokenBalances.map((val) => ([`${val.owner}.${x.transaction.message.accountKeys[val.accountIndex]}`, {mint: val.mint, balance: val.uiTokenAmount.uiAmount }])))
    })
    .reduce((accumulator, currentObj) => {
    for (let key in currentObj) {
        if (accumulator.hasOwnProperty(key)) {
            accumulator[key] += currentObj[key];
        } else {
            accumulator[key] = currentObj[key];
        }
    }
    return accumulator;
       }, {});

    const postTokenBalances = data.body.map((x)=> {
      return Object.fromEntries(x.meta.postTokenBalances.map((val) => ([`${val.owner}.${x.transaction.message.accountKeys[val.accountIndex]}`, {mint: val.mint, balance: val.uiTokenAmount.uiAmount }])))
    })
    .reduce((accumulator, currentObj) => {
    for (let key in currentObj) {
        if (accumulator.hasOwnProperty(key)) {
            accumulator[key] += currentObj[key];
        } else {
            accumulator[key] = currentObj[key];
        }
    }
    return accumulator;
       }, {});

const combinedPostBalances = {...postBalances, ...postTokenBalances}
const combinedPreBalances =  {...preBalances, ...preTokenBalances}
const metricNames = [...new Set([...Object.keys(combinedPostBalances), ...Object.keys(combinedPreBalances)])]

const diff = Object.fromEntries(metricNames.map((metric)=>([metric, (combinedPostBalances[metric]?.balance ?? 0)-(combinedPreBalances[metric]?.balance ?? 0)])))

    return Object.fromEntries(Object.entries(diff).map(([addr, val]) => ([addr, {diff: val, post: combinedPostBalances[addr]??{mint: combinedPreBalances[addr].mint, balance:0}, pre: combinedPreBalances[addr]??{mint: combinedPostBalances[addr].mint, balance:0}}])));
  },
})