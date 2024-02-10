class AdminService {
    constructor(jobService) {
        this.jobService = jobService;
    }

    async retrieveBestResults(start, end, res, type, limit = 2) {
        //if time is not provided, it will be considered as 00:00:00
        if (!start || !end) {
            return res.status(400).json({error: 'Both start and end dates are required'});
        }

        if(type !== 'contractor' && type !== 'client') {
            return res.status(500).json({error: 'Invalid type, must be either client or contractor'});
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime())) {
            return res.status(400).json({error: 'Invalid date format for start'});
        }

        if (isNaN(endDate.getTime())) {
            return res.status(400).json({error: 'Invalid date format for end'});
        }

        const jobs = await this.jobService.retrievePaidJobs(startDate, endDate, type);

        if (jobs.length === 0) {
            return res.status(404).json({error: `No jobs found between ${start} - ${end}`});
        }
        if (type === 'contractor') {
            const jobCountByProfession = jobs.reduce((acc, job) => {
                const {Contractor} = job.Contract;
                const {profession} = Contractor;

                if (!acc[profession]) {
                    acc[profession] = 0;
                }
                acc[profession] += job.price;
                return acc;
            }, {});

            const bestProfession = Object.keys(jobCountByProfession).reduce((a, b) => jobCountByProfession[a] > jobCountByProfession[b] ? a : b);
            return res.status(200).json({profession: bestProfession, count: jobCountByProfession[bestProfession]});
        } else {
            const clientPayments = jobs.reduce((acc, job) => {
                const {Client} = job.Contract;
                const {id, firstName, lastName} = Client;
                const fullName = `${firstName} ${lastName}`;
                if (!acc[id]) {
                    acc[id] = {id, fullName, paid: 0};
                }
                acc[id].paid += job.price;

                return acc;
            }, {});

            const sortedClients = Object.values(clientPayments).sort((a, b) => b.paid - a.paid).slice(0, limit);
            return res.status(200).json(sortedClients);
        }
    }
}

module.exports = AdminService;