export default defineComponent({
  async run({ steps, $ }) {
    const identityLink = (identityId) => `<https://interval.com/dashboard/cfxlabsinc/actions/identity_management/display?externalId=${identityId}|${identityId}>`;
    try {
    const { type, data } = steps.trigger.event.body;
    const messageType = type.split("_").join(" ");
    const { amount, response_summary } = data;
    const { card_category, card_type } = data.source;
    const identity = data.metadata?.identity;
    const identityString = identity ? ` by ${identityLink(identity)} ` : ""

    if (amount > 0) {
      return { message: `${messageType}${identityString} for $${(amount / 100).toFixed(2)} [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`}
    } else {
      return { message: `${messageType}${identityString} [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`}
    }
    } catch (e) {
      return undefined;
    }
  }
})