export const FRIDAY_CELEBRATION_MESSAGE = '\n\nWe finished the week! :rocket:\nIn thread below, please answer: What are you proud of that happened this week? :muscle: Let\'s celebrate each other\'s work.';
export const getSpecificDayUpdate = (overrideDay?: number) => {
    const today = overrideDay || (new Date()).getDay();
    
    // if Friday
    if (today === 5) {
        return FRIDAY_CELEBRATION_MESSAGE;
    }

    return '';
}