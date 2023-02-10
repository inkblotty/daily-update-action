"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsPastDue = exports.getIsTomorrow = exports.oneDayMs = exports.formatDate = exports.getDueDateFromIssueBody = exports.getIsValidDate = void 0;
const getIsValidDate = (date) => {
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate);
};
exports.getIsValidDate = getIsValidDate;
const getDueDateFromIssueBody = (issueBody) => {
    const regex = /## Timing(.*)\[Google Event/;
    const matches = issueBody.replace(/[\r\n]/g, '').match(regex);
    if (!matches || !matches[1] || !(0, exports.getIsValidDate)(matches[1])) {
        console.log('\n invalid date detected in issue:', issueBody, '\n');
        return '';
    }
    return (new Date(matches[1])).toISOString();
};
exports.getDueDateFromIssueBody = getDueDateFromIssueBody;
const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
exports.formatDate = formatDate;
exports.oneDayMs = 1000 * 60 * 60 * 24;
const getIsTomorrow = (date) => {
    const diff = ((new Date()).getTime()) - ((new Date(date)).getTime());
    // is less than one day apart but not negative
    return diff <= exports.oneDayMs && (diff > 0);
};
exports.getIsTomorrow = getIsTomorrow;
const getIsPastDue = (date) => {
    // if it happened yesterday or earlier, it's past due
    const diff = (new Date(date)).getTime() - (new Date()).getTime();
    const pastDue = diff <= (exports.oneDayMs * 1) && diff < 0;
    return pastDue;
};
exports.getIsPastDue = getIsPastDue;
//# sourceMappingURL=shared.js.map