/* eslint-disable no-tabs */
const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

const admin = require("firebase-admin");
admin.initializeApp();


sgMail.setApiKey(functions.config().sendgrid.apikey);


exports.sendEmail = functions.https.onCall((data, context) => {
  const {email} = data;
  const uid = context.auth.uid;

  return admin.database().ref("/forms").push({
    completed: false,
    userId: uid,
  }).then((res) => {
    const key = res.key;

    const msg = {
      to: email,
      from: functions.config().sendgrid.senderemail,
      subject: "Beneficial owner form",
      html: `<p>Please Fill out beneficial owner!!
				<br>  
				<a href="${functions.config().app.url}/beneficialForm/${key}/">form</a> 
				<br>`,
    };

    sgMail.send(msg).then();
    return {msg: "ok"};
  });
});

exports.saveForm = functions.https.onCall((data, context) => {
  const {fId, values} = data;
  return admin.database().ref(`/forms/${fId}`)
      .update({
        completed: true,
        values,
      })
      .then(() => {
        return {msg: "ok"};
      });
});
