const sendNotification = async (token, title, message) => {
  const messagePayload = {
    token: token,
    notification: {
      title: title,
      body: message
    },
    android: {
      priority: "high"
    },
    apns: {
      payload: {
        aps: {
          badge: 42
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log(`Successfully sent message: ${response}`);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending message", error);
    throw error;
  }
};

module.exports = { sendNotification };