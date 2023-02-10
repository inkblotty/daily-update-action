"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecificDayUpdate = exports.FRIDAY_CELEBRATION_MESSAGE = void 0;
exports.FRIDAY_CELEBRATION_MESSAGE = '\n\nWe finished the week! :rocket:\nIn thread below, please answer: What are you proud of that happened this week? :muscle: Let\'s celebrate each other\'s work.';
const getSpecificDayUpdate = (overrideDay) => {
    // override should only be used for testing
    const today = overrideDay || (new Date()).getDay();
    // if Friday
    if (overrideDay !== 0 && today === 5) {
        return exports.FRIDAY_CELEBRATION_MESSAGE;
    }
    return '';
};
exports.getSpecificDayUpdate = getSpecificDayUpdate;
//# sourceMappingURL=dayCheck.js.map