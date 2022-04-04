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
exports.formatDailyUpdateUpdate = exports.getDailyUpdateIssues = void 0;
const getDailyUpdateIssues = (kit, { owner, repo }) => __awaiter(void 0, void 0, void 0, function* () {
    const labels = "add-to-daily-update";
    const allIssues = yield Promise.all((yield kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    })).map((issue) => __awaiter(void 0, void 0, void 0, function* () {
        const comments = yield kit.paginate('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            issue_number: issue.number,
            owner,
            repo,
        });
        const dailyUpdateComment = {
            message: ':robot: beep boop I don\'t see a comment for why this is important.',
            url: '',
        };
        comments.forEach(({ body, number }) => {
            if (body.includes('data-daily-update="true"')) {
                dailyUpdateComment.message = body.replace('<div visibility="hidden" data-daily-update="true"></div>', '').replace(/\n/g, '');
                dailyUpdateComment.url = `${issue.url}#issuecomment=${number}`;
            }
        });
        return { id: issue.id, dailyUpdateComment, title: issue.title, url: issue.url };
    })));
    return allIssues;
});
exports.getDailyUpdateIssues = getDailyUpdateIssues;
const formatDailyUpdateUpdate = (updateObj) => {
    var _a, _b;
    const urlMessage = ((_a = updateObj.dailyUpdateComment) === null || _a === void 0 ? void 0 : _a.url)
        ? ` (from [comment](${updateObj.dailyUpdateComment.url}))`
        : '';
    return `[${updateObj.title}](${updateObj.url}): ${(_b = updateObj.dailyUpdateComment) === null || _b === void 0 ? void 0 : _b.message}${urlMessage}`;
};
exports.formatDailyUpdateUpdate = formatDailyUpdateUpdate;
function getAndFormatDailyUpdateUpdates(kit, { owner, repo }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIssues = yield (0, exports.getDailyUpdateIssues)(kit, { owner, repo });
        const updatesArray = allIssues.map(exports.formatDailyUpdateUpdate);
        return updatesArray.length
            ? `- ${updatesArray.join('\n')}`
            : '';
    });
}
exports.default = getAndFormatDailyUpdateUpdates;
//# sourceMappingURL=otherDailyUpdates.js.map