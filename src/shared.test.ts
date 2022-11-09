import { formatDate, getDueDateFromIssueBody, getIsPastDue, getIsTomorrow, getIsValidDate, oneDayMs } from "./shared";

describe('shared helpers', () => {
    describe('getDueDateFromIssueBody', () => {
        test('no date', () => {
            const body = '\n## Timing\n\n[Google Event]()';
            expect(getDueDateFromIssueBody(body)).toEqual('');
        });

        test('invalid date', () => {
            const body = '\n## Timing\nabc\n[Google Event]()';
            expect(getDueDateFromIssueBody(body)).toEqual('');
        });

        test('valid date', () => {
            const body = '\n## Timing\nMay 5, 2023\n[Google Event]()';
            expect(getDueDateFromIssueBody(body)).toEqual((new Date('May 5, 2023')).toISOString());
        });
    });

    describe('getIsValidDate', () => {
        test('valid date string', () => {
            const result1 = getIsValidDate('2022-01-01');
            expect(result1).toEqual(true);
        });

        test('valid date object', () => {
            const result2 = getIsValidDate(new Date());
            expect(result2).toEqual(true);
        });

        test('invalid date string', () => {
            const result3 = getIsValidDate('random words');
            expect(result3).toEqual(false);
        });
    })

    describe('formatDate', () => {
        test('formats correctly', () => {
            const expectedOutput = 'Sept 29, 2020';
            expect(formatDate(new Date(expectedOutput))).toEqual(expectedOutput);
        });
    });

    describe('getIsTomorrow', () => {
        test('past returns false', () => {
            const date = new Date((new Date()).getTime() - (oneDayMs / 2));
            const result = getIsTomorrow(date);
            expect(result).toEqual(false);
        });

        test('too far in the future returns false', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs * 1.5));
            const result = getIsTomorrow(date);
            expect(result).toEqual(false);
        });

        test('very far in the future returns false', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs * 4));
            const result = getIsTomorrow(date);
            expect(result).toEqual(false);
        });

        test('tomorrow returns true', () => {
            const date = new Date((new Date()).getTime() + oneDayMs);
            const result = getIsTomorrow(date);
            expect(result).toEqual(true);
        });
    });

    describe('getIsPastDue', () => {
        test('near past returns true', () => {
            const date = new Date((new Date()).getTime() - oneDayMs);
            const result = getIsPastDue(date);
            expect(result).toEqual(true);
        });

        test('distance past returns true', () => {
            const date = new Date((new Date()).getTime() - (oneDayMs * 5));
            const result = getIsPastDue(date);
            expect(result).toEqual(true);
        });

        test('too far in the future returns false', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs * 1.5));
            const result = getIsPastDue(date);
            expect(result).toEqual(false);
        });

        test('very far in the future returns false', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs * 4));
            const result = getIsPastDue(date);
            expect(result).toEqual(false);
        });

        test('tomorrow returns false', () => {
            const date = new Date((new Date()).getTime() + oneDayMs);
            const result = getIsPastDue(date);
            expect(result).toEqual(false);
        });
    });
});
