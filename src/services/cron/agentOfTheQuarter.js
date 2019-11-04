const schedule = require('node-schedule');
const AgentOfTheQuarter = require('../../models/AgentOfTheQuarter');
const { logger } = require('../../utils/logger');

var rule = new schedule.RecurrenceRule();
rule.date = 1;
rule.month = [0,3,6,9]
rule.hour = 0;
rule.minute = 1 ;
rule.second =10 ;
var j = schedule.scheduleJob(rule, async function(){
  try {
    await AgentOfTheQuarter.setAgentOfTheQuarter();
    console.log('Agent of the quarter just set');
  } catch (err) {
    logger.log('error', err);
  }
});



// this will set initial agent of quater for server after server is live there is data in agent of month no need for code below.
var p = async () => {
  try {
    await AgentOfTheQuarter.setAgentOfTheQuarter();
    console.log('Agent of the month just set');
  } catch (err) {
    logger.log('error', err);
  }
};
p ();

