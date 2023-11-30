import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    const getUserLink = async (user) => {
      try {
        const resp = await axios({
          method: "GET",
          url: `https://movemoney.app/api/admin/identify/${user}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MM_ENRICHMENT_API_KEY}`,
          },
        });

        if (resp.data) {
          const { user, profile } = resp.data;
          const userName = profile?.firstName
            ? `${profile.firstName} ${profile.lastName}`
            : user.phone;
          return `<https://interval.com/dashboard/cfxlabsinc/actions/identity_management/display?userId=${user.id}|${userName}>`;
        }
      } catch (e) {
        console.log(e);
      }
    };

    try {
      const { type, data } = steps.trigger.event.body;
      const messageType = `<${steps.trigger.event.body._links.payment.href}|${type.split("_").join(" ")}>`;
      const { amount, response_summary, metadata, customer } = data;
      const { card_category, card_type } = data.source ?? {
        card_category: "unknown",
        card_type: "unknown",
      };
      const identity = metadata?.identity ?? customer?.email?.split("@")?.[0];
      const user = (await getUserLink(identity)) ?? identity;
      const cardUser = steps.trigger.event.body.data.source.name

      if (amount > 0) {
        return {
          message: `${messageType} by ${user} for $${(amount / 100).toFixed(
            2
          )} [cardholder name: ${cardUser}] [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`,
        };
      } else {
        return {
          message: `${messageType} by ${user} [cardholder name: ${cardUser}] [${response_summary.toLowerCase()}] [${card_category.toLowerCase()} ${card_type.toLowerCase()}]`,
        };
      }
    } catch (e) {
      return undefined;
    }
  },
});