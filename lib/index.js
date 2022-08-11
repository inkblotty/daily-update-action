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
const web_api_1 = require("@slack/web-api");
const graphql_1 = require("@octokit/graphql");
const deepDives_1 = require("./deepDives");
const meetings_1 = require("./meetings");
const otherDailyUpdates_1 = require("./otherDailyUpdates");
const shared_1 = require("./shared");
const discussions_1 = require("./discussions");
const dayCheck_1 = require("./dayCheck");
const core = require("@actions/core");
const github = require("@actions/github");
const camelcase = require("camelcase");
const GH_TOKEN = process.env.GH_TOKEN;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;
const validateInputs = () => {
    if (!GH_TOKEN) {
        throw new Error("Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository");
    }
    const endObj = {};
    const requiredInputs = ["owner", "repo", "discussion_id", "slack_channel_id"];
    requiredInputs.forEach(inputName => {
        const workflowValue = core.getInput(inputName, { required: "true" });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }
        endObj[camelcase(inputName)] = workflowValue;
    });
    return endObj;
};
const aggregateAndFormatUpdates = (repo, owner) => __awaiter(void 0, void 0, void 0, function* () {
    const deepDiveUpdates = yield (0, deepDives_1.default)(github.getOctokit(GH_TOKEN), { repo, owner });
    const otherMeetingUpdates = yield (0, meetings_1.default)(github.getOctokit(GH_TOKEN), { repo, owner });
    const discussionUpdates = yield (0, discussions_1.default)({ owner, repo }, GH_TOKEN);
    const otherDailyUpdates = yield (0, otherDailyUpdates_1.default)(github.getOctokit(GH_TOKEN), { repo, owner });
    const dayCheck = yield (0, dayCheck_1.getSpecificDayUpdate)();
    const messageBody = !deepDiveUpdates && !otherDailyUpdates && !otherMeetingUpdates && !discussionUpdates && !dayCheck
        ? 'No updates for today. Thanks for checking in!'
        : `\
${deepDiveUpdates}
${otherMeetingUpdates}
${discussionUpdates}
${otherDailyUpdates}
${dayCheck}
        `;
    const today = new Date();
    return `\
## Daily Update for **${(0, shared_1.formatDate)(today)}**:
${messageBody}

:robot: Automated using [daily-update-action](https://github.com/inkblotty/daily-update-action)
`;
});
const commentOnDiscussion = ({ discussionId, owner, repo }, discussionCommentText) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const discussionResponse = yield (0, graphql_1.graphql)(`
        query getDiscussionId($owner: String!, $repo: String!, $number: Int!) {
            repository(owner: $owner, name: $repo) {
                discussion(number: $number) {
                    id
                }
            }
        }
        `, {
        owner,
        repo,
        number: parseInt(discussionId || '0'),
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    const response = yield (0, graphql_1.graphql)(`
        mutation myMutation($input: AddDiscussionCommentInput!) {
            addDiscussionComment(input: $input) {
              comment {
                url
              }
            }
          }
        `, {
        owner,
        repo,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
        input: {
            // @ts-ignore
            discussionId: discussionResponse.repository.discussion.id,
            body: discussionCommentText,
        },
    });
    // @ts-ignore
    return { url: ((_b = (_a = response.addDiscussionComment) === null || _a === void 0 ? void 0 : _a.comment) === null || _b === void 0 ? void 0 : _b.url) || '' };
});
const slack = new web_api_1.WebClient(SLACK_TOKEN);
const postInSlack = (slackChannelId, commentUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!SLACK_TOKEN) {
        return;
    }
    return yield slack.chat.postMessage({
        channel: slackChannelId,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: ":daisy: A new Daily Update has been posted"
                }
            },
            {
                type: "section",
                text: {
                    type: 'mrkdwn',
                    text: `<${commentUrl}|Read the update here>`
                }
            }
        ],
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { repo, discussionId, slackChannelId, owner, } = validateInputs();
        const discussionCommentText = yield aggregateAndFormatUpdates(repo, owner);
        const { url: commentUrl } = yield commentOnDiscussion({ repo, discussionId, owner }, discussionCommentText);
        yield postInSlack(slackChannelId, commentUrl);
    }
    catch (err) {
        core.setFailed(err.message);
    }
}))();
//# sourceMappingURL=index.js.map