import { formatDate, getDueDateFromIssueBody } from "./shared";

describe('shared helpers', () => {
    describe('getDueDateFromIssueBody', () => {
        test('no date', () => {
            const body = '\n## Timing\n\n[Google Event]()';
            expect(getDueDateFromIssueBody(body)).toEqual('');
        });

        test('invalid date', () => {
            const body = '\n## Timing\nabc\n[Google Event]()';
            expect(() => getDueDateFromIssueBody(body)).toThrow();
        });

        test('valid date', () => {
            const body = '\n## Timing\nMay 5, 2023\n[Google Event]()';
            expect(getDueDateFromIssueBody(body)).toEqual((new Date('May 5, 2023')).toISOString());
        });
    });

    describe('formatDate', () => {
        test('formats correctly', () => {
            const expectedOutput = 'Sept 29, 2020';
            expect(formatDate(new Date(expectedOutput))).toEqual(expectedOutput);
        });
    });
});
