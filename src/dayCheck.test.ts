import { FRIDAY_CELEBRATION_MESSAGE, getSpecificDayUpdate } from './dayCheck';

describe('dayCheck', () => {
    test('Fridays return the Friday celebration message', () => {
        const message = getSpecificDayUpdate(5);
        expect(message).toEqual(FRIDAY_CELEBRATION_MESSAGE);
    });

    test('Not Friday returns empty string', () => {
        // Sunday
        const message0 = getSpecificDayUpdate(0);
        expect(message0).toEqual('');

        // Monday
        const message1 = getSpecificDayUpdate(1);
        expect(message1).toEqual('');

        // Tuesday
        const message2 = getSpecificDayUpdate(2);
        expect(message2).toEqual('');

        // Wednesday
        const message3 = getSpecificDayUpdate(3);
        expect(message3).toEqual('');

        // Thursday
        const message4 = getSpecificDayUpdate(4);
        expect(message4).toEqual('');

        // Saturday
        const message6 = getSpecificDayUpdate(6);
        expect(message6).toEqual('');
    });
})