class JobService{
    constructor(jobRepository, sequelize, Op) {
        this.jobRepository = jobRepository;
        this.sequelize = sequelize;
        this.Op = Op;
    }

    async retrieveUnpaidJobs(clientId, contractorId, transaction = null) {
        return await this.retrieveJobs({
            terminated: false,
            clientId,
            contractorId,
            paid: false,
            transaction
        });
    }

    async retrieveJobs({
                           terminated = false,
                           clientId = null,
                           contractorId = null,
                           paid = null,
                           transaction = null
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

        return  this.jobRepository.fetchJobsFromDatabase(includeContractWhere, where, transaction);
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