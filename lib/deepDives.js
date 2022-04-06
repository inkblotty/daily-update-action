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
exports.formatDeepDiveUpdate = exports.getAndMapDeepDiveIssues = exports.getMissingUpdates = exports.getMissingFieldsFromDeepDiveBody = void 0;
const shared_1 = require("./shared");
const getMissingFieldsFromDeepDiveBody = (issueBody) => {
    const notetakerRegex = /Notetaker:(.*)?/;
    const leaderRegex = /Lead:(.*)Notetaker/;
    const notetakerMatches = issueBody.replace(/[\r\n\s]/g, '').match(notetakerRegex);
    const leaderMatches = issueBody.replace(/[\r\n\s]/g, '').match(leaderRegex);
    return { notetaker: !(notetakerMatches === null || notetakerMatches === void 0 ? void 0 : notetakerMatches[1]), leader: !(leaderMatches === null || leaderMatches === void 0 ? void 0 : leaderMatches[1]) };
};
exports.getMissingFieldsFromDeepDiveBody = getMissingFieldsFromDeepDiveBody;
const getMissingUpdates = (kit, { dueDate, issueNumber, owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    // if it happened yesterday or earlier, it's past due
    const diff = (new Date()).getTime() - (new Date(dueDate)).getTime();
    const pastDue = diff <= (-1 * shared_1.oneDayMs);
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
exports.getMissingUpdates = getMissingUpdates;
const getAndMapDeepDiveIssues = (kit, { owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "Deep-dive,meeting";
    const allIssues = yield kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });
    const allIssuesFormatted = yield Promise.all(allIssues.filter(issue => {
        const dueDate = (0, shared_1.getDueDateFromIssueBody)(issue.body);
        issue.dueDate = dueDate;
        return !!dueDate;
    }).map((issue) => __awaiter(void 0, void 0, void 0, function* () {
        const missingUpdates = yield (0, exports.getMissingUpdates)(kit, { dueDate: issue.dueDate, issueNumber: issue.number, owner, repo });
        const mappedIssue = {
            dueDate: issue.dueDate,
            id: issue.id,
            number: issue.number,
            url: issue.html_url,
            missingFields: (0, exports.getMissingFieldsFromDeepDiveBody)(issue.body),
            missingUpdates,
            title: issue.title,
        };
        // check for high priority status
        const isTomorrow = (((new Date()).getTime()) - ((new Date(issue.dueDate)).getTime())) <= shared_1.oneDayMs;
        if (isTomorrow && (mappedIssue.missingFields.leader || mappedIssue.missingFields.notetaker)) {
            mappedIssue.highPriority = true;
        }
        return mappedIssue;
    })));
    return allIssuesFormatted;
});
exports.getAndMapDeepDiveIssues = getAndMapDeepDiveIssues;
const formatDeepDiveUpdate = (deepDiveUpdate) => {
    const reason = (() => {
        var _a;
        if (deepDiveUpdate.highPriority) {
            if (deepDiveUpdate.missingFields.leader) {
                return `Needs a leader${deepDiveUpdate.missingFields.notetaker ? ' and a notetaker' : ''} to volunteer`;
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
    if (!reason) {
        return;
    }
    return `${deepDiveUpdate.highPriority ? ':warning: Tomorrow\'s ' : ''}[${deepDiveUpdate.title}](${deepDiveUpdate.url}): ${reason}`;
};
exports.formatDeepDiveUpdate = formatDeepDiveUpdate;
function getAndFormatDeepDiveUpdates(kit, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIssues = yield (0, exports.getAndMapDeepDiveIssues)(kit, { owner, repo });
        const updatesArray = allIssues.map(exports.formatDeepDiveUpdate).filter(update => !!update);
        return updatesArray.length
            ? `- ${updatesArray.join('\n')}`
            : '';
    });
}
exports.default = getAndFormatDeepDiveUpdates;
//# sourceMappingURL=deepDives.js.map