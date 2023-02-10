export const FRIDAY_CELEBRATION_MESSAGE = '\n\nWe finished the week! :rocket:\nIn thread below, please answer: What are you proud of that happened this week? :muscle: Let\'s celebrate each other\'s work.';
export const getSpecificDayUpdate = (overrideDay?: number) => {
    // override should only be used for testing
    const today = overrideDay || (new Date()).getDay();
    
    // if Friday
    if (overrideDay !== 0 && today === 5) {
        return FRIDAY_CELEBRATION_MESSAGE;
    }

    return '';
}