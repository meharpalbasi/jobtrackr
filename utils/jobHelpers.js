// utils/jobHelpers.js
const suggestNextAction = (status) => {
  switch (status) {
    case 'Not Applied':
      return {
        action: "Submit application",
        timeframe: 7 // days from now
      };
    case 'Applied':
      return {
        action: "Follow up on application",
        timeframe: 14 // 2 weeks after applying
      };
    case 'No Response':
      return {
        action: "Send follow-up email",
        timeframe: 7 // 1 week after last follow-up
      };
    case 'Phone Screen':
      return {
        action: "Prepare for phone screen",
        timeframe: 3 // 3 days before scheduled call
      };
    case 'Interview':
      return {
        action: "Send thank you note",
        timeframe: 1 // 1 day after interview
      };
    case 'Final Round':
      return {
        action: "Send final thank you note",
        timeframe: 1 // 1 day after final round
      };
    case 'Offer':
      return {
        action: "Review and respond to offer",
        timeframe: 5 // 5 days to decide
      };
    default:
      return {
        action: "Update status",
        timeframe: 7
      };
  }
};

export default suggestNextAction;