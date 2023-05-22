import { formatDate, getDueDateFromIssueBody, getIsPastDue, getIsTodayButFuture, getIsWithinFutureDays, getIsValidDate, oneDayMs } from "./shared";

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

    describe('getIsWithinFutureDays', () => {
        const oneWeekMs = oneDayMs * 7;

        test('past returns false', () => {
            const lastWeek = new Date((new Date()).getTime() - (oneWeekMs / 2));
            expect(getIsWithinFutureDays(lastWeek, 7)).toEqual(false);

            const yesterday = new Date((new Date()).getTime() - (oneDayMs / 2));
            expect(getIsWithinFutureDays(yesterday, 1)).toEqual(false);
        });

        test('too far in the future returns false', () => {
            const twoWeeksFromNow = new Date((new Date()).getTime() + (oneWeekMs * 1.5));
            expect(getIsWithinFutureDays(twoWeeksFromNow, 7)).toEqual(false);

            const twoDaysFromNow = new Date((new Date()).getTime() + (oneDayMs * 1.5));
            expect(getIsWithinFutureDays(twoDaysFromNow, 1)).toEqual(false);
        });

        test('very far in the future returns false', () => {
            const fourWeeksFromNow = new Date((new Date()).getTime() + (oneWeekMs * 4));
            expect(getIsWithinFutureDays(fourWeeksFromNow, 7)).toEqual(false);

            const fourDaysFromNow = new Date((new Date()).getTime() + (oneDayMs * 4));
            expect(getIsWithinFutureDays(fourDaysFromNow, 1)).toEqual(false);
        });

        test('one week out returns true', () => {
            const nextWeek = new Date((new Date()).getTime() + oneWeekMs);
            expect(getIsWithinFutureDays(nextWeek, 7)).toEqual(true);
        });

        test('less than one week out, but still not tomorrow is true', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs * 4));
            expect(getIsWithinFutureDays(date, 7)).toEqual(true);
        });

        test('tomorrow returns true', () => {
            const tomorrow = new Date((new Date()).getTime() + oneDayMs);
            expect(getIsWithinFutureDays(tomorrow, 1)).toEqual(true);
        });

        test('less than tomorrow, but still not past is true', () => {
            const date = new Date((new Date()).getTime() + (oneDayMs / 50));
            expect(getIsWithinFutureDays(date, 1)).toEqual(true);
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

    describe('getIsTodayButFuture', () => {
        test('today and future', () => {
            const date = new Date((new Date()).getTime() + 1);
            const result = getIsTodayButFuture(date);
            expect(result).toEqual(true);
        });

        test('today and past', () => {
            const date = new Date((new Date()).getTime() - 1);
            const result = getIsTodayButFuture(date);
            expect(result).toEqual(false);
        });

        test('not today but future', () => {
            const date = new Date((new Date()).getTime() + oneDayMs);
            const result = getIsTodayButFuture(date);
            expect(result).toEqual(false);
        });

        test('not today and past', () => {
            const date = new Date((new Date()).getTime() - oneDayMs);
            const result = getIsTodayButFuture(date);
            expect(result).toEqual(false);
        })
    })
});
