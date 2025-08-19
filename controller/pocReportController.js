const POC = require('../model/poc');

const pocReport = async (req, res) => {
  try {
    const { 
      filterType = "POC", // default is POC
      createdById,
      country,
      region,
      city,
      keyword = "", 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    if (filterType === "Area") {
      if (country && region && city) {
        filter = { country, region, city };
      } else if (country && region && !city) {
        filter = { country, region };
      } else if (country && !region && !city) {
        filter = { country };
      }
      filter.$or = [
        { pocName: { $regex: new RegExp(keyword, "i") } },
        { number: { $regex: new RegExp(keyword, "i") } }
      ];
    } 
    else if (filterType === "User") {
      filter = {
        ...(createdById && { createdById }),
        $or: [
          { pocName: { $regex: new RegExp(keyword, "i") } },
          { number: { $regex: new RegExp(keyword, "i") } }
        ]
      };
    } 
    else if (filterType === "POC") {
      filter = {
        $or: [
          { pocName: { $regex: new RegExp(keyword, "i") } },
          { number: { $regex: new RegExp(keyword, "i") } }
        ]
      };
    }

    // Fetch with pagination and populate createdById
    const foundPOC = await POC.find(filter)
      .populate('createdById', 'username') // populate username only
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await POC.countDocuments(filter);

    // Remap the data
    const remappedData = foundPOC.map(poc => ({
      _id: poc._id,
      pocName: poc.pocName,
      age: poc.age,
      gender: poc.gender,
      number: poc.number,
      category: poc.category,
      specialization: poc.specialization,
      ambNumber: poc.ambNumber || "",
      address: `${poc.country}, ${poc.region}, ${poc.city}, ${poc.address || ""}`,
      visitCounter: poc.visitCounter || 0,
      referralCounter: poc.referralCounter || 0,
      username: poc.createdByName || poc.createdById?.username || "",
      userId: poc.createdById?._id || ""
    }));

    return res.status(200).json({
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      data: remappedData
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { pocReport };
