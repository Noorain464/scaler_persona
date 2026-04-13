const { generateGoogleAuthUrl, getTokensFromCode } = require('../services/booking/calendarService');

const startGoogleAuth = (req, res, next) => {
  try {
    const url = generateGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};

const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).send(`Google OAuth failed: ${error}`);
    }

    if (!code) {
      return res.status(400).send('Missing OAuth code from Google.');
    }

    const tokens = await getTokensFromCode(code);
    console.log('[Google OAuth] Tokens received:', tokens);

    if (!tokens.refresh_token) {
      return res.send(`
        <h2>No refresh token returned</h2>
        <p>Google did not return a refresh token. Visit <code>/auth/google</code> again; the app uses <code>prompt=consent</code> and <code>access_type=offline</code>.</p>
        <p>If it still does not appear, remove this app's access from your Google Account permissions and try again.</p>
      `);
    }

    return res.send(`
      <h2>Google Calendar connected</h2>
      <p>Add this to <code>backend/.env</code>:</p>
      <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p>Then restart the backend server.</p>
    `);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startGoogleAuth,
  handleGoogleCallback
};
