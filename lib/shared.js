"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsTomorrow = exports.oneDayMs = exports.formatDate = exports.getDueDateFromIssueBody = void 0;
const getDueDateFromIssueBody = (issueBody) => {
    const regex = /## Timing(.*)\[Google Event/;
    const matches = issueBody.replace(/[\r\n]/g, '').match(regex);
    if (!matches || !matches[1]) {
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
    const diff = ((new Date(date)).getTime()) - ((new Date()).getTime());
    // is less than one day apart but not negative
    return diff <= exports.oneDayMs && (diff > 0);
};
exports.getIsTomorrow = getIsTomorrow;
//# sourceMappingURL=shared.js.map