import { BaseUpdate } from "./shared.types";
import { getDueDateFromDeepDiveBody } from './shared';

interface DeepDiveIssueUpdate extends BaseUpdate {
    number: number;
    dueDate: string; // ISO
    highPriority?: boolean;
    missingFields?: {
        leader?: boolean;
        notetaker?: boolean;
    };
    missingUpdates?: {
        pastDue?: boolean;
        needsRecording?: boolean;
        needsNotes?: boolean;
    };
}

const oneDayMs = 1000 * 60 * 60 * 24;

const getMissingFieldsFromDeepDiveBody = (issueBody: string): DeepDiveIssueUpdate['missingFields'] => {
    const notetakerRegex = /Notetaker:(.*)?/;
    const leaderRegex = /Lead:(.*)Notetaker/;

    const notetakerMatches = issueBody.replace(/\r\n/g, '').match(notetakerRegex);
    const leaderMatches = issueBody.replace(/\r\n/g, '').match(leaderRegex);

    return { notetaker: !notetakerMatches?.[1], leader: !leaderMatches?.[1] };
}

const getMissingUpdates = async (kit, { dueDate, issueNumber, owner, repo }): Promise<DeepDiveIssueUpdate['missingUpdates']> => {
    // if it happened yesterday or earlier, it's past due
    const pastDue = ((new Date(dueDate).getTime()) - (new Date().getTime())) <= oneDayMs;

    // if it's not pastDue, return early to avoid unneeded api call
    if (!pastDue) {
        return { pastDue };
    }
    
    // grab comments on the issue
    const { data: comments } = await kit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
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
        if (body.includes('/accessibility/blob/main/docs/deep-dive-notes/')) {
            needsNotes = false;
        }
    });

    return { needsRecording, needsNotes, pastDue };
}

export const getDeepDiveIssues = async (kit, { owner, repo }): Promise<DeepDiveIssueUpdate[]> => {
    const labels = "Deep-dive,meeting";
    const allIssues = await kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });
    const allIssuesFormatted = allIssues.reduce(async (arr, issue) => {
        const dueDate = getDueDateFromDeepDiveBody(issue.body);
        if (!dueDate) {
            return arr;
        }

        const missingUpdates: DeepDiveIssueUpdate['missingUpdates'] = await getMissingUpdates(kit, { dueDate, issueNumber: issue.number, owner, repo });
        const mappedIssue: DeepDiveIssueUpdate = {
            dueDate,
            id: issue.id,
            number: issue.number,
            url: issue.url,
            missingFields: getMissingFieldsFromDeepDiveBody(issue.body),
            missingUpdates,
            title: issue.title,
        };

        // check for high priority status
        const isTomorrow = (((new Date()).getTime()) - ((new Date(dueDate)).getTime())) <= oneDayMs;

        if (isTomorrow && (mappedIssue.missingFields.leader || mappedIssue.missingFields.notetaker)) {
           mappedIssue.highPriority = true;
        }

        return [...arr, mappedIssue];
    }, []);

    return allIssuesFormatted;
}

export const formatDeepDiveUpdate = (deepDiveUpdate: DeepDiveIssueUpdate): string => {
    const reason = (() => {
        if (deepDiveUpdate.highPriority) {
            if (deepDiveUpdate.missingFields.leader) {
                return `Needs a leader ${deepDiveUpdate.missingFields.notetaker ? 'and a notetaker' : ''} to volunteer`;
            }
            if (deepDiveUpdate.missingFields.notetaker) {
                return 'Needs a notetaker to volunteer';
            }
        }
        
        if (deepDiveUpdate.missingUpdates?.pastDue) {
            if (deepDiveUpdate.missingUpdates.needsNotes) {
                return 'Needs notes';
            }
            if (deepDiveUpdate.missingUpdates.needsRecording) {
                return 'Needs a rewatch recording';
            }
        } 
    })();
    return `${deepDiveUpdate.highPriority ? ':warning: Tomorrow\'s ' : ''}[${deepDiveUpdate.title}](${deepDiveUpdate.url}): ${reason}`;
}

async function getAndFormatDeepDiveUpdates(kit, { owner, repo }): Promise<string> {
    const allIssues = await getDeepDiveIssues(kit, { owner, repo });
    const updatesArray = allIssues.map(formatDeepDiveUpdate);

    return updatesArray.length
        ? `- ${updatesArray.join('\n')}`
        : '';
}
export default getAndFormatDeepDiveUpdates;
