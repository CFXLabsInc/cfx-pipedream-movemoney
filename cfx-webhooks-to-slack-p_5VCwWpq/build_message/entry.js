import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    try {
      const getUserLink = async (user) => {
        try {
          const resp = await axios({
            method: "GET",
            url: `https://movemoney.app/api/admin/identify/${user}`,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.MM_ENRICHMENT_API_KEY}`,
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

      const body = steps.trigger.event.body;

      const [domain, entity, eventType] = body.event.split(".");
      if (domain === "identity") {
        if (entity === "identity") {
          if (eventType === "statusUpdated") {
            const identityId = body.identityId;
            const status = body.data.status;
            const user = await getUserLink(identityId) ?? identityId;
            const message = `:saluting_face: ${user} is ${status.toLowerCase()}`;

            return { message };
          }
        }
      }

      if (domain === "withdrawal") {
        if (entity === "withdrawal") {
          if (eventType === "statusUpdated") {
            const {
              identityId,
              data: { withdrawalId, status },
            } = body;
            const user = await getUserLink(identityId) ?? identityId;
            const emoji =
              status === "PENDING"
                ? "arrow_upper_right"
                : status === "COMPLETED"
                ? "boom"
                : "warning";
            const message = `:${emoji}: withdrawal ${withdrawalId} for ${user} is ${status.toLowerCase()}`;

            return { message };
          }
        }
      }

      if (domain === "deposit") {
        if (entity === "deposit") {
          if (eventType === "statusUpdated") {
            const {
              identityId,
              data: { depositId, status, type, requestType },
            } = body;
            const user = await getUserLink(identityId) ?? identityId;
            const actualType = type ?? requestType;
            const typeEmoji =
              actualType.toLowerCase() === "cash" ? "dollar" : "credit_card";
            const emoji =
              status === "PENDING" || status === "PROCESSING"
                ? "arrow_lower_right"
                : status === "DEPOSITED"
                ? "boom"
                : "warning";
            const message = `:${emoji}: :${typeEmoji}: deposit ${depositId} for ${user} is ${status.toLowerCase()}`;

            return { message };
          }
        }
      }

      if (domain === "user") {
        if (entity === "register") {
          if (eventType === "statusUpdated") {
            const { identityId, phone, country, status } = body.data;
            const user = await getUserLink(identityId) ?? identityId;

            if (status === "REGISTERED") {
              const emoji = `flag-${country.toLowerCase()}`;
              const message = `:${emoji}: ${user} registered with ${phone}`;

              return { message };
            }
          }
        }
      }

      if (domain === "reward") {
        if (entity === "reward") {
          if (eventType === "statusUpdated") {
            const { amount, type, userId, status } = body.data;
            const user = await getUserLink(userId) ?? userId;
            const emoji = type === "referral" ? "gift_heart" : "gift";

            if (status === "CLAIMED") {
              const message = `:${emoji}: $${amount} ${type} reward claimed by ${user}`;

              return { message };
            }
          }
        }
      }

      if (domain === "send") {
        if (entity === "send") {
          if (eventType === "statusUpdated") {
            const {
              amount,
              fromUserId,
              toUserId,
              from: fromPhone,
              to: toPhone,
              status,
            } = body.data;

            const fromUser = await getUserLink(fromUserId) ?? fromPhone;
            const toUser = toUserId ? (await getUserLink(toUserId) ?? toPhone) : toPhone;

            const emoji =
              status === "claimed"
                ? "handshake"
                : status === "created"
                ? "arrow_right"
                : "warning";

            const message = `:${emoji}: A $${amount} USD transfer from ${fromUser} to ${toUser} has been ${status.toLowerCase()}`;

            return { message };
          }
        }
      }

      return $.flow.exit();
    } catch (e) {
      throw e;
    }
  },
});
