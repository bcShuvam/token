const path = require("path");
const { watch } = require("./model/patient");

module.exports = {
    apps: [{
      name: "golden-server",
      script: path.join(__dirname, "server.js"),
      watch: true,
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }]
  }