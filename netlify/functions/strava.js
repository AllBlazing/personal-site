const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const {
    Strava_Client_ID,
    Strava_Client_Secret,
    Strava_Your_Refresh_Token
  } = process.env;

  // Log for debugging
  console.log('Strava_Client_ID:', Strava_Client_ID);
  console.log('Strava_Client_Secret:', Strava_Client_Secret ? 'set' : 'not set');
  console.log('Strava_Your_Refresh_Token:', Strava_Your_Refresh_Token ? 'set' : 'not set');

  // Get a new access token using the refresh token
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Strava_Client_ID,
      client_secret: Strava_Client_Secret,
      refresh_token: Strava_Your_Refresh_Token,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get Strava access token', details: tokenData })
    };
  }

  // Fetch activities
  const startOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${startOfMonth}&per_page=30`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );

  if (!activitiesRes.ok) {
    const errorDetails = await activitiesRes.text();
    console.error('Error fetching activities from Strava:', errorDetails);
    return {
      statusCode: activitiesRes.status,
      body: JSON.stringify({ error: 'Failed to fetch activities from Strava', details: errorDetails })
    };
  }

  const activities = await activitiesRes.json();

  return {
    statusCode: 200,
    body: JSON.stringify(activities)
  };
}; 