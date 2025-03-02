const nodemailer = require("nodemailer");
const path = require("path");

const rootDirName = path.join(__dirname, "..");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USERMAIL,  // Correctly loading .env values
    pass: process.env.APP_PASSWORD,
  },
});

const mailOptions = {
  from: {
    name: "Deskgoo",
    address: process.env.USERMAIL,
  },
  to: ["dhungelnimesh@gmail.com", "drscorpion4@gmail.com", "kshitijdahal456@gmail.com"],
  subject: "Sending Email through NodeMailer",
  text: "Hello from Deskgoo TEXT✔",
  html: "<b>Hello from Deskgoo HTML✔</b>",
  attachments: [
    {
      filename: "test.pdf",
      path: path.join(rootDirName, "test.pdf"),
      contentType: "application/pdf",
    },
    {
      filename: "image.jpg",
      path: path.join(rootDirName, "image.jpg"),
      contentType: "image/jpg",
    }
  ]
};

const sendMail = async (req, res) => {
  try {
    console.log(process.env.USERMAIL);
    console.log(process.env.APP_PASSWORD);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return res.status(200).json({ message: "Mail sent successfully", mail: info });
  } catch (err) {
    console.error("Error sending mail:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = sendMail;
