const POC = require("../model/poc");
const VisitLog = require("../model/visitLog");
const User = require("../model/users");
const { response } = require("express");

const getPOCs = async (req, res) => {
  try {
    const foundPOCs = await POC.find();
    res.status(200).json({ message: "Success", poc: foundPOCs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs" });
  }
};

const getPOCById = async (req, res) => {
  try {
    const id = req.params.id;
    const createdById = req.query.createdById; // or req.params for id
    if (!createdById || !id) {
      return res.status(400).json({ message: "createdById and id are required" });
    }

    const foundPOC = await POC.findOne({ _id: id, createdById });
    if (!foundPOC) {
      return res.status(404).json({ message: "POC not found" });
    }

    res.status(200).json({ message: "Success", poc: foundPOC });
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC" });
  }
};

const getPOCByCreatedByIdAndCategory = async (req, res) => {
  try {
    const { createdById, category } = req.query;
    if (!createdById)
      return res.status(400).json({ message: "createdById is required" });
    console.log(createdById, category);
    let foundPOC;
    if (!category) {
      foundPOC = await POC.find({
        createdById,
        category: { $not: { $eq: "Ambulance" } },
      });
    } else {
      foundPOC = await POC.find({ createdById, category });
    }
    res.status(200).json({ message: "Success", poc: foundPOC });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPocCreatedById = async (req, res) => {
  try {
    const createdById = req.query.createdById;
    console.log(createdById);
    if (!createdById)
      return res.status(400).json({ message: "createdById is required" });
    const foundPOC = await POC.find({ createdById });
    if (!foundPOC)
      return res.status(404).json({ message: `no poc createdBy id ${_id}` });
    const formattedPOC = foundPOC.map((poc) => ({
      _id: poc._id,
      pocName: poc.pocName,
      age: poc.age,
      gender: poc.gender,
      category: poc.category,
      specialization: poc.specialization,
      organization: poc.organization,
      ambNumber: poc.ambNumber,
      number: poc.number,
      address: `${poc.country}, ${poc.region}, ${poc.city}, ${poc.address}`,
    }));
    res.status(200).json({ message: "Success", poc: formattedPOC });
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs" });
  }
};

const getPocCreatedByIdWithPagination = async (req, res) => {
  try {
    const createdById = req.params.id;
    const { keyword = '', page = 1, limit = 20, category = '' } = req.query;

    if (!createdById) {
      return res.status(400).json({ message: "createdById is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Base filter with search
    const filter = {
      createdById,
      $or: [
        { pocName: { $regex: new RegExp(keyword, "i") } },
        { number: { $regex: new RegExp(keyword, "i") } }
      ]
    };

    // Apply category filtering if provided
    if (category && category.trim() !== '') {
      if (category.toLowerCase() === 'ambulance') {
        filter.category = 'Ambulance';
      } else if (category.toLowerCase() === 'poc') {
        filter.category = { $ne: 'Ambulance' };
      }
    }

    const foundPOC = await POC.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    if (!foundPOC || foundPOC.length === 0) {
      return res.status(404).json({ message: "No matching POCs found." });
    }

    const formattedPOC = foundPOC.map((poc) => ({
      _id: poc._id,
      pocName: poc.pocName,
      age: poc.age,
      gender: poc.gender,
      category: poc.category,
      specialization: poc.specialization,
      organization: poc.organization,
      ambNumber: poc.ambNumber,
      number: poc.number,
      address: `${poc.country}, ${poc.region}, ${poc.city}, ${poc.address}`,
    }));

    res.status(200).json({
      message: "Success",
      page: parseInt(page),
      limit: parseInt(limit),
      poc: formattedPOC,
    });
  } catch (error) {
    console.error("Error fetching POCs:", error);
    res.status(500).json({ message: "Error fetching POCs" });
  }
};

const createPOC = async (req, res) => {
  try {
    const {
      pocName,
      age,
      gender,
      number,
      country,
      region,
      city,
      address,
      category,
      specialization,
      organization,
      ambNumber,
      createdById,
      createdByName,
      remarks,
      mobileTime,
      visitDate,
      latitude,
      longitude,
    } = req.body;
    if (
      !pocName ||
      !number ||
      !gender ||
      !country ||
      !region ||
      !city ||
      !address ||
      !category ||
      !createdById ||
      !createdByName ||
      !remarks ||
      !mobileTime ||
      !visitDate ||
      !latitude ||
      !longitude
    )
      return res.status(400).json({
        message:
          "pocName, age, gender, number, country, region, city, address, category, createdById, createdByName remarks, mobileTime, visitDate, latitude, longitude are required",
      });
    const foundVisitLog = await VisitLog.findOne({ _id: createdById });
    if (!foundVisitLog)
      return res
        .status(404)
        .json({ message: `Marketing office with id ${createdById} not found` });
    const findPOC = await POC.findOne({ number: number });
    if (findPOC)
      return res
        .status(400)
        .json({ message: `POC with number '${number}' already exists.` });
    const newPOC = await POC.create({
      pocName,
      age,
      gender,
      number,
      country,
      region,
      city,
      address,
      category,
      specialization,
      organization,
      ambNumber,
      createdById,
      createdByName,
    });
    newPOC.save();
    const visitLogDetails = {
      pocId: newPOC._id,
      pocName: newPOC.pocName,
      remarks: remarks,
      visitType: "New",
      mobileTime: mobileTime,
      visitDate: visitDate,
      latitude: latitude,
      longitude: longitude,
    };
    const updatedVisitLog = await VisitLog.findOneAndUpdate(
      { _id: createdById },
      { $inc: { visitLogCounter: 1 }, $push: { visitLogs: visitLogDetails } }
    );
    res.status(200).json({ newPOC, updatedVisitLog });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const pocFollowUp = async (req, res) => {
  try {
    const {
      pocId,
      pocName,
      createdById,
      remarks,
      mobileTime,
      visitDate,
      latitude,
      longitude,
    } = req.body;
    if (
      !pocId ||
      !pocName ||
      !createdById ||
      !remarks ||
      !mobileTime ||
      !visitDate ||
      !latitude ||
      !longitude
    )
      return res.status(400).json({
        message:
          "pocName, pocId, createdById, remarks, mobileTime, latitude, longitude are required",
      });
    const foundVisitLog = await VisitLog.findById(createdById).exec();
    if (!foundVisitLog)
      return res
        .status(404)
        .json({ message: `User with id ${createdById} not found` });
    const foundPOC = await POC.findById(pocId).exec();
    if (!foundPOC)
      return res
        .status(404)
        .json({ message: `POC with id ${pocId} not found` });

    const followUpDetails = {
      pocId: pocId,
      pocName: pocName,
      remarks: remarks,
      visitType: "Follow Up",
      mobileTime: mobileTime,
      visitDate: visitDate,
      latitude: latitude,
      longitude: longitude,
    };

    const updatePOCVisitCounter = await POC.findByIdAndUpdate(
      {
        _id: pocId,
      },
      { $inc: { visitCounter: 1 } }
    );

    const updatedVisitLog = await VisitLog.findByIdAndUpdate(
      { _id: createdById },
      { $inc: { visitLogCounter: 1 }, $push: { visitLogs: followUpDetails } }
    );

    res.status(200).json({ updatePOCVisitCounter, updatedVisitLog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePOCById = async (req, res) => {
  try {
    const id = req.params.id;
    const createdById = req.query.createdById; // or req.params for id
    if (!createdById || !id) {
      return res.status(400).json({ message: "createdById and id are required" });
    }

    const updateData = req.body;
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedPOC = await POC.findOneAndUpdate(
      { _id: id, createdById },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPOC) {
      return res.status(404).json({ message: "POC not found" });
    }

    res.status(200).json({ message: "POC updated successfully", poc: updatedPOC });
  } catch (error) {
    console.error("Error updating POC:", error);
    res.status(500).json({ message: "Error updating POC" });
  }
};

const pocByArea = async (req, res) => {
  try {
    const { createdBy, country, region, city } = req.query;
    let foundPOC;
    if (country && region && city) {
      foundPOC = await POC.find({ $and: [{ region }, { city }] });
    } else if (country && region && !city) {
      foundPOC = await POC.find({ $and: [{ country }, { region }] });
    } else if (country && (!city && !region)) {
      foundPOC = await POC.find({ country });
    }
    if (!foundPOC && foundPOC.length === 0) return res.status(404).json({message: `POC not found by area ${country} ${region} ${city}`, poc: foundPOC })
    return res.status(200).json({ message: "POC found", poc: foundPOC });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getPOCs,
  getPOCById,
  getPOCByCreatedByIdAndCategory,
  getPocCreatedById,
  getPocCreatedByIdWithPagination,
  createPOC,
  pocFollowUp,
  updatePOCById,
  pocByArea,
};
