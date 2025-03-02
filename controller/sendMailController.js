const { connect } = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");
const rootDirName  = path.join(__dirname, "..");

const mailOptions = {
  from: {
    name: "Deskgoo",
    // address: process.env.USER,
    address: "dean42328@gmail.com",
  }, // sender address
  to: ["dhungelnimesh@gmail.com", "drscorpion4@gmail.com", "kshitijdahal456@gmail.com"], // list of receivers
  subject: "Sending Email through node mailer", // Subject line
  text: "Hello from Deskgoo TEXT✔", // plain text body
  html: "<b>Hello from Deskgoo HTML✔</b>", // html body
  attachments: [
    {
      filename: "test.pdf",
      path: path.dirname(rootDirName, "test.pdf"),
      contentType: "application/pdf",
    },
    {
      filename: "image.jpg",
      path: path.dirname(rootDirName, 'image.jpg'),
      contentType: "image/jpg",
    }
  ]
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

const sendMail = async (req, res) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(`Email sent ${info.messageId}`);
    return res
      .status(200)
      .json({ message: "Main sent successfully", mail: info });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = sendMail;
