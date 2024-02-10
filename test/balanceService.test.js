const BalanceService = require('../src/services/balanceService');
const sequelizeMock = {
    transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
    })),
};

const jobServiceMock = {
    retrieveUnpaidJobs: jest.fn(),
};

const resMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

describe('BalanceService', () => {
    describe('addToBalance', () => {
        test('should deposit balance successfully', async () => {
            const userId = '123';
            const profileId = 123;
            const profile = { balance: 100, save: jest.fn() };
            const amount = 20;
            const unpaidJobs = [{ price: 50 }, { price: 30 }];

            const balanceService = new BalanceService(jobServiceMock, sequelizeMock);

            jobServiceMock.retrieveUnpaidJobs.mockResolvedValueOnce(unpaidJobs);

            const reqMock = {
                profile: { id: profileId },
            };

            await balanceService.addToBalance(userId, profileId, resMock, profile, amount);

            expect(sequelizeMock.transaction).toHaveBeenCalled();
            expect(jobServiceMock.retrieveUnpaidJobs).toHaveBeenCalledWith(parseInt(userId));
            expect(profile.balance).toBe(120);
            expect(resMock.status).toHaveBeenCalledWith(200);
            expect(resMock.json).toHaveBeenCalledWith({
                success: true,
                message: 'Deposit successful',
                client: profile,
            });
        });

        test('should handle unauthorized access', async () => {
            const userId = '123';
            const profileId = 456;
            const profile = { balance: 100 };
            const amount = 25;

            const balanceService = new BalanceService(jobServiceMock, sequelizeMock);

            const reqMock = {
                profile: { id: profileId },
            };

            await balanceService.addToBalance(userId, profileId, resMock, profile, amount);

            expect(resMock.status).toHaveBeenCalledWith(403);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Unauthorized access' });
        });

        test('should handle deposit amount exceeds maximum allowed deposit', async () => {
            const userId = '123';
            const profileId = 123;
            const profile = { balance: 100, save: jest.fn() };
            const amount = 26;
            const unpaidJobs = [{ price: 50 }, { price: 30 }];

            const balanceService = new BalanceService(jobServiceMock, sequelizeMock);

            jobServiceMock.retrieveUnpaidJobs.mockResolvedValueOnce(unpaidJobs);

            const reqMock = {
                profile: { id: profileId },
            };

            await balanceService.addToBalance(userId, profileId, resMock, profile, amount);

            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Error depositing money: Deposit amount exceeds maximum allowed deposit of 20' });
        });
    });
});
