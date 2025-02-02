const Location = require("../models/locationModel");

async function getNextSequenceValue() {
  const counterDoc = await Location.findOneAndUpdate(
    { _id: 'location_id' }, 
    { $inc: { location_id: 1 } },
    { new: true, upsert: true } 
  );

  return counterDoc.location_id;
}

// Route to handle location updates
const postLocation = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing required field: userId" });
    }

    // Find the location document where _id is userId
    const locationDoc = await Location.findById(userId);

    if (!locationDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract location data from the request body
    const {
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      deviceTime,
      connectivityType,
      connectivityStatus,
      distance,
    } = req.body;

    // Generate a unique location_id
    const location_id = await getNextSequenceValue();

    // Create a new location object
    const newLocation = {
      location_id,
      latitude,
      longitude,
      batteryPercentage,
      accuracy,
      deviceTime,
      serverTime: new Date().toISOString(),
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


//location by mobile_id
const getLocationByID = async (req, res) => {
  try {
    const { _id } = req.query;

    if (_id) {
      // Find a specific device by mobile_id
      const device = await Location.findOne({
        _id: Number(_id),
      });

      if (!device) {
        return res.status(404).json({ message: "Location not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Today's date at 00:00:00

      // Filter only today's distances from the `locations`
      const todayDistances = device.locations?.filter(
        (location) => new Date(location.deviceTime) >= today
      );

      const totalDistanceToday =
        todayDistances?.reduce((sum, loc) => sum + loc.distance, 0) || 0;

      return res.status(200).json({
        message: `Location data for employee:${device.fullName} fetched successfully`,
        latestData: {
          mobile_id: device.mobile_id,
          employee_name: device.fullName,
          mobileIdentifier: device.mobileIdentifier,
          latestLocation: device.locations.slice(-1)[0],
          totalDistanceToday,
          totalDistance: device.totalDistance,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching device:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Route to fetch device locations
const getAllLocation = async (req, res) => {
  try {
    // fetch all devices
    const devices = await Location.find({});

    const latestData = devices.map((device) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDistances = device.locations?.filter(
        (location) => new Date(location.deviceTime) >= today
      );

      const totalDistanceToday =
        todayDistances?.reduce((sum, loc) => sum + loc.distance, 0) || 0;

      return {
        mobile_id: device.mobile_id,
        employee_name: device.fullName,
        mobileIdentifier: device.mobileIdentifier,
        latestLocation: device.locations.slice(-1)[0],
        totalDistanceToday,
        totalDistance: device.totalDistance,
      };
    });

    return res.status(200).json({
      message: "All devices data fetched successfully",
      latestData,
    });
  } catch (error) {
    console.error("Error fetching device data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// const.get("/location/:mobile_id", async (req, res) => {
//   try {
//     const { mobile_id } = req.params;
//     const { start, end } = req.query;

//     // Find the device by mobile_id
//     const device = await Location.findOne({
//       mobile_id: Number(mobile_id),
//     });
//     if (!device) {
//       return res.status(404).json({ message: "Location Location not found" });
//     }

//     let locations = device.locations;

//     // Filter locations based on date range if provided
//     if (start && end) {
//       const startDate = new Date(start);
//       const endDate = new Date(end);

//       // Check for valid date ranges
//       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         return res.status(400).json({ message: "Invalid date format" });
//       }

//       // Filter locations based on the provided time frame
//       locations = locations.filter((location) => {
//         const locationDate = new Date(location.deviceTime);
//         return locationDate >= startDate && locationDate <= endDate;
//       });
//     }

//     return res.status(200).json({
//       data: {
//         message: "Locations fetched successfully",
//         mobile_id: device.mobile_id,
//         employee_name: device.fullName, // Use fullName
//         locations,
//         totalDistance: device.totalDistance,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching locations:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

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
  getAllLocation,
  deleteAllLocation,
};
