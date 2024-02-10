const {Contract} = require('../model');
const {Op} = require('sequelize');
async function fetchContractByIdFromDatabase(id, profileId ) {
    return  await Contract.findOne({where: {
            id,
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ]
        }});
}

async function fetchAllContractsByProfileIdFromDatabase(profileId) {
    return await Contract.findAll({where: {
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ],
            status: {
                [Op.ne]: 'terminated'
            }
        }});
}

module.exports = {fetchAllContractsByProfileIdFromDatabase, fetchContractByIdFromDatabase};