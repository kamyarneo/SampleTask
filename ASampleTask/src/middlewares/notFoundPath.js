module.exports = async  (req, res) => {
  console.log("Path not found:", req.path);
  return res
    .status(404)
    .json({ message: "404! Path Not Found. Please check the path/method" });
};