const JobService = require('../src/services/jobService');

const jobRepositoryMock = {
    fetchJobsFromDatabase: jest.fn(),
    fetchJobByIdFromDatabase: jest.fn(),
};

const sequelizeMock = {
    transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
    })),
};

const OpMock = jest.fn();



describe('JobService', () => {
    let jobService;

    beforeEach(() => {
        jobService = new JobService(jobRepositoryMock, sequelizeMock, OpMock);
    });

    describe('retrieveUnpaidJobs', () => {
        test('should retrieve unpaid jobs correctly', async () => {
            const clientId = 123;
            const contractorId = 456;

            await jobService.retrieveUnpaidJobs(clientId, contractorId);

            expect(jobRepositoryMock.fetchJobsFromDatabase).toHaveBeenCalledWith(
                {'status': {'undefined': 'terminated'}, 'undefined': [{'ClientId': 123}, {'ContractorId': 456}]}, {'paid': {'undefined': [false, null]}}, null
            );
        });
    });
    describe('processJobPayment', () => {
        test('should process job payment correctly', async () => {
            const job_id = 789;
            const profileId = 123;
            const resMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const jobMock = {
                price: 100,
                Contract: {
                    Client: {
                        id: profileId,
                        balance: 200,
                        save: jest.fn().mockResolvedValue(),
                    },
                    Contractor: {
                        balance: 300,
                        save: jest.fn().mockResolvedValue(),
                    },
                    status: 'active',
                },
                paid: false,
                save: jest.fn().mockResolvedValue(),
            };

            jobRepositoryMock.fetchJobByIdFromDatabase.mockResolvedValueOnce(jobMock);

            await jobService.processJobPayment(job_id, profileId, resMock);

            expect(sequelizeMock.transaction).toHaveBeenCalled();
            expect(jobRepositoryMock.fetchJobByIdFromDatabase).toHaveBeenCalledWith(job_id, expect.any(Object));
            expect(jobMock.Contract.Client.balance).toBe(100);
            expect(jobMock.Contract.Contractor.balance).toBe(400);
            expect(jobMock.paid).toBe(true);
            expect(jobMock.paymentDate).toEqual(expect.any(Date));
            expect(resMock.status).toHaveBeenCalledWith(200);
            expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        test('should handle job not found', async () => {
            const job_id = 789;
            const profileId = 123;
            const resMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            jobRepositoryMock.fetchJobByIdFromDatabase.mockResolvedValueOnce(null);

            await jobService.processJobPayment(job_id, profileId, resMock);

            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Error paying for job: Job not found', success: false });
        });

        test('should handle unauthorized access', async () => {
            const job_id = 789;
            const profileId = 123;
            const resMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const jobMock = {
                Contract: {
                    Client: {
                        id: 456,
                    },
                },
            };

            jobRepositoryMock.fetchJobByIdFromDatabase.mockResolvedValueOnce(jobMock);

            await jobService.processJobPayment(job_id, profileId, resMock);

            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Error paying for job: Not authorized', success: false });
        });

        test('should handle job already paid', async () => {
            const job_id = 789;
            const profileId = 123;
            const resMock = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const jobMock = {
                Contract: {
                    Client: {
                        id: profileId,
                    },
                },
                paid: true,
            };

            jobRepositoryMock.fetchJobByIdFromDatabase.mockResolvedValueOnce(jobMock);

            await jobService.processJobPayment(job_id, profileId, resMock);

            expect(resMock.status).toHaveBeenCalledWith(400);
            expect(resMock.json).toHaveBeenCalledWith({ error: 'Error paying for job: Job already paid', success: false });
        });
    });
});
