export default defineComponent({
  async run({ steps, $ }) {
    try {
    const { type, data } = steps.trigger.event.body;
    const messageType = type.split("_").join(" ");
    const { amount, response_summary } = data;
    const { card_category, card_type } = data.source;

    if (amount > 0) {
      return { message: `${messageType} for $${amount} [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`}
    } else {
      return { message: `${messageType} [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`}
    }
    } catch (e) {
      return undefined;
    }
  }
})