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
exports.formatDiscussions = exports.getDiscussions = void 0;
const graphql_1 = require("@octokit/graphql");
const gqlQuery = `\
query getDiscussions($searchQuery:String!) {
    search(type: DISCUSSION, query: $searchQuery, last: 20) {
        edges {
          node {
            ... on Discussion {
              title
              url
              comments(last:20) {
                nodes {
                  bodyText
                  url
                }
              }
            }
          }
        }
      }
    }
`;
const getDiscussions = ({ owner, repo }, GH_TOKEN) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = `repo:${owner}/${repo} label:add-to-daily-update`;
    // TODO: get discussions that haven't been closed:
    // newly created discussions
    // discussions with no comments
    const { search } = yield (0, graphql_1.graphql)(gqlQuery, {
        searchQuery,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    const allSearchResultsMapped = search.edges.map(edge => {
        const { title, url, comments } = edge.node;
        const dailyUpdateComment = {
            message: ':robot: beep boop I don\'t see a comment for why this is important.',
            url: '',
        };
        console.log('comments', comments.nodes);
        comments.nodes.forEach(({ bodyText, url }) => {
            if (bodyText.includes('data-daily-update="true"')) {
                dailyUpdateComment.message = bodyText.replace('<div visibility="hidden" data-daily-update="true"></div>', '').replace(/\n/g, '');
                dailyUpdateComment.url = url;
            }
        });
        return { dailyUpdateComment, title, url };
    });
    return allSearchResultsMapped;
});
exports.getDiscussions = getDiscussions;
const formatDiscussions = (updateObj) => {
    var _a, _b, _c;
    const urlMessage = ((_a = updateObj.dailyUpdateComment) === null || _a === void 0 ? void 0 : _a.url)
        ? ` (from [comment](${(_b = updateObj.dailyUpdateComment) === null || _b === void 0 ? void 0 : _b.url}))`
        : '';
    return `[${updateObj.title}](${updateObj.url}): ${(_c = updateObj.dailyUpdateComment) === null || _c === void 0 ? void 0 : _c.message}${urlMessage}`;
};
exports.formatDiscussions = formatDiscussions;
function getAndFormatDiscussions({ owner, repo }, GH_TOKEN) {
    return __awaiter(this, void 0, void 0, function* () {
        const allDiscussions = yield (0, exports.getDiscussions)({ owner, repo }, GH_TOKEN);
        const updatesArray = allDiscussions.map(exports.formatDiscussions);
        return updatesArray.length
            ? `- ${updatesArray.join('\n- ')}`
            : '';
    });
}
exports.default = getAndFormatDiscussions;
//# sourceMappingURL=discussions.js.map