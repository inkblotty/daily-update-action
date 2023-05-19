import { getDueDateFromIssueBody, getIsSoon } from "./shared";
import { BaseUpdate } from "./shared.types";

interface MeetingIssueUpdate extends BaseUpdate {}

export const getMeetingIssues = async (kit, { repo, owner }) => {
    const labels = "meeting"; // ensure that "Deep-dive" label is filtered out

    const allIssues = await kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });

    const allMeetingIssuesFormatted = allIssues.reduce((arr, issue) => {
        const isDeepDive = (issue.labels.filter(label => label.name === 'Deep-dive')).length;
        if (isDeepDive) {
            return arr;
        }

        const dueDate = getDueDateFromIssueBody(issue.body);
        const isSoon = getIsSoon(new Date(dueDate));
        if (!isSoon) {
            return arr;
        }

        const notetakerRegex = /Facilitator(.*)?/;
        const notetakerMatches = issue.body.replace(/\r\n/g, '').match(notetakerRegex);
        const needsNotetaker = notetakerMatches?.[0] && !notetakerMatches[1];

        if (needsNotetaker) {
            return [...arr, { url: issue.html_url, title: issue.title }]
        } else {
            return arr;
        }
    }, []);

    return allMeetingIssuesFormatted;
}

export const formatMeetingUpdate = (meetingUpdate: MeetingIssueUpdate): string => {
    return `:warning: Deadline: [${meetingUpdate.title}](${meetingUpdate.url}): Needs a facilitator to volunteer`;
}

async function getAndFormatMeetingUpdates(kit, { owner, repo }): Promise<string> {
    const allIssues = await getMeetingIssues(kit, { owner, repo });
    const updatesArray = allIssues.map(formatMeetingUpdate);

    return updatesArray.length
        ? `- ${updatesArray.join('\n')}`
        : '';
}
export default getAndFormatMeetingUpdates;
