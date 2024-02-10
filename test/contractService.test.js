const ContractService = require('../src/services/contractService');
const contractRepositoryMock = {
    fetchContractByIdFromDatabase: jest.fn(),
    fetchAllContractsByProfileIdFromDatabase: jest.fn(),
};

describe('ContractService', () => {
    let contractService;

    beforeEach(() => {
        contractService = new ContractService(contractRepositoryMock);
    });

    describe('retrieveContractById', () => {
        test('should retrieve contract by id', async () => {
            const contractId = 'someId';
            const profileId = 'profileId';
            const expectedContract = { id: contractId, name: 'Contract 1' };

            contractRepositoryMock.fetchContractByIdFromDatabase.mockResolvedValue(expectedContract);

            const result = await contractService.retrieveContractById(contractId, profileId);

            expect(result).toEqual(expectedContract);
            expect(contractRepositoryMock.fetchContractByIdFromDatabase).toHaveBeenCalledWith(contractId, profileId);
        });
    });

    describe('retrieveAllContractsByProfileId', () => {
        test('should retrieve all contracts by profile id', async () => {
            const profileId = 'profileId';
            const expectedContracts = [{ id: '1', name: 'Contract 1' }, { id: '2', name: 'Contract 2' }];

            contractRepositoryMock.fetchAllContractsByProfileIdFromDatabase.mockResolvedValue(expectedContracts);

            const result = await contractService.retrieveAllContractsByProfileId(profileId);

            expect(result).toEqual(expectedContracts);
            expect(contractRepositoryMock.fetchAllContractsByProfileIdFromDatabase).toHaveBeenCalledWith(profileId);
        });
    });
});
