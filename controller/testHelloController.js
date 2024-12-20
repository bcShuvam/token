const testHello = (req, res) => {
  res.status(200).json({ message: "Hello, World! test successful" });
};

module.exports = testHello;
