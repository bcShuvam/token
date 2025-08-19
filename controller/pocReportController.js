const POC = require('../model/poc');

const pocReport = async (req, res) => {
  try {
    const { 
      filterType = "Area", // Area, User, POC
      createdById,
      country,
      region,
      city,
      number,
      pocName, 
      keyword = "", 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    if (filterType === "Area") {
      filter = {
        ...(country && { country }),
        ...(region && { region }),
        ...(city && { city }),
        $or: [
          { pocName: { $regex: new RegExp(keyword, "i") } },
          { number: { $regex: new RegExp(keyword, "i") } }
        ]
      };
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

    // Fetch with pagination
    const foundPOC = await POC.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    // Total count for frontend pagination
    const totalCount = await POC.countDocuments(filter);

    return res.status(200).json({
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      data: foundPOC
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { pocReport };
