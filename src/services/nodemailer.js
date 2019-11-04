const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const exphbs = require('express-handlebars');
const path = require('path');
const pdf = require('html-pdf');

const handlebarsEngineInstance = exphbs.create({});

const handlebarsOptions = {
  viewEngine: handlebarsEngineInstance,
  viewPath: path.join(__dirname, '..', 'emailViews'),
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USERNAME,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

transporter.use('compile', hbs(handlebarsOptions));

const sendOne = ({ from, to, subject, template, templateArgs }) => {
  console.log('==============', template);
  if (template === 'invoice-submission-invoicee-version') {
    handlebarsEngineInstance
      .render(
        path.join(__dirname, '..', 'emailViews/' + template + '.handlebars'),
        templateArgs
      )
      .then(html => {
        pdf.create(html).toBuffer(function(err, buffer) {
          const mail = {
            from: from || process.env.EMAIL_USERNAME,
            to,
            subject,
            template,
            context: templateArgs,
            attachments: [
              {
                filename: `invoice.pdf`,
                content: buffer,
                encoding: 'base64',
                contentType: 'application/pdf',
              },
            ],
          };
          transporter.sendMail(mail).then(res => {
            console.log(res);
            return res;
          });
        });
      });
  } else {
    const mail = {
      from: from || process.env.EMAIL_USERNAME,
      to,
      subject,
      template,
      context: templateArgs,
    };
    transporter.sendMail(mail).then(res => {
      console.log(res);
      return res;
    });
  }
};

module.exports = {
  sendOne,
};
