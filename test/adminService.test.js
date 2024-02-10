const AdminService = require( '../src/services/adminService');

const jobServiceMock = {
    retrievePaidJobs: jest.fn(),
};

const resMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

describe('AdminService', () => {
    let adminService;

    beforeEach(() => {
        adminService = new AdminService(jobServiceMock);
        resMock.json.mockClear();
    });

    describe('retrieveBestResults', () => {
        test('should return 400 if start date is missing', async () => {
            await adminService.retrieveBestResults(null, '2023-02-10', resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Both start and end dates are required' });
        });

        test('should return 400 if end date is missing', async () => {
            await adminService.retrieveBestResults('2023-02-10', null, resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Both start and end dates are required' });
        });

        test('should return 500 if type is invalid', async () => {
            await adminService.retrieveBestResults('2023-02-10', '2023-02-10', resMock, 'invalid');
            expect(resMock.status).toHaveBeenCalledWith(500);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Invalid type, must be either client or contractor' });
        });

        test('should return 400 if start date is invalid', async () => {
            await adminService.retrieveBestResults('invalid', '2023-02-10', resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Invalid date format for start' });
        });

        test('should return 400 if end date is invalid', async () => {
            await adminService.retrieveBestResults('2023-02-10', 'invalid', resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Invalid date format for end' });
        });

        test('should return 404 if no jobs found', async () => {
            jobServiceMock.retrievePaidJobs.mockResolvedValue([]);
            await adminService.retrieveBestResults('2023-02-10', '2023-02-10', resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(404);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'No jobs found between 2023-02-10 - 2023-02-10' });
        });

        test('should return best profession', async () => {
            jobServiceMock.retrievePaidJobs.mockResolvedValue([
                {
                    price: 100,
                    Contract: {
                        Contractor: {
                            profession: 'plumber',
                        },
                    },
                },
                {
                    price: 300,
                    Contract: {
                        Contractor: {
                            profession: 'plumber',
                        },
                    },
                },
                {
                    price: 300,
                    Contract: {
                        Contractor: {
                            profession: 'electrician',
                        },
                    },
                },
            ]);
            await adminService.retrieveBestResults('2023-02-10', '2023-02-10', resMock, 'contractor');
            expect(resMock.status).toHaveBeenCalledWith(200);
            expect(resMock.json).toHaveBeenCalledWith({ profession: 'plumber', count: 400 });
        });

        test('should return best clients', async () => {
            jobServiceMock.retrievePaidJobs.mockResolvedValue([
                {
                    price: 100,
                    Contract: {
                        Client: {
                            id: 1,
                            firstName: 'John',
                            lastName: 'Doe',
                        },
                    },
                },
                {
                    price: 300,
                    Contract: {
                        Client: {
                            id: 2,
                            firstName: 'Jane',
                            lastName: 'Doe',
                        },
                    },
                },
                {
                    price: 300,
                    Contract: {
                        Client: {
                            id: 1,
                            firstName: 'John',
                            lastName: 'Doe',
                        },
                    },
                },
                {
                    price: 350,
                    Contract: {
                        Client: {
                            id: 3,
                            firstName: 'Bob',
                            lastName: 'Doe',
                        },
                    },
                },
                {
                    price: 50,
                    Contract: {
                        Client: {
                            id: 4,
                            firstName: 'Richard',
                            lastName: 'Doe',
                        },
                    },
                },
            ]);
            await adminService.retrieveBestResults('2023-02-10', '2023-02-10', resMock, 'client', 3);
            expect(resMock.status).toHaveBeenCalledWith(200);
            expect(resMock.json).toHaveBeenCalledWith([
                {
                    id: 1,
                    fullName: 'John Doe',
                    paid: 400,
                },
                {
                    id: 3,
                    fullName: 'Bob Doe',
                    paid: 350,
                },
                {
                    id: 2,
                    fullName: 'Jane Doe',
                    paid: 300,
                },
            ]);
        });
    });
});