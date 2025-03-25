const Location = require("../model/location");
const todayDate = require("../config/todayDate");
const Users = require("../model/users");

const postLocation = async (req, res) => {
  try {
    const _id = req.query._id;

    if (!_id) {
      return res.status(400).json({ message: "Missing required field: _id" });
    }

    // Extract location data from the request body
    const {
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      mobileTime,
      localTime,
      connectivityType,
      connectivityStatus,
      distance,
    } = req.body;

    const newLocation = {
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      mobileTime,
      localTime,
      connectivityType,
      connectivityStatus,
      distance,
    };

    // Use `findByIdAndUpdate` to update directly
    const updatedLocationDoc = await Location.findByIdAndUpdate(
      _id,
      { $push: { locations: newLocation } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedLocationDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Location data appended successfully.",
      latestLocation: newLocation,
      totalLocations: updatedLocationDoc.locations.length,
    });
  } catch (error) {
    console.error("Error appending location data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get location by _id or fetch all latest locations
const getLocationByID = async (req, res) => {
  try {
    const { _id } = req.query;
    const todayDate = new Date().toDateString(); // Get today's date as string

    if (_id) {
      // Find a specific device by _id
      const device = await Location.findOne({ _id });

      if (!device) {
        return res.status(404).json({ message: "Location not found" });
      }

      return res.status(200).json({
        message: `Location data for employee: ${device.username} fetched successfully`,
        latestData: {
          _id: device._id,
          username: device.username,
          latestLocation: device.locations.slice(-1)[0] || {}, // Avoid error if empty
          totalDistanceToday:
            device.distanceByDate.find(
              (date) => new Date(date.date).toDateString() === todayDate
            )?.tDistance || 0,
          totalDistance: device.totalDistance,
        },
      });
    }

    // Fetch all devices with latest location
    const devices = await Location.find();

    const latestData = devices.map(async (device) => {
      const latestLocation = device.locations.slice(-1)[0] || {};
      const foundUser = await Users.findById(device._id);

      // if (Object.keys(latestLocation).length === 0) {
      //   latestLocation = {};
      // }
      return {
        message: `Location data for employee: ${device.username} fetched successfully`,
        _id: device._id,
        username: device.username,
        // profile: foundUser.profileImage,
        latestLocation: latestLocation,
        totalDistanceToday:
          device.distanceByDate.find(
            (date) => new Date(date.date).toDateString() === todayDate
          )?.tDistance || 0,
        totalDistance: device.totalDistance,
      };
    });

    return res.status(200).json(latestData); // Missing return fixed
  } catch (error) {
    console.error("Error fetching device:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// // Route to fetch device locations
// const getAllLocation = async (req, res) => {
//   try {
//     // fetch all devices
//     const devices = await Location.find({});

//     const latestData = devices.map((device) => {
//       return {
//         _id: device._id,
//         employee_name: device.username,
//         // mobileIdentifier: device.mobileIdentifier,
//         latestLocation: device.locations,
//         totalDistanceToday,
//         totalDistance: device.totalDistance,
//       };
//     });

//     return res.status(200).json({
//       message: "All devices data fetched successfully",
//       latestData,
//     });
//   } catch (error) {
//     console.error("Error fetching device data:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const getLocationFromDate = async (req, res) => {
  try {
    const { _id, from, to } = req.query;
    if (!_id) return res.status(404).json({ message: "Id is required" });

    // Find the device by _id
    const device = await Location.findOne({ _id });
    if (!device) {
      return res.status(404).json({ message: "Location not found" });
    }

    let locations = device.locations;

    // Filter locations based on date range if provided
    if (from && to) {
      const startDate = new Date(from).toISOString(); // Convert to UTC
      const endDate = new Date(to).toISOString(); // Convert to UTC

      // Check for valid date ranges
      if (
        isNaN(new Date(startDate).getTime()) ||
        isNaN(new Date(endDate).getTime())
      ) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Filter locations based on the provided time frame
      locations = locations.filter((location) => {
        const locationDate = new Date(location.localTime).toISOString(); // Convert to UTC

        return locationDate >= startDate && locationDate <= endDate;
      });
    }

    return res.status(200).json({
      message: "Locations fetched successfully",
      _id: device._id,
      username: device.username, // Use username
      totalDistance: device.totalDistance,
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//deleete al locations
const deleteAllLocation = async (req, res) => {
  try {
    await Location.deleteMany({});
    res.json({ message: "all location deleted" });
  } catch (err) {
    console.error("Error deleting all locations:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  postLocation,
  getLocationByID,
  // getAllLocation,
  deleteAllLocation,
  getLocationFromDate,
};
