// To use previous step data, pass the `steps` object to the run() function
export default defineComponent({
  async run({ steps, $ }) {
    // Return data to use it in future steps
    const metrics = Object.entries(steps.convert_into_balances.$return_value).filter(([_,val])=> val.diff!==0)

    return metrics.map(x=> ({name: x[0], value: x[1].post.balance, tags: [`owner=${x[0].split(".")[0]}`,`mint=${x[1].post.mint}`, `account=${x[0].split(".")[1]}`], interval: 10, time: steps.trigger.event.body[0].blockTime}))
  },
})