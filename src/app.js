const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')


const ContractService = require('./services/contractService');
const contractController = require('./controllers/contractController');
const contractRepository = require('./repositories/contractRepository');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const contractService = new ContractService(contractRepository);

app.get('/contracts/:id',getProfile ,async (req, res) =>{
    await contractController.getContractById(req, res, contractService);
});

app.get('/contracts',getProfile ,async (req, res) =>{
    await contractController.getAllContracts(req, res, contractService);
});

module.exports = app;
