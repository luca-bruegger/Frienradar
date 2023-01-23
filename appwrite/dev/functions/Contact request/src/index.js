const sdk = require("node-appwrite");
const OneSignal = require('@onesignal/node-onesignal');
/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();

  // You can remove services you don't use
  const account = new sdk.Account(client);
  const avatars = new sdk.Avatars(client);
  const database = new sdk.Databases(client);
  const functions = new sdk.Functions(client);
  const health = new sdk.Health(client);
  const locale = new sdk.Locale(client);
  const storage = new sdk.Storage(client);
  const teams = new sdk.Teams(client);
  const users = new sdk.Users(client);

  if (
    !req.variables['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.variables['APPWRITE_FUNCTION_API_KEY']
  ) {
    console.warn("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
      .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
      .setSelfSigned(true);
  }


  const eventData = req.variables.APPWRITE_FUNCTION_EVENT_DATA;
  const recipientId = JSON.parse(eventData).recipient;
  const senderId = JSON.parse(eventData).sender;
  const senderUsername = (await database.getDocument('users', 'usernames', senderId)).username;

  const configuration = OneSignal.createConfiguration({
    appKey: req.variables['ONESIGNAL_API_KEY']
  });

  const oneSignalClient = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = req.variables['ONESIGNAL_APP_ID'];
  notification.contents = {"en": "Du hast eine neue Freundschaftsanfrage von " + senderUsername};
  notification.headings = {"en": "Neue Freundschaftsanfrage"};
  notification.include_external_user_ids = [recipientId];

  const notificationResponse = await oneSignalClient.createNotification(notification);

  console.log(notificationResponse);
  res.json({
    oneSignalResponse: notificationResponse,
  });
};
