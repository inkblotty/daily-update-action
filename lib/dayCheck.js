"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecificDayUpdate = exports.FRIDAY_CELEBRATION_MESSAGE = void 0;
exports.FRIDAY_CELEBRATION_MESSAGE = '\n\nWe finished the week! :rocket:\nIn thread below, please answer: What are you proud of that happened this week? :muscle: Let\'s celebrate each other\'s work.';
const getSpecificDayUpdate = (overrideDay) => {
    const today = overrideDay || (new Date()).getDay();
    // if Friday
    if (today === 5) {
        return exports.FRIDAY_CELEBRATION_MESSAGE;
    }
    return '';
};
exports.getSpecificDayUpdate = getSpecificDayUpdate;
//# sourceMappingURL=dayCheck.js.map