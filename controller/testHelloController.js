const testHello = (req, res) => {
  try {
    res.status(200).json({ message: "Hello, World! test successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = testHello;
