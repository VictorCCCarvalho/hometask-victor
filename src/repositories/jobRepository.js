const {Job, Contract, Profile} = require('../model');

async function fetchJobsFromDatabase(includeContractWhere=null, where){
    return await Job.findAll({
        include: [{
            model: Contract,
            where: includeContractWhere
        }],
        where: where
    });
}

async function fetchJobByIdFromDatabase(id, transaction){
    return await Job.findByPk(id, {
        include: [{
            model: Contract,
            include: [{
                model: Profile,
                as: 'Client'
            },
            {
                model: Profile,
                as: 'Contractor'
            }]
        }],
        transaction
    });
}

module.exports = { fetchJobsFromDatabase, fetchJobByIdFromDatabase};