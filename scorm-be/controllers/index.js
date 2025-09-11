class Controller {
  static getRootHandler(req, res) {
    res.status(200).json({ message: "scorm be is running" });
  }
}

module.exports = Controller;
