const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Function to calculate total distance
function calculateTotalDistance(locations) {
  return locations.reduce((total, loc) => total + loc.distance, 0);
}

const LocationSchema = new Schema({
  location_id: {
    type: Number,
    // unique: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  deviceTime: {
    type: String,
    required: true,
  },
  serverTime: {
    type: Date,
    default: Date.now,
  },
  connectivityType: {
    type: String,
    required: true,
  },
  connectivityStatus: {
    type: String,
    required: true,
  },
  batteryPercentage: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: String,
    required: true,
  },
});

const DeviceSchema = new Schema(
  {
    mobileIdentifier: {
      type: String,
      // required: true,
      // unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    locations: [{ LocationSchema }],
    totalDistance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

DeviceSchema.pre("save", function (next) {
  const device = this;
  device.totalDistance = calculateTotalDistance(device.locations);

  next();
});

const Device = mongoose.model("Location", DeviceSchema);

module.exports = Location;
