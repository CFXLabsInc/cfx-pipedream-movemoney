export default defineComponent({
  async run({ steps, $ }) {
    try {
      const body = steps.trigger.event.body;

      const [ domain, entity, eventType ] = body.event.split(".");
      if (domain === "identity") {
        if (entity === "identity") {
          if (eventType === "statusUpdated") {
            const identityId = body.identityId;
            const status = body.data.status;
            const message = `:saluting_face: identity ${identityId} is ${status.toLowerCase()}`

            return { message }
          }
        }
      }

      if (domain === "withdrawal") {
        if (entity === "withdrawal") {
          if (eventType === "statusUpdated") {
            const { identityId, data: { withdrawalId, status  } } = body;
            const emoji = status === "PENDING" ? "arrow_upper_right" : status === "COMPLETED" ? "boom" : "warning";
            const message = `:${emoji}: withdrawal ${withdrawalId} for ${identityId} is ${status.toLowerCase()}`

            return { message }
          }
        }
      }

      if (domain === "deposit") {
        if (entity === "deposit") {
          if (eventType === "statusUpdated") {
            const { identityId, data: { depositId, status, type, requestType  } } = body;
            const actualType = type ?? requestType;
            const typeEmoji = actualType.toLowerCase() === "cash" ? "dollar" : "credit_card";
            const emoji = status === "PENDING" || status === "PROCESSING" ? "arrow_lower_right" : status === "DEPOSITED" ? "boom" : "warning";
            const message = `:${emoji}: :${typeEmoji}: deposit ${depositId} for ${identityId} is ${status.toLowerCase()}`

            return { message }
          }
        }
      }

      return undefined;
    } catch (e) {
      return undefined;
    }
  },
})
