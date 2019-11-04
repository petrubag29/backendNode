const { logger } = require('../../utils/logger');
const generateRandomID = require('../../utils/idGenerator');
const generateRandomPassword = require('../../utils/passwordGenerator');
const { superAdmin } = require('../../constants/userTypes');
const { sendOne } = require('../../services/nodemailer');
const { address, websiteURL } = require('../../constants/companyInfo');
const moment = require('moment');

const usersCollection = async (Model, usersExist) => {
  const adminOwner1Password = generateRandomPassword();
  const adminOwner1UUID = generateRandomID();
  const adminOwner2Password = generateRandomPassword();
  const adminOwner2UUID = generateRandomID();

  const adminOwnerCompanyOwner = {
    uuid: adminOwner1UUID,
    firstName: 'Admin',
    lastName: 'Owner',
    email: process.env.APP_OWNER_EMAIL,
    role: superAdmin,
    password: adminOwner1Password,
    createdAt: new Date(),
    admin: {
      officeNumber: '(111) 111-1111 x111',
      mobileNumber: '(999) 999-9999',
      state: 'New York',
      branch: 'New York City',
      isAdminOwner: true,
    },
  };

  const adminOwnerDevLead = {
    uuid: adminOwner2UUID,
    firstName: 'Dev',
    lastName: 'Lead',
    email: process.env.DEV_LEAD_EMAIL,
    role: superAdmin,
    password: adminOwner2Password,
    createdAt: new Date(),
    admin: {
      officeNumber: '(111) 111-1111 x111',
      mobileNumber: '(999) 999-9999',
      state: 'New York',
      branch: 'New York City',
      isAdminOwner: true,
    },
  };

  const adminToAdd = [];

  if (usersExist) {
    const adminOwners = await Model.find({ 'admin.isAdminOwner': true }).exec();

    if (adminOwners.length >= 2) return;

    if (adminOwners.length === 1) {
      adminToAdd.push(
        [adminOwnerCompanyOwner, adminOwnerDevLead].filter(
          admin => admin.email !== adminOwners[0].email
        )[0]
      );
    } else {
      adminToAdd.push(adminOwnerCompanyOwner, adminOwnerDevLead);
    }

    adminToAdd.forEach(async singleAdmin => {
      const admin = new Model(singleAdmin);

      try {
        await admin.save();
      } catch (err) {
        logger.log('error', err);
        throw err;
      }

      sendOne({
        to: admin.email,
        subject: 'Reyes & Elsamad Real Estate Application (New Administrator)',
        template: 'admin-owner-creation',
        templateArgs: {
          temporaryPassword: singleAdmin.password,
          logInLink: `${websiteURL}/log-in`,
          currentYear: moment().year(),
          companyAddress: address,
        },
      });
    });

    return;
  }

  adminToAdd.push(adminOwnerCompanyOwner, adminOwnerDevLead);

  adminToAdd.forEach(async singleAdmin => {
    const admin = new Model(singleAdmin);

    try {
      await admin.save();
    } catch (err) {
      logger.log('error', err);
      throw err;
    }

    sendOne({
      to: admin.email,
      subject: 'Reyes & Elsamad Real Estate Application (New Administrator)',
      template: 'admin-owner-creation',
      templateArgs: {
        temporaryPassword: singleAdmin.password,
        logInLink: `${websiteURL}/log-in`,
        currentYear: moment().year(),
        companyAddress: address,
        heroBackgroundImgURL:
          'https://s3.amazonaws.com/reyes-elsamad-real-estate-app/website-images/email/hero.jpg',
      },
    });
  });
};

module.exports = usersCollection;
