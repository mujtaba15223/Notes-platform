let appPromise;
let connectDBPromise;

module.exports = async (req, res) => {
  if (!appPromise) {
    appPromise = import("../server/src/app.js").then(({ default: app }) => app);
  }
  if (!connectDBPromise) {
    connectDBPromise = import("../server/src/config/db.js")
      .then(({ connectDB }) => connectDB())
      .catch((error) => {
        connectDBPromise = undefined;
        throw error;
      });
  }

  const [app] = await Promise.all([appPromise, connectDBPromise]);

  if (req.url.startsWith("/api/uploads/")) {
    req.url = req.url.slice("/api".length);
  }

  return app(req, res);
};
