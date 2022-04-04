export const getDueDateFromDeepDiveBody = (issueBody: string): string => {
    const regex = /## Timing(.*)\[Google Event/
    const matches = issueBody.replace(/\r\n/g, '').match(regex);
    if (!matches) {
        return '';
    }

    const dueDateUnformatted = matches[1];
    if (!dueDateUnformatted) {
        throw new Error('No date found for Deep Dive');
    }
    return (new Date(dueDateUnformatted)).toISOString();
}