async function getContractById(req, res, contractService) {
    const { id } = req.params;
    const profileId = req.profile.id;
    const contract = await contractService.retrieveContractById(id, profileId);
    if (!contract) return res.status(404).end();
    res.json(contract);
}

async function getAllContracts(req, res, contractService) {
    const profileId = req.profile.id;
    const contracts = await contractService.retrieveAllContractsByProfileId(profileId);
    res.json(contracts);
}

module.exports = {
    getContractById,
    getAllContracts
};