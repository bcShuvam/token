const { connect } = require("mongoose");
const nodemailer = require("nodemailer");

const sendMail = async (req, res) => {
  try {
    let testAccount = await nodemailer.createTestAccount();

    // connect with the smtp
    let transporter = await nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: "braden57@ethereal.email",
        pass: "MGyNsVfu5BFFxmF6dr",
      },
    });
    let info = await transporter.sendMail({
      from: '"Deskgoo Nodejs Test Main 👻" <deskgoo@nepal.com>', // sender address
      to: "dhungelnimesh@gmail.com, dean42328@gmail.com", // list of receivers
      subject: "Hello from Deskgoo SUBJECT✔", // Subject line
      text: "Hello from Deskgoo TEXT✔", // plain text body
      html: "<b>Hello from Deskgoo HTML✔</b>", // html body
    });
    console.log(`Message sent ${info.messageId}`);
    console.log('Hello from');
    return res
      .status(200)
      .json({ message: "Main sent successfully", mail: info });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = sendMail;
