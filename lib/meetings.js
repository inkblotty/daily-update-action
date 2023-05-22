"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMeetingUpdate = exports.getMeetingIssues = void 0;
const shared_1 = require("./shared");
const getMeetingIssues = (kit, { repo, owner }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "meeting"; // ensure that "Deep-dive" label is filtered out
    const allIssues = yield kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });
    const allMeetingIssuesFormatted = allIssues.reduce((arr, issue) => {
        const isDeepDive = (issue.labels.filter(label => label.name === 'Deep-dive')).length;
        if (isDeepDive) {
            return arr;
        }
        const dueDate = (0, shared_1.getDueDateFromIssueBody)(issue.body);
        const isSoon = (0, shared_1.getIsWithinFutureDays)(new Date(dueDate), 7);
        if (!isSoon) {
            return arr;
        }
        const notetakerRegex = /Facilitator(.*)?/;
        const notetakerMatches = issue.body.replace(/\r\n/g, '').match(notetakerRegex);
        const needsNotetaker = (notetakerMatches === null || notetakerMatches === void 0 ? void 0 : notetakerMatches[0]) && !notetakerMatches[1];
        if (needsNotetaker) {
            return [...arr, { url: issue.html_url, title: issue.title }];
        }
        else {
            return arr;
        }
    }, []);
    return allMeetingIssuesFormatted;
});
exports.getMeetingIssues = getMeetingIssues;
const formatMeetingUpdate = (meetingUpdate) => {
    return `:warning: Deadline: [${meetingUpdate.title}](${meetingUpdate.url}): Needs a facilitator to volunteer`;
};
exports.formatMeetingUpdate = formatMeetingUpdate;
function getAndFormatMeetingUpdates(kit, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIssues = yield (0, exports.getMeetingIssues)(kit, { owner, repo });
        const updatesArray = allIssues.map(exports.formatMeetingUpdate);
        return updatesArray.length
            ? `- ${updatesArray.join('\n')}`
            : '';
    });
}
exports.default = getAndFormatMeetingUpdates;
//# sourceMappingURL=meetings.js.map