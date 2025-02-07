const Location = require("../model/location");
const todayDate = require("../config/todayDate");

// Route to handle location updates
const postLocation = async (req, res) => {
  try {
    const _id = req.query._id;

    if (!_id) {
      return res.status(400).json({ message: "Missing required field: _id" });
    }

    // Find the location document where _id is _id
    const locationDoc = await Location.findById(_id);

    if (!locationDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract location data from the request body
    const {
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      mobileTime,
      connectivityType,
      connectivityStatus,
      distance,
    } = req.body;

    // Generate a unique location_id
    // Create a new location object
    const newLocation = {
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      mobileTime,
      localTime: new Date().toISOString(),
      connectivityType,
      connectivityStatus,
      distance,
    };

    // Push the new location to the locations array
    locationDoc.locations.push(newLocation);

    // Save the updated document
    await locationDoc.save();

    return res.status(200).json({
      message: "Location data appended successfully.",
      latestLocation: newLocation,
      totalLocations: locationDoc.locations.length,
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
          employee_name: device.username,
          latestLocation: device.locations.slice(-1)[0] || null, // Avoid error if empty
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

    const latestData = devices.map((device) => {
      const latestLocation = device.locations.slice(-1)[0] || null;
      return {
        message: `Location data for employee: ${device.username} fetched successfully`,
        _id: device._id,
        username: device.username,
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
      data: {
        message: "Locations fetched successfully",
        _id: device._id,
        employee_name: device.username, // Use username
        locations,
        totalDistance: device.totalDistance,
      },
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
