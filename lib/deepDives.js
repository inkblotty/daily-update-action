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
exports.formatDeepDiveUpdate = exports.getDeepDiveIssues = void 0;
const shared_1 = require("./shared");
const oneDayMs = 1000 * 60 * 60 * 24;
const getMissingFieldsFromDeepDiveBody = (issueBody) => {
    const notetakerRegex = /Notetaker:(.*)?/;
    const leaderRegex = /Lead:(.*)Notetaker/;
    const notetakerMatches = issueBody.replace(/\r\n/g, '').match(notetakerRegex);
    const leaderMatches = issueBody.replace(/\r\n/g, '').match(leaderRegex);
    return { notetaker: !(notetakerMatches === null || notetakerMatches === void 0 ? void 0 : notetakerMatches[1]), leader: !(leaderMatches === null || leaderMatches === void 0 ? void 0 : leaderMatches[1]) };
};
const getMissingUpdates = (kit, { dueDate, issueNumber, owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    // if it happened yesterday or earlier, it's past due
    const pastDue = ((new Date(dueDate).getTime()) - (new Date().getTime())) <= oneDayMs;
    // if it's not pastDue, return early to avoid unneeded api call
    if (!pastDue) {
        return { pastDue };
    }
    // grab comments on the issue
    const { data: comments } = yield kit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        issue_number: issueNumber,
        owner,
        repo,
    });
    let needsRecording = true;
    let needsNotes = true;
    comments.forEach(({ body }) => {
        // if there's a link with "github.rewatch" inside, it doesn't need a recording
        if (body.includes('github.rewatch.com')) {
            needsRecording = false;
        }
        // if there's a link to notes, it doesn't need notes
        if (body.includes('/accessibility/blob/main/docs/deep-dive-notes/')) {
            needsNotes = false;
        }
    });
    return { needsRecording, needsNotes, pastDue };
});
const getDeepDiveIssues = (kit, { owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "Deep-dive,meeting";
    const allIssues = yield kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });
    const allIssuesFormatted = allIssues.reduce((arr, issue) => __awaiter(void 0, void 0, void 0, function* () {
        const dueDate = (0, shared_1.getDueDateFromDeepDiveBody)(issue.body);
        if (!dueDate) {
            return arr;
        }
        const missingUpdates = yield getMissingUpdates(kit, { dueDate, issueNumber: issue.number, owner, repo });
        const mappedIssue = {
            dueDate,
            id: issue.id,
            number: issue.number,
            url: issue.url,
            missingFields: getMissingFieldsFromDeepDiveBody(issue.body),
            missingUpdates,
            title: issue.title,
        };
        // check for high priority status
        const isTomorrow = (((new Date()).getTime()) - ((new Date(dueDate)).getTime())) <= oneDayMs;
        if (isTomorrow && (mappedIssue.missingFields.leader || mappedIssue.missingFields.notetaker)) {
            mappedIssue.highPriority = true;
        }
        return [...arr, mappedIssue];
    }), []);
    return allIssuesFormatted;
});
exports.getDeepDiveIssues = getDeepDiveIssues;
const formatDeepDiveUpdate = (deepDiveUpdate) => {
    const reason = (() => {
        var _a;
        if (deepDiveUpdate.highPriority) {
            if (deepDiveUpdate.missingFields.leader) {
                return `Needs a leader ${deepDiveUpdate.missingFields.notetaker ? 'and a notetaker' : ''} to volunteer`;
            }
            if (deepDiveUpdate.missingFields.notetaker) {
                return 'Needs a notetaker to volunteer';
            }
        }
        if ((_a = deepDiveUpdate.missingUpdates) === null || _a === void 0 ? void 0 : _a.pastDue) {
            if (deepDiveUpdate.missingUpdates.needsNotes) {
                return 'Needs notes';
            }
            if (deepDiveUpdate.missingUpdates.needsRecording) {
                return 'Needs a rewatch recording';
            }
        }
    })();
    return `${deepDiveUpdate.highPriority ? ':warning: Tomorrow\'s ' : ''}[${deepDiveUpdate.title}](${deepDiveUpdate.url}): ${reason}`;
};
exports.formatDeepDiveUpdate = formatDeepDiveUpdate;
function getAndFormatDeepDiveUpdates(kit, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIssues = yield (0, exports.getDeepDiveIssues)(kit, { owner, repo });
        const updatesArray = allIssues.map(exports.formatDeepDiveUpdate);
        return updatesArray.length
            ? `- ${updatesArray.join('\n')}`
            : '';
    });
}
exports.default = getAndFormatDeepDiveUpdates;
//# sourceMappingURL=deepDives.js.map