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
const getDueDateFromDeepDiveBody = (issueBody) => {
    const regex = /## Timing(?s)(.*)\[Google Event/g;
    const [dueDateUnformatted] = issueBody.match(regex);
    if (!dueDateUnformatted) {
        throw new Error('No date found for Deep Dive');
    }
    return (new Date(dueDateUnformatted)).toISOString();
};
const getMissingFieldsFromDeepDiveBody = (issueBody) => {
    const notetakerRegex = /Notetaker:(?s)(.*)?/g;
    const leaderRegex = /Leader:(?s)(.*)Notetaker/g;
    const [notetaker] = issueBody.match(notetakerRegex);
    const [leader] = issueBody.match(leaderRegex);
    return { notetaker: !!notetaker, leader: !!leader };
};
const getDeepDiveIssues = (kit, { owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "Deep-dive";
    const allIssues = yield kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    }).map(issue => {
        const dueDate = getDueDateFromDeepDiveBody(issue.body);
        const missingUpdates = {};
        const mappedIssue = {
            dueDate,
            id: issue.id,
            url: issue.url,
            missingFields: getMissingFieldsFromDeepDiveBody(issue.body),
            missingUpdates,
            title: issue.title,
        };
        // look for daily update comment
        // check for high priority status
        const oneDayMs = 1000 * 60 * 60 * 24;
        const isTomorrow = ((new Date(dueDate).getTime()) - (new Date().getTime())) <= oneDayMs;
        if (isTomorrow && (mappedIssue.missingFields.leader || mappedIssue.missingFields.leader)) {
            mappedIssue.highPriority = true;
        }
        return mappedIssue;
    });
    return allIssues;
});
exports.getDeepDiveIssues = getDeepDiveIssues;
const formatDeepDiveUpdate = (deepDiveUpdate) => {
    const reason = (() => {
        if (deepDiveUpdate.highPriority) {
            if (deepDiveUpdate.missingFields.leader) {
                return `Needs a leader ${deepDiveUpdate.missingFields.notetaker ? 'and a notetaker' : ''} to volunteer`;
            }
            if (deepDiveUpdate.missingFields.notetaker) {
                return 'Needs a notetaker to volunteer';
            }
        }
        if (deepDiveUpdate.missingUpdates.pastDue) {
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
            ? `<li>${updatesArray.join('</li>\n')}`
            : '';
    });
}
exports.default = getAndFormatDeepDiveUpdates;
//# sourceMappingURL=deepDives.js.map