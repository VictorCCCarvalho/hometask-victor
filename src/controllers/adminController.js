async function getBestProfession(req, res, adminService) {
    const {start, end} = req.query;
    return await adminService.retrieveBestResults(start, end, res, 'contractor');
}

async function getBestClients(req, res, adminService) {
    const {start, end, limit} = req.query;
    return await adminService.retrieveBestResults(start, end, res, 'client', limit);
}

module.exports = {getBestProfession, getBestClients};