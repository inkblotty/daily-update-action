"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsPastDue = exports.getIsTodayButFuture = exports.getIsSoon = exports.oneWeekMs = exports.oneDayMs = exports.formatDate = exports.getDueDateFromIssueBody = exports.getIsValidDate = void 0;
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
exports.oneWeekMs = exports.oneDayMs * 7;
const getIsSoon = (date) => {
    const now = (new Date()).getTime();
    const comparisonDate = (new Date(date)).getTime();
    if (now > comparisonDate) {
        return false;
    }
    const diff = comparisonDate - now;
    return diff <= exports.oneWeekMs;
};
exports.getIsSoon = getIsSoon;
const getIsTodayButFuture = (date) => {
    const now = new Date();
    const comparisonDate = new Date(date);
    // even if it's today, but in the past, return false
    if (now.getTime() > comparisonDate.getTime()) {
        return false;
    }
    return (0, exports.formatDate)(now) === (0, exports.formatDate)(comparisonDate);
};
exports.getIsTodayButFuture = getIsTodayButFuture;
const getIsPastDue = (date) => {
    const now = (new Date()).getTime();
    const comparisonDate = (new Date(date)).getTime();
    if (now < comparisonDate) {
        return false;
    }
    // if it happened yesterday or earlier, it's past due
    const diff = now - comparisonDate;
    const pastDue = diff >= exports.oneDayMs;
    return pastDue;
};
exports.getIsPastDue = getIsPastDue;
//# sourceMappingURL=shared.js.map