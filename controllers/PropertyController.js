const PROPERTY = require("../models/Property");
const cloudinary = require("cloudinary").v2;

const createProperty = async (req, res) => {
  const { userId } = req.user;
  const {
    title,
    description,
    location,
    bedroom,
    livingRoom,
    kitchen,
    toilet,
    paymentPeriod,
    price,
  } = req.body;
  if (
    !title ||
    !description ||
    !location ||
    !bedroom ||
    !livingRoom ||
    !kitchen ||
    !toilet ||
    !paymentPeriod ||
    !price
  ) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  try {
    //  handle images upload
    let uploadedImages = [];
    if (req.files?.images) {
      const uploadPromises = req.files.images.map((image) =>
        cloudinary.uploader.upload(image.tempFilePath, {
          folder: "torii-gate/properties",
          unique_filename: false,
          use_filename: true,
        })
      );
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map((result) => result.secure_url);
    }
    // create property on the db
    const property = await PROPERTY.create({
      title,
      description,
      location,
      bedroom,
      livingRoom,
      kitchen,
      toilet,
      paymentPeriod,
      price,
      images: uploadedImages, // store the uploaded image URLs
      landlord: userId, // associate the property with the landlord
    });
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  const { userId } = req.user;
  const { propertyId } = req.params;
  try {
    await PROPERTY.findOneAndDelete({ landlord: userId, _id: propertyId });
    res
      .status(200)
      .json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messagee: error.message });
  }
};

const getLandlordProperties = async (req, res) => {
  const { userId } = req.user;
  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    const properties = await PROPERTY.find({ landlord: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    //  const [total, availableProperties, rentedProperties] = await Promise.all([
    //     PROPERTY.countDocuments({landlord:userId}),
    //    PROPERTY.countDocuments({ landlord: userId, availability: "available" }),
    //    PROPERTY.countDocuments({
    //     landlord: userId,
    //     availability: "rented",
    //   });
    //  ]);
    const total = await PROPERTY.countDocuments({ landlord: userId });
    const totalPages = Math.ceil(total / limit);
    const availableProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "available",
    });
    const rentedProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "rented",
    });
    res.status(200).json({
      availableProperties,
      rentedProperties,
      total,
      currentPage: parseInt(page),
      totalPages,
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { availability } = req.body;
  if (!availability) {
    return res.status(400).json({ message: "Provide availability" });
  }
  try {
    const property = await PROPERTY.findByIdAndUpdate(propertyId);
    property.availability = availability;
    await property.save();
    res.status(200).json({
      success: true,
      message: "status updated successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProperties = async (req, res) => {
  const { page = 1, location, budget, type } = req.query;
  const limit = 12;
  const skip = (page - 1) * limit;
  try {
    const filter = {
      availability: "available",
    };

    if (location) {
      filter.location = { $regex: location, $options: "i" }; //
    }
    if (budget) {
      filter.price = { $lte: parseInt(budget) };
    }
    if (type) {
      filter.title = { $regex: type, $options: "i" };
    }
    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter); //16
    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
      num: properties.length,
      totalPages,
      currentPage: parseInt(page),
      properties,
      totalProperties,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAProperty = async (req, res) => {
  const { propertyId } = req.params;
  try {
    const property = await PROPERTY.findById(propertyId).populate(
      "landlord",
      "fullName profilePicture email phoneNumber"
    );
    // more from landlord

    const morePropertyFromLandlord = await PROPERTY.find({
      landlord: property.landlord._id,
      _id: { $ne: propertyId },
      availability: "available",
    })
      .limit(3)
      .sort("-createdAt");
    // similar price range 20% of the property price location
    // 1000 800-1200
    const priceRange = property.price * 0.2;
    const similarProperties = await PROPERTY.find({
      _id: { $ne: propertyId },
      availability: "available",
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange,
      },
      location: property.location,
    })
      .limit(3)
      .sort("-createdAt");
    res
      .status(200)
      .json({ property, morePropertyFromLandlord, similarProperties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getLandlordProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
  deleteProperty,
};
