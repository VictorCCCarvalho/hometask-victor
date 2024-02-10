
class BalanceService {
    constructor(JobService, sequelize) {
        this.JobService = JobService;
        this.sequelize = sequelize;
    }
    async addToBalance(userId, profileId, res, profile, amount) {
        const parsedUserId = parseInt(userId);

        const transaction = await this.sequelize.transaction();

        try {

            if (parsedUserId !== profileId) {
                return res.status(403).json({error: 'Unauthorized access'});
            }

            const clientProfile = profile;

            const unpaidJobs = await  this.JobService.retrieveUnpaidJobs(parsedUserId);

            const totalUnpaidAmount = unpaidJobs.reduce((total, job) => total + job.price, 0);

            const maxDepositAmount = totalUnpaidAmount * 0.25;

            if (amount > maxDepositAmount) {
                throw new Error(`Deposit amount exceeds maximum allowed deposit of ${maxDepositAmount}`);
            }

            clientProfile.balance += amount;
            await clientProfile.save({transaction});
            await transaction.commit();

            res.status(200).json({success: true, message: 'Deposit successful', client: clientProfile});
        } catch (error) {
            transaction.rollback();
            res.status(400).json({error: `Error depositing money: ${error.message}`});
        }
    }
}

module.exports = BalanceService;