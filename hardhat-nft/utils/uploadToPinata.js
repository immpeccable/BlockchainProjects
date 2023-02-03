const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  console.log("Uploading to IPFS...");
  for (fileIndex in files) {
    console.log("working on: ", fileIndex);
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    const readableStreamFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );

    try {
      const response = await pinata.pinFileToIPFS(readableStreamFile, options);
      responses.push(response);
    } catch (err) {
      console.error(err);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (err) {
    console.error(err);
  }
  return null;
}

module.exports = {
  storeImages,
  storeTokenUriMetadata,
};
