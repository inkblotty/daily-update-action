import { BaseUpdate } from "./shared.types";
import { getDueDateFromIssueBody, getIsPastDue, getIsTodayButFuture, getIsWithinFutureDays } from './shared';

interface TeamShowAndSupportIssueUpdate extends BaseUpdate {
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

export const getMissingFieldsFromTeamShowAndSupportBody = (issueBody: string): TeamShowAndSupportIssueUpdate['missingFields'] => {
    const notetakerRegex = /Notetaker:(.*)?/;
    const leaderRegex = /Lead:(.*)Notetaker/;

    const notetakerMatches = issueBody.replace(/[\r\n\s]/g, '').match(notetakerRegex);
    const leaderMatches = issueBody.replace(/[\r\n\s]/g, '').match(leaderRegex);

    return { notetaker: !notetakerMatches?.[1], leader: !leaderMatches?.[1] };
}

export const getMissingUpdates = async (kit, { dueDate, issueNumber, owner, repo }): Promise<TeamShowAndSupportIssueUpdate['missingUpdates']> => {
    const pastDue = getIsPastDue(dueDate);

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
        if (body.includes('/accessibility/blob/main/docs/team-show-and-support-notes/') || body.includes('/accessibility/blob/main/docs/deep-dive-notes/')) {
            needsNotes = false;
        }
    });

    return { needsRecording, needsNotes, pastDue };
}

export const getAndMapTeamShowAndSupportIssues = async (kit, { owner, repo }): Promise<TeamShowAndSupportIssueUpdate[]> => {
    const labels = "team-show-and-support,meeting";
    const allIssues = await kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    });
    const allIssuesFormatted = await Promise.all(allIssues.filter(issue => {
        const dueDate = getDueDateFromIssueBody(issue.body);
        issue.dueDate = dueDate;
        return !!dueDate;
    }).map(async (issue) => {
        const missingUpdates: TeamShowAndSupportIssueUpdate['missingUpdates'] = await getMissingUpdates(kit, { dueDate: issue.dueDate, issueNumber: issue.number, owner, repo });
        const mappedIssue: TeamShowAndSupportIssueUpdate = {
            dueDate: issue.dueDate,
            id: issue.id,
            number: issue.number,
            url: issue.html_url,
            missingFields: getMissingFieldsFromTeamShowAndSupportBody(issue.body),
            missingUpdates,
            title: issue.title,
        };

        // check for high priority status
        const isTomorrowOrToday = getIsWithinFutureDays(issue.dueDate, 1) || getIsTodayButFuture(issue.dueDate);
        
        if (isTomorrowOrToday && (mappedIssue.missingFields.leader || mappedIssue.missingFields.notetaker)) {
            mappedIssue.highPriority = true;
        }

        return mappedIssue;
    }));

    return allIssuesFormatted;
}

export const formatTeamShowAndSupportUpdate = (teamShowAndSupportUpdate: TeamShowAndSupportIssueUpdate): string => {
    const reason = (() => {
        if (teamShowAndSupportUpdate.highPriority) {
            if (teamShowAndSupportUpdate.missingFields.leader) {
                return `Needs a leader${teamShowAndSupportUpdate.missingFields.notetaker ? ' and a notetaker' : ''} to volunteer`;
            }
            if (teamShowAndSupportUpdate.missingFields.notetaker) {
                return 'Needs a notetaker to volunteer';
            }
        }
        
        if (teamShowAndSupportUpdate.missingUpdates?.pastDue) {
            if (teamShowAndSupportUpdate.missingUpdates.needsNotes) {
                return 'Needs notes';
            }
            if (teamShowAndSupportUpdate.missingUpdates.needsRecording) {
                return 'Needs a rewatch recording';
            }
        } 
    })();
    if (!reason) {
        return;
    }
    return `${teamShowAndSupportUpdate.highPriority ? ':warning: Deadline: ' : ''}[${teamShowAndSupportUpdate.title}](${teamShowAndSupportUpdate.url}): ${reason}`;
}

async function getAndFormatTeamShowAndSupportUpdates(kit, { owner, repo }): Promise<string> {
    const allIssues = await getAndMapTeamShowAndSupportIssues(kit, { owner, repo });
    const updatesArray = allIssues.map(formatTeamShowAndSupportUpdate).filter(update => !!update);

    return updatesArray.length
        ? `- ${updatesArray.join('\n')}`
        : '';
}
export default getAndFormatTeamShowAndSupportUpdates;
