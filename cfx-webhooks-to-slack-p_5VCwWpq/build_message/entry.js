export default defineComponent({
  async run({ steps, $ }) {
    try {
      const identityLink = (identityId) => `<https://interval.com/dashboard/cfxlabsinc/actions/identity_management/display?externalId=${identityId}|${identityId}>`;
      const phoneLink = (phone) => `<https://interval.com/dashboard/cfxlabsinc/actions/movemoney/search?id=%2B${phone.replace(/^\+/, '')}|${phone}>`;
      const body = steps.trigger.event.body;

      const [ domain, entity, eventType ] = body.event.split(".");
      if (domain === "identity") {
        if (entity === "identity") {
          if (eventType === "statusUpdated") {
            const identityId = body.identityId;
            const status = body.data.status;
            const message = `:saluting_face: identity ${identityLink(identityId)} is ${status.toLowerCase()}`;

            return { message }
          }
        }
      }

      if (domain === "withdrawal") {
        if (entity === "withdrawal") {
          if (eventType === "statusUpdated") {
            const { identityId, data: { withdrawalId, status  } } = body;
            const emoji = status === "PENDING" ? "arrow_upper_right" : status === "COMPLETED" ? "boom" : "warning";
            const message = `:${emoji}: withdrawal ${withdrawalId} for ${identityLink(identityId)} is ${status.toLowerCase()}`

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
            const message = `:${emoji}: :${typeEmoji}: deposit ${depositId} for ${identityLink(identityId)} is ${status.toLowerCase()}`

            return { message }
          }
        }
      }

      if (domain === "user") {
        if (entity === "register") {    
          if (eventType === "statusUpdated") {      
            const { data: id, identityId, phone, country, status } = body;

            if (status === "REGISTERED") {
              const emoji = `flag-${country.toLowerCase()}`;
              const message = `:${emoji}: ${identityLink(identityId)} registered with ${phone}`

              return { message }
            }
          }
        }
      }

      if (domain === "reward") {
        if (entity === "reward") {       
          if (eventType === "statusUpdated") {        
            const { data: amount, type, userId } = body;

            if (status === "CLAIMED") {
              const message = `:gift: ${amount} ${type} reward claimed by ${userId}`

              return { message }
            }
          }
        }
      }

      if (domain === "send") {
        if (entity === "send") {       
          if (eventType === "statusUpdated") {        
            const { amount, from: fromPhone, to: toPhone, status } = body.data;

            const emoji = status === "claimed" ? "handshake" : status === "created" ? "arrow_right" : "warning";
            
            const message = `:${emoji}: A $${amount} USD transfer from ${phoneLink(fromPhone)} to ${phoneLink(toPhone)} has been ${status.toLowerCase()}`
            
            return { message };
          }
        }
      }

      return undefined;
    } catch (e) {
      return undefined;
    }
  },
})
