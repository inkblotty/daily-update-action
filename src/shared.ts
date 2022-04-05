export const getDueDateFromIssueBody = (issueBody: string): string => {
    const regex = /## Timing(.*)\[Google Event/;
    const matches = issueBody.replace(/[\r\n]/g, '').match(regex);
    if (!matches || !matches[1]) {
        return '';
    }

    return (new Date(matches[1])).toISOString();
}

export const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export const oneDayMs = 1000 * 60 * 60 * 24;