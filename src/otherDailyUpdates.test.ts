import { formatDailyUpdateUpdate } from "./otherDailyUpdates";
import { BaseUpdate } from "./shared.types";

const mockKit = {
    paginate: jest.fn(),
    request: jest.fn(),
}

describe('otherDailyUpdates', () => {
    describe('getDailyUpdateIssues', () => {
    });

    describe('formatDailyUpdates', () => {
        test('has custom comment url', () => {
            const updateObj = {
                dailyUpdateComment: {
                    url: 'https://github.com/somewhere/here/issues/123/#issuecomment=123',
                    message: 'Mockeroni and Cheese'
                },
                url: 'https://github.com/somewhere/here/issues/123',
                title: 'Something important with a daily update comment'
            };
            const output = formatDailyUpdateUpdate(updateObj as BaseUpdate);
            expect(output).toEqual(`[${updateObj.title}](${updateObj.url}): ${updateObj.dailyUpdateComment?.message} (from [comment](${updateObj.dailyUpdateComment.url}))`);
        });

        test('does not have custom comment url', () => {
            const updateObj = {
                dailyUpdateComment: {
                    message: 'Mockeroni and Cheese'
                },
                url: 'https://github.com/somewhere/here/issues/123',
                title: 'Something important with a daily update comment'
            };
            const output = formatDailyUpdateUpdate(updateObj as BaseUpdate);
            expect(output).toEqual(`[${updateObj.title}](${updateObj.url}): ${updateObj.dailyUpdateComment?.message}`);
        });
    });
});
