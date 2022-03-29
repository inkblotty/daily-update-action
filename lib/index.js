var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fetch = require("node-fetch");
const { URL } = require("url");
const core = require("@actions/core");
const github = require("@actions/github");
const camelcase = require("camelcase");
const GH_TOKEN = process.env.GH_TOKEN;
const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;
const validateInputs = () => {
    if (!GH_TOKEN) {
        throw new Error("Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository");
    }
    const endObj = {};
    const requiredInputs = ["owner", "repo", "discussion_id", "slack_channel_id"];
    requiredInputs.forEach(inputName => {
        const workflowValue = core.getInput(inputName, { require: "true" });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }
        endObj[camelcase(inputName)] = workflowValue;
    });
    return endObj;
};
const aggregateUpdates = (repo) => __awaiter(this, void 0, void 0, function* () {
});
const commentOnDiscussion = ({ discussionId, owner, repo }, discussionCommentText) => __awaiter(this, void 0, void 0, function* () {
    return (github.getOctokit(GH_TOKEN).rest.discussion.createComment({
        owner,
        repo,
        discussion_number: discussionId,
        body: discussionCommentText,
    }));
});
const postInSlack = (slackChannelId) => {
};
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        const { repo, discussionId, slackChannelId, owner, } = validateInputs();
        const discussionCommentText = yield aggregateUpdates(repo);
        yield commentOnDiscussion({ repo, discussionId, owner }, discussionCommentText);
        yield postInSlack(slackChannelId);
    }
    catch (err) {
        core.setFailed(err.message);
    }
}))();
//# sourceMappingURL=index.js.map