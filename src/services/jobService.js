class JobService{
    constructor(jobRepository, sequelize, Op, Profile) {
        this.jobRepository = jobRepository;
        this.sequelize = sequelize;
        this.Op = Op;
        this.Profile = Profile;
    }

    async retrieveUnpaidJobs(clientId, contractorId, transaction = null) {
        return await this.retrieveJobs({
            terminated: false,
            clientId,
            contractorId,
            paid: false,
            transaction,
            includeClient: false,
            includeContractor: false,
        });
    }

    async retrievePaidJobs(startDate, endDate, type) {
        let includeContractAndNotClient = type !== 'client';

        return await this.retrieveJobs({
            terminated: true,
            includeClient: !includeContractAndNotClient,
            includeContractor: includeContractAndNotClient,
            paid: true,
            startDate,
            endDate
        })
    }

    async retrieveJobs({
                           terminated = false,
                           clientId = null,
                           contractorId = null,
                           paid = null,
                           transaction = null,
                           includeClient = false,
                           includeContractor = false,
                           startDate = null,
                           endDate = null
                       }){
        let includeContractWhere = {};
        const where = {};
        if (!terminated) {
            includeContractWhere.status = {
                [this.Op.ne]: 'terminated'
            };
        }

        if (clientId || contractorId) {
            includeContractWhere[this.Op.or] = [];
            includeContractWhere[this.Op.or] = [];
        }
        if (clientId) {
            includeContractWhere[this.Op.or].push({ClientId: clientId});
        }
        if (contractorId) {
            includeContractWhere[this.Op.or].push({ContractorId: contractorId});
        }

        if (paid !== null) {
            if (paid) {
                where.paid = true;
            } else {
                where.paid = {
                    [this.Op.or]: [false, null]
                };
            }
        }

        const includeProfile = [];
        if (includeClient) {
            includeProfile.push({model: this.Profile, as: 'Client'});
        }

        if (includeContractor) {
            includeProfile.push({model: this.Profile, as: 'Contractor'});
        }

        if (startDate && endDate) {
            where.paymentDate = {
                [this.Op.between]: [startDate, endDate]
            };
        }

        return  this.jobRepository.fetchJobsFromDatabase(includeContractWhere, where, transaction, includeProfile);
    }


    async processJobPayment(job_id, profileId, res) {
        const transaction = await this.sequelize.transaction();

        try {
            const job = await  this.jobRepository.fetchJobByIdFromDatabase(job_id, transaction);
            if (!job) {
                throw new Error('Job not found');
            }

            const {price} = job;
            const client = job.Contract.Client;
            const contractor = job.Contract.Contractor;

            if (profileId !== client.id) {
                throw new Error('Not authorized');
            }

            if (job.paid) {
                throw new Error('Job already paid');
            }

            if (job.Contract.status === 'terminated') {
                throw new Error('Contract terminated');
            }

            if (client.balance < price) {
                throw new Error('Insufficient funds to pay for this job');
            }

            client.balance -= price;
            await client.save({transaction});

            contractor.balance += price;
            await contractor.save({transaction});

            job.paid = true;
            job.paymentDate = new Date();
            await job.save({transaction});

            await transaction.commit();

            res.status(200).json({
                success: true,
                message: 'Payment successful',
                job: job
            });
        } catch (error) {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                error: `Error paying for job: ${error.message}`
            });
        }
    }
}

module.exports = JobService;