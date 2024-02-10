class ContractService {
    constructor(contractRepository) {
        this.contractRepository = contractRepository;
    }
    async retrieveContractById(id, profileId) {
        return await this.contractRepository.fetchContractByIdFromDatabase(id, profileId);
    }

    async retrieveAllContractsByProfileId(profileId) {
        return await this.contractRepository.fetchAllContractsByProfileIdFromDatabase(profileId);
    }
}

module.exports = ContractService;