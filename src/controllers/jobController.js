async function getUnpaidJobs(req, res, jobService) {
    const profileId = req.profile.id;
    const unpaidJobs = await jobService.retrieveUnpaidJobs(profileId, profileId);
    res.json(unpaidJobs);
}

async function payJob(req, res, jobService) {
    const profileId = req.profile.id;
    const {job_id} = req.params;
    await jobService.processJobPayment(job_id, profileId, res);
}

module.exports = {getUnpaidJobs, payJob};