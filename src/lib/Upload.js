import axios from "axios";

export const uploadVideo = async (file) => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "Agency_Tool");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dwe3fcaq3/video/upload",
      formData
    );

    console.log("SUCCESS:", res.data);

    return res.data.secure_url;

  } catch (err) {

    console.log("FULL ERROR:", err);

    console.log("CLOUDINARY ERROR:", err.response?.data);

    alert(JSON.stringify(err.response?.data));

    throw err;
  }
};