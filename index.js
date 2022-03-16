
#!/usr/bin/env node
const fetch = require("node-fetch");
const { URL } = require("url");
const core = require("@actions/core");
const github = require("@actions/github");
const camelcase = require("camelcase");

const GH_TOKEN = process.env.GH_TOKEN;
const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;

const validateInputs = () => {
    if (!GH_TOKEN) {
      throw new Error(
        "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
      );
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
}

const aggregateUpdates = async (repo) => {

}

const commentOnDiscussion = async ({ discussionId, owner, repo }, discussionCommentText) => (
    github.getOctokit(GH_TOKEN).rest.discussion.createComment({
        owner,
        repo,
        discussion_number: discussionId,
        body: discussionCommentText,
    })
);

const postInSlack = (slackChannelId) => {

}

(async () => {
    try {
        const {
            repo,
            discussionId,
            slackChannelId,
            owner,
        } = validateInputs;
        const discussionCommentText = await aggregateUpdates(repo);
        await commentOnDiscussion({ repo, discussionId, owner }, discussionCommentText);
        await postInSlack(slackChannelId);
    } catch (err) {
        core.setFailed(error.message);
    }
})();
