import { BaseUpdate } from "./shared.types";

interface DailyUpdateObj extends BaseUpdate {
}

export const getDailyUpdateIssues = async (kit, { owner, repo }) => {
    const labels = "add-to-daily-update";

    const allIssues = await Promise.all((await kit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        labels,
        state: 'open'
    })).map(async (issue) => {
        const comments = await kit.paginate('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            issue_number: issue.number,
            owner,
            repo,
        });

        const dailyUpdateComment : DailyUpdateObj['dailyUpdateComment'] = {
            message: ':robot: beep boop I don\'t see a comment for why this is important.',
            url: '',
        };
        comments.forEach(({ body, html_url }) => {
            if (body.includes('data-daily-update="true"')) {
                dailyUpdateComment.message = body.replace('<div visibility="hidden" data-daily-update="true"></div>', '').replace(/\n/g, '');
                dailyUpdateComment.url = html_url;
            }
        });
        
        return { id: issue.id, dailyUpdateComment, title: issue.title, url: issue.html_url };
    }));
    
    return allIssues;
}

export const formatDailyUpdateUpdate = (updateObj: DailyUpdateObj): string => {
    const urlMessage = updateObj.dailyUpdateComment?.url
        ? ` (from [comment](${updateObj.dailyUpdateComment?.url}))`
        : '';
    return `[${updateObj.title}](${updateObj.url}): ${updateObj.dailyUpdateComment?.message}${urlMessage}`;
}

async function getAndFormatDailyUpdateUpdates(kit, { owner, repo }): Promise<string> {
    const allIssues = await getDailyUpdateIssues(kit, { owner, repo });
    const updatesArray = allIssues.map(formatDailyUpdateUpdate);

    return updatesArray.length
        ? `- ${updatesArray.join('\n- ')}`
        : '';
}
export default getAndFormatDailyUpdateUpdates;
