async function depositBalance(req, res, balanceService) {
    const profileId = req.profile.id;
    const {userId} = req.params;
    const {amount} = req.body;

    return await balanceService.addToBalance(userId, profileId, res, req.profile, amount);
}

module.exports = { depositBalance };