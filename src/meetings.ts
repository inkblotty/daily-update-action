import { getDueDateFromDeepDiveBody } from "./shared";
import { BaseUpdate } from "./shared.types";

const oneDayMs = 1000 * 60 * 60 * 24;

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

        const dueDate = getDueDateFromDeepDiveBody(issue.body);
        const isTomorrow = (((new Date()).getTime()) - ((new Date(dueDate)).getTime())) <= oneDayMs;
        if (!isTomorrow) {
            return arr;
        }

        const notetakerRegex = /Notetaker(.*)?/;
        const notetakerMatches = issue.body.replace(/\r\n/g, '').match(notetakerRegex);
        const needsNotetaker = notetakerMatches?.[0] && !notetakerMatches[1];

        if (needsNotetaker) {
            return [...arr, { url: issue.url, title: issue.title }]
        } else {
            return arr;
        }
    }, []);

    return allMeetingIssuesFormatted;
}

export const formatMeetingUpdate = (meetingUpdate: MeetingIssueUpdate): string => {
    return `:warning: Tomorrow\'s [${meetingUpdate.title}](${meetingUpdate.url}): Needs a notetaker to volunteer`;
}

async function getAndFormatMeetingUpdates(kit, { owner, repo }): Promise<string> {
    const allIssues = await getMeetingIssues(kit, { owner, repo });
    const updatesArray = allIssues.map(formatMeetingUpdate);

    return updatesArray.length
        ? `- ${updatesArray.join('\n')}`
        : '';
}
export default getAndFormatMeetingUpdates;
