const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {Op} = require('sequelize')
const {getProfile} = require('./middleware/getProfile')


const ContractService = require('./services/contractService');
const contractController = require('./controllers/contractController');
const contractRepository = require('./repositories/contractRepository');


const JobService = require('./services/jobService');
const jobController = require('./controllers/jobController');
const jobRepository = require('./repositories/jobRepository');

const BalanceService = require('./services/balanceService');
const balanceController = require('./controllers/balanceController');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const contractService = new ContractService(contractRepository);
const jobService = new JobService(jobRepository, sequelize, Op);
const balanceService = new BalanceService(jobService, sequelize);

app.get('/contracts/:id',getProfile ,async (req, res) =>{
    await contractController.getContractById(req, res, contractService);
});

app.get('/contracts',getProfile ,async (req, res) =>{
    await contractController.getAllContracts(req, res, contractService);
});

app.get('/jobs/unpaid',getProfile ,async (req, res) =>{
    await jobController.getUnpaidJobs(req, res, jobService);
});

app.post('/jobs/:job_id/pay',getProfile ,async (req, res) => {
    await jobController.payJob(req, res, jobService);
});

app.post('/balances/deposit/:userId',getProfile ,async (req, res) => {
    await balanceController.depositBalance(req, res, balanceService);
});

module.exports = app;
