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
exports.formatTeamShowAndSupportUpdate = exports.getAndMapTeamShowAndSupportIssues = exports.getMissingUpdates = exports.getMissingFieldsFromTeamShowAndSupportBody = void 0;
const shared_1 = require("./shared");
const getMissingFieldsFromTeamShowAndSupportBody = (issueBody) => {
    const notetakerRegex = /Notetaker:(.*)?/;
    const leaderRegex = /Lead:(.*)Notetaker/;
    const notetakerMatches = issueBody.replace(/[\r\n\s]/g, '').match(notetakerRegex);
    const leaderMatches = issueBody.replace(/[\r\n\s]/g, '').match(leaderRegex);
    return { notetaker: !(notetakerMatches === null || notetakerMatches === void 0 ? void 0 : notetakerMatches[1]), leader: !(leaderMatches === null || leaderMatches === void 0 ? void 0 : leaderMatches[1]) };
};
exports.getMissingFieldsFromTeamShowAndSupportBody = getMissingFieldsFromTeamShowAndSupportBody;
const getMissingUpdates = (kit, { dueDate, issueNumber, owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const pastDue = (0, shared_1.getIsPastDue)(dueDate);
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
        if (body.includes('/accessibility/blob/main/docs/team-show-and-support-notes/') || body.includes('/accessibility/blob/main/docs/deep-dive-notes/')) {
            needsNotes = false;
        }
    });
    return { needsRecording, needsNotes, pastDue };
});
exports.getMissingUpdates = getMissingUpdates;
const getAndMapTeamShowAndSupportIssues = (kit, { owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "team-show-and-support,meeting";
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
            missingFields: (0, exports.getMissingFieldsFromTeamShowAndSupportBody)(issue.body),
            missingUpdates,
            title: issue.title,
        };
        // check for high priority status
        const isTomorrowOrToday = (0, shared_1.getIsWithinFutureDays)(issue.dueDate, 1) || (0, shared_1.getIsTodayButFuture)(issue.dueDate);
        if (isTomorrowOrToday && (mappedIssue.missingFields.leader || mappedIssue.missingFields.notetaker)) {
            mappedIssue.highPriority = true;
        }
        return mappedIssue;
    })));
    return allIssuesFormatted;
});
exports.getAndMapTeamShowAndSupportIssues = getAndMapTeamShowAndSupportIssues;
const formatTeamShowAndSupportUpdate = (teamShowAndSupportUpdate) => {
    const reason = (() => {
        var _a;
        if (teamShowAndSupportUpdate.highPriority) {
            if (teamShowAndSupportUpdate.missingFields.leader) {
                return `Needs a leader${teamShowAndSupportUpdate.missingFields.notetaker ? ' and a notetaker' : ''} to volunteer`;
            }
            if (teamShowAndSupportUpdate.missingFields.notetaker) {
                return 'Needs a notetaker to volunteer';
            }
        }
        if ((_a = teamShowAndSupportUpdate.missingUpdates) === null || _a === void 0 ? void 0 : _a.pastDue) {
            if (teamShowAndSupportUpdate.missingUpdates.needsNotes) {
                return 'Needs notes';
            }
            if (teamShowAndSupportUpdate.missingUpdates.needsRecording) {
                return 'Needs a rewatch recording';
            }
        }
    })();
    if (!reason) {
        return;
    }
    return `${teamShowAndSupportUpdate.highPriority ? ':warning: Deadline: ' : ''}[${teamShowAndSupportUpdate.title}](${teamShowAndSupportUpdate.url}): ${reason}`;
};
exports.formatTeamShowAndSupportUpdate = formatTeamShowAndSupportUpdate;
function getAndFormatTeamShowAndSupportUpdates(kit, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIssues = yield (0, exports.getAndMapTeamShowAndSupportIssues)(kit, { owner, repo });
        const updatesArray = allIssues.map(exports.formatTeamShowAndSupportUpdate).filter(update => !!update);
        return updatesArray.length
            ? `- ${updatesArray.join('\n')}`
            : '';
    });
}
exports.default = getAndFormatTeamShowAndSupportUpdates;
//# sourceMappingURL=teamShowAndSupport.js.map