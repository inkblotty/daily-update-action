export const getIsValidDate = (date: any): boolean => {
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate);
}

export const getDueDateFromIssueBody = (issueBody: string): string => {
    const regex = /## Timing(.*)\[Google Event/;
    const matches = issueBody.replace(/[\r\n]/g, '').match(regex);
    if (!matches || !matches[1] || !getIsValidDate(matches[1])) {
        console.log('\n invalid date detected in issue:', issueBody, '\n');
        return '';
    }

    return (new Date(matches[1])).toISOString();
}

export const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export const oneDayMs = 1000 * 60 * 60 * 24;

export const getIsTomorrow = (date: Date): boolean => {
    const now = (new Date()).getTime();
    const comparisonDate = (new Date(date)).getTime();

    if (now > comparisonDate) {
        return false;
    }

    const diff = comparisonDate - now;
    return diff <= oneDayMs;
}

export const getIsTodayButFuture = (date: Date): boolean => {
    const now = new Date();
    const comparisonDate = new Date(date);

    // even if it's today, but in the past, return false
    if (now.getTime() > comparisonDate.getTime()) {
        return false;
    }

    return formatDate(now) === formatDate(comparisonDate);
}

export const getIsPastDue = (date: Date): boolean => {
    const now = (new Date()).getTime();
    const comparisonDate = (new Date(date)).getTime();

    if (now < comparisonDate) {
        return false;
    }

    // if it happened yesterday or earlier, it's past due
    const diff = now - comparisonDate;
    const pastDue = diff >= oneDayMs;
    return pastDue;
}
