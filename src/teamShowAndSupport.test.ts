import { formatTeamShowAndSupportUpdate, getAndMapTeamShowAndSupportIssues, getMissingFieldsFromTeamShowAndSupportBody, getMissingUpdates } from "./teamShowAndSupport";
import { formatDate, oneDayMs } from "./shared";

const mockKit = {
    paginate: jest.fn(),
    request: jest.fn(),
}

const mockData = {
    issueNumber: 123,
    owner: 'organization-abc',
    repo: 'repo-man',
}

describe('Team Show & Support', () => {
    describe('getMissingFieldsFromTeamShowAndSupportBody', () => {
        test('Nothing missing returns falses', () => {
            const issueBody1 = 'Lead: @person\nNotetaker: @anotherperson';
            const output = getMissingFieldsFromTeamShowAndSupportBody(issueBody1);
            expect(output.leader).toEqual(false);
            expect(output.notetaker).toEqual(false);
        });

        test('Lead missing returns leader true', () => {
            const issueBody2 = 'Lead:\nNotetaker: @anotherperson';
            const output = getMissingFieldsFromTeamShowAndSupportBody(issueBody2);
            expect(output.leader).toEqual(true);
            expect(output.notetaker).toEqual(false);
        });

        test('Notetaker missing returns notetaker true', () => {
            const issueBody3 = 'Lead: @person\nNotetaker:';
            const output = getMissingFieldsFromTeamShowAndSupportBody(issueBody3);
            expect(output.leader).toEqual(false);
            expect(output.notetaker).toEqual(true);
        });

        test('Both missing returns both true', () => {
            const issueBody4 = 'Lead:\nNotetaker:';
            const output = getMissingFieldsFromTeamShowAndSupportBody(issueBody4);
            expect(output.leader).toEqual(true);
            expect(output.notetaker).toEqual(true);
        });
    });

    describe('getMissingUpdates', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('is pastDue', () => {
            test('needs a recording', async () => {
                mockKit.request.mockResolvedValueOnce({
                    data: [
                            {
                                body: 'blah blah'
                            }
                        ],
                });

                const dueDate = (new Date()).getTime() - (oneDayMs * 2);
                const result = await getMissingUpdates(mockKit, { dueDate, ...mockData });
                expect(result.pastDue).toEqual(true);
                expect(result.needsRecording).toEqual(true);
            });

            test('doesn\'t need a recording', async () => {
                mockKit.request.mockResolvedValueOnce({
                    data: [
                            {
                                body: 'something something github.rewatch.com'
                            }
                        ],
                });

                const dueDate = (new Date()).getTime() - (oneDayMs * 2);
                const result = await getMissingUpdates(mockKit, { dueDate, ...mockData });
                expect(result.pastDue).toEqual(true);
                expect(result.needsRecording).toEqual(false);
            });

            test('needs notes', async () => {
                mockKit.request.mockResolvedValueOnce({
                    data: [
                            {
                                body: 'blah blah'
                            }
                        ],
                });

                const dueDate = (new Date()).getTime() - (oneDayMs * 2);
                const result = await getMissingUpdates(mockKit, { dueDate, ...mockData });
                expect(result.pastDue).toEqual(true);
                expect(result.needsNotes).toEqual(true);
            });

            test('doesn\'t need notes', async () => {
                mockKit.request.mockResolvedValueOnce({
                    data: [
                            {
                                body: '[some notes](https://github.com/github/accessibility/blob/main/docs/team-show-and-support-notes/'
                            }
                        ],
                });

                const dueDate = (new Date()).getTime() - (oneDayMs * 2);
                const result = await getMissingUpdates(mockKit, { dueDate, ...mockData });
                expect(result.pastDue).toEqual(true);
                expect(result.needsNotes).toEqual(false);
            });
        });

        describe('not pastDue', () => {
            test('not pastDue returns pastDue: false', async () => {
                mockKit.request.mockResolvedValueOnce({
                    data: [],
                });

                const dueDate = (new Date()).getTime() + (oneDayMs * 2);
                const result = await getMissingUpdates(mockKit, { dueDate, ...mockData });
                expect(result.pastDue).toEqual(false);
            });
        });
    });

    describe('getAndMapTeamShowAndSupportIssues', () => {
        const lessThanOneDayInFuture = (new Date().getTime()) + (oneDayMs / 24);
        const lessThanOneDayInFutureFormatted = formatDate(new Date(lessThanOneDayInFuture));

        const mockResponse = [
            // no due date -- should be filtered out
            {
                id: 1,
                number: 101,
                html_url: `https://github.com/${mockData.owner}/${mockData.repo}/issues/1`,
                body: 'random stuff',
                title: 'Issue 1'
            },
            // lessThanOneDayInFuture and missing something
            {
                id: 2,
                number: 102,
                html_url: `https://github.com/${mockData.owner}/${mockData.repo}/issues/2`,
                body: `## Timing\n${lessThanOneDayInFutureFormatted}\n[Google Event]()\nLead:\nNotetaker:@person`,
                title: 'Issue 2'
            },
            // is pastDue and missing something
            {
                id: 3,
                number: 103,
                html_url: `https://github.com/${mockData.owner}/${mockData.repo}/issues/3`,
                body: `## Timing\nMarch 31, 2022\n[Google Event]()`,
                title: 'Issue 3'
            },
        ];
        test('has expected length and first option is high priority', async () => {
            // mock Team Show & Support issues
            mockKit.paginate.mockResolvedValueOnce(mockResponse);
            // mock comments
            mockKit.request.mockResolvedValueOnce({ data: [] })
            const result = await getAndMapTeamShowAndSupportIssues(mockKit, mockData);
            expect(result.length).toEqual(2);
            expect(result[0].highPriority).toEqual(true);
        });
    });

    describe('formatTeamShowAndSupportUpdate', () => {
        describe('highPriority', () => {
            const highPriorityPrefix = ({ title, url }) => `:warning: Deadline: [${title}](${url}): `;
            test('missing leader but not a notetaker', () => {
                const mockUpdate = {
                    number: 1,
                    id: 1,
                    title: 'abc',
                    dueDate: 'May 23, 2025',
                    url: '',
                    highPriority: true,
                    missingFields: {
                        leader: true,
                        notetaker: false,
                    }
                };
                expect(formatTeamShowAndSupportUpdate(mockUpdate)).toEqual(`${highPriorityPrefix(mockUpdate)}Needs a leader to volunteer`)
            });

            test('missing a leader and a notetaker', () => {
                const mockUpdate = {
                    number: 1,
                    id: 1,
                    title: 'abc',
                    dueDate: 'May 23, 2025',
                    url: '',
                    highPriority: true,
                    missingFields: {
                        leader: true,
                        notetaker: true,
                    }
                };
                expect(formatTeamShowAndSupportUpdate(mockUpdate)).toEqual(`${highPriorityPrefix(mockUpdate)}Needs a leader and a notetaker to volunteer`)
            });

            test('missing a notetaker but not a leader', () => {
                const mockUpdate = {
                    number: 1,
                    id: 1,
                    title: 'abc',
                    dueDate: 'May 23, 2025',
                    url: '',
                    highPriority: true,
                    missingFields: {
                        leader: false,
                        notetaker: true,
                    }
                };
                expect(formatTeamShowAndSupportUpdate(mockUpdate)).toEqual(`${highPriorityPrefix(mockUpdate)}Needs a notetaker to volunteer`)
            });
        });

        describe('not highPriority', () => {

        });
    });
});
