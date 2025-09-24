const testHello = (req, res) => {
  try {
    res.status(200).json({ message: "Hello, World! test successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { Document, Packer, Paragraph, TextRun } = require('docx');

const generateRegistrationForm = async (req, res) => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'User Registration Form', bold: true, size: 28 })],
          }),
          new Paragraph({
            text: '\nFull Name: ________________________________',
          }),
          new Paragraph({
            text: '\nEmail: _____________________________________',
          }),
          new Paragraph({
            text: '\nPhone: _____________________________________',
          }),
          new Paragraph({
            text: '\nRemarks: ___________________________________',
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const fileName = 'registration_form.docx';
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(buffer);
}


module.exports = {testHello, generateRegistrationForm};
