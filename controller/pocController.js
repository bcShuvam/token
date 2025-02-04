const POC = require("../model/poc");
const VisitLog = require("../model/visitLog");
const User = require("../model/users");

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
    const createdById = req.query.createdById;
    console.log(createdById);
    if (!createdById)
      return res.status(400).json({ message: "createdById is required" });
    const foundPOC = await POC.find({ createdById });
    const foundPOCs = await POC.find();
    res.status(200).json({ message: "Success", poc: foundPOCs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs" });
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

const createPOC = async (req, res) => {
  try {
    const {
      pocName,
      age,
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
          "pocName, age, number, country, region, city, address, category, createdById, createdByName remarks, mobileTime, visitDate, latitude, longitude are required",
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

module.exports = {
  getPOCs,
  getPocCreatedById,
  createPOC,
  pocFollowUp,
};
