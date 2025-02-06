const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Function to calculate total distance
function calculateTotalDistance(locations) {
  return locations.reduce((total, loc) => total + loc.distance, 0);
}

// Function to calculate distance traveled on a particular date
function calculateDistanceTravelledOnDate(locations) {
  const distanceMap = {};

  locations.forEach((loc) => {
    const dateKey = loc.localTime;
    if (!distanceMap[dateKey]) {
      distanceMap[dateKey] = 0;
    }
    distanceMap[dateKey] += loc.distance;
  });

  return Object.entries(distanceMap).map(([date, tDistance]) => ({
    date: new Date(date),
    tDistance,
  }));
}

const LocationSchema = new Schema({
  locationCounter: {
    type: Number,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  mobileTime: {
    type: String,
    required: true,
  },
  localTime: {
    type: Date,
    required: true,
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
    // mobileIdentifier: {
    //   type: String,
    // },
    _id: { type: String, required: true },
    fullName: {
      type: String,
      required: true,
    },
    locations: [LocationSchema],
    totalDistance: {
      type: Number,
      default: 0,
    },
    distanceByDate: [
      {
        date: { type: Date, required: true },
        tDistance: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to update total distance and distance by date
DeviceSchema.pre("save", function (next) {
  const device = this;
  device.totalDistance = calculateTotalDistance(device.locations);
  device.distanceByDate = calculateDistanceTravelledOnDate(device.locations);
  next();
});

const Location = mongoose.model("Device", DeviceSchema);

module.exports = Location;
