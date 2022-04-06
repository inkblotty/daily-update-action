import { WebClient } from "@slack/web-api";
import { graphql } from "@octokit/graphql";
import getAndFormatDeepDiveUpdates from "./deepDives";
import getAndFormatMeetingUpdates from "./meetings";
import getAndFormatDailyUpdateUpdates from "./otherDailyUpdates";
import { formatDate } from "./shared";

const core = require("@actions/core");
const github = require("@actions/github");
const camelcase = require("camelcase");

const GH_TOKEN = process.env.GH_TOKEN;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;

interface ValidatedInput {
    discussionId?: string;
    owner?: string;
    repo?: string;
    slackChannelId?: string;
}
const validateInputs = (): ValidatedInput => {
    if (!GH_TOKEN) {
      throw new Error(
        "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
      );
    }

    const endObj: ValidatedInput = {};

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

const aggregateAndFormatUpdates = async (repo: ValidatedInput['repo'], owner: ValidatedInput['owner']) => {
    const deepDiveUpdates = await getAndFormatDeepDiveUpdates(github.getOctokit(GH_TOKEN), { repo, owner });
    const otherMeetingUpdates = await getAndFormatMeetingUpdates(github.getOctokit(GH_TOKEN), { repo, owner });
    const otherDailyUpdates = await getAndFormatDailyUpdateUpdates(github.getOctokit(GH_TOKEN), { repo, owner });

    const today = new Date();
    return `\
## Daily Update for **${formatDate(today)}**:
${deepDiveUpdates}
${otherMeetingUpdates}
${otherDailyUpdates}

:robot: Automated using [daily-update-action](https://github.com/inkblotty/daily-update-action)
`;
}

const commentOnDiscussion = async ({ discussionId, owner, repo }: ValidatedInput, discussionCommentText) => {
    const discussionResponse = await graphql(
        `
        query getDiscussionId($owner: String!, $repo: String!, $number: Int!) {
            repository(owner: $owner, name: $repo) {
                discussion(number: $number) {
                    id
                }
            }
        }
        `,
        {
            owner,
            repo,
            number: parseInt(discussionId || '0'),
            headers: {
                authorization: `token ${GH_TOKEN}`
            },
        }
    );

    const response = await graphql(
        `
        mutation myMutation($input: AddDiscussionCommentInput!) {
            addDiscussionComment(input: $input) {
              comment {
                url
              }
            }
          }
        `
    , {
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
    return { url: response.addDiscussionComment?.comment?.url || '' };
}

const slack = new WebClient(SLACK_TOKEN);
const postInSlack = async (slackChannelId: ValidatedInput['slackChannelId'], commentUrl: string) => {
    if (!SLACK_TOKEN) {
        return;
    }
    return await slack.chat.postMessage({
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
}

(async () => {
    try {
        const {
            repo,
            discussionId,
            slackChannelId,
            owner,
        } = validateInputs();
        const discussionCommentText = await aggregateAndFormatUpdates(repo, owner);
        const { url: commentUrl } = await commentOnDiscussion({ repo, discussionId, owner }, discussionCommentText);
        await postInSlack(slackChannelId, commentUrl);
    } catch (err) {
        core.setFailed(err.message);
    }
})();
