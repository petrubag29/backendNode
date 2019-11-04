const moment = require('moment');
const { admin, superAdmin } = require('../../../../constants/userTypes');
const Deal = require('../../../../models/Deal');
const User = require('../../../../models/User');
const throwUnautorizedAccessError = require('../../../../utils/throwUnauthorizedError');
const { logger } = require('../../../../utils/logger');
const { address } = require('../../../../constants/companyInfo');
const { sendOne } = require('../../../../services/nodemailer');
const { capitalize } = require('../../../../utils/stringUtils');
const { sendOneText } = require('../../../../services/twilio');

const acceptDeal = async (obj, args, context, info) => {
  const { currentUser, req } = context;

  const returnObj = {
    deal: undefined,
    userErrors: [],
    otherError: null,
  };

  if (
    !currentUser ||
    (currentUser.role !== admin && currentUser.role !== superAdmin)
  ) {
    throwUnautorizedAccessError(req, info);
  }

  const { uuid: dealID, bonusPercentageAddedByAdmin, userUUID } = args.input;

  let deal;

  try {
    deal = await Deal.findByDealID(dealID, userUUID, currentUser, true);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (!deal) {
    returnObj.otherError =
      'The deal that you are attempting to accept has already been deleted.';
    return returnObj;
  } else if (deal.status === 'accepted') {
    returnObj.otherError =
      'The deal that you are attempting to accept has already been accepted.';
    return returnObj;
  }

  try {
    deal = await deal
      .set({ status: 'approved', bonusPercentageAddedByAdmin })
      .save();
    returnObj.deal = deal;
  } catch (err) {
    if (err.custom && err.type === 'Normal') {
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          returnObj.userErrors.push({
            field: key,
            message: err.errors[key],
          });
        });
      } else {
        logger.log('error', err);
        returnObj.otherError = err;
      }
    }
    return returnObj;
  }

  const coAgentsIds = deal.coBrokeringAgentPaymentTypes.map(v => v.agentID);
  const coAgents = await Promise.all(coAgentsIds.map(id => User.findByUUID(id)));

  let agent;

  try {
    agent = await User.findByUUID(deal.agentID);
  } catch (err) {
    logger.log('error', err);
    returnObj.otherError = err;
    return returnObj;
  }

  if (agent) {
    try {
      sendOne({
        to: agent.email,
        subject: `Deal Approval (Deal ID: ${deal.dealID})`,
        template: 'deal-approval',
        templateArgs: {
          dealID: deal.dealID,
          firstName: capitalize(agent.firstName),
          currentYear: moment().year(),
          companyAddress: address,
          heroBackgroundImgURL:
            'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
        },
      });
      coAgents.forEach(coAgent => {
        sendOne({
          to: coAgent.email,
          subject: `Fill your payment details (Deal ID: ${deal.dealID})`,
          template: 'fill-payment-details',
          templateArgs: {
            dealID: deal.dealID,
            firstName: capitalize(coAgent.firstName),
            viewDealLink: `${websiteURL}/app/deals`,
            currentYear: moment().year(),
            companyAddress: address,
            heroBackgroundImgURL:
              'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
          },
        });
      });
    } catch (err) {
      logger.log('error', err);
    }
  }

  if (deal.shouldSendApprovalTextMessageNotification && agent) {
    sendOneText({
      body: `Hi ${
        agent.fullName
      }. Thank you for submitting your deal with Reyes Elsamad Real Estate Group. Your deal (deal ID: ${
        deal.dealID
      }) has just received approval by an administrator.\n\nPlease do not reply to this message`,
      to: agent.mobileNumber,
    })
      .then((message, err) => {
        if (err) {
          logger('warn', err);
        }
        console.log(message);
      })
      .catch(err => logger.log('error', err));
  }

  return returnObj;
};

module.exports = acceptDeal;
