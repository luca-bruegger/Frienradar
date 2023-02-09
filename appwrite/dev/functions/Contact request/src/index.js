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
  const database = new sdk.Databases(client);
  const Permission = sdk.Permission;
  const ID = sdk.ID;
  const Role = sdk.Role;
  const Query = sdk.Query;

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


  const eventData = JSON.parse(req.payload)
  const recipientId = eventData.recipient;
  const senderId = eventData.sender;

  const recipientDocument = await database.listDocuments('radar', 'contacts', [
    Query.equal('sender', recipientId)
  ]);
  const senderDocument = await database.listDocuments('radar', 'contacts', [
    Query.equal('recipient', recipientId)
  ]);

  const friendADocument = await database.listDocuments('users', 'friends', [
    Query.equal('friendA', recipientId),
    Query.equal('friendB', senderId)
  ]);
  const friendBDocument = await database.listDocuments('users', 'friends', [
    Query.equal('friendB', recipientId),
    Query.equal('friendA', senderId)
  ]);

  const contactDocumentLengths = recipientDocument.documents.length + senderDocument.documents.length;
  const friendDocumentLengths = friendADocument.documents.length + friendBDocument.documents.length;

  if (contactDocumentLengths > 0) {
    res.json({
      error: {
        message: "Friend request already sent",
        code: 409
      }
    })
    return;
  } else if (friendDocumentLengths > 0) {
    res.json({
      error: {
        message: "Already friends",
        code: 409
      }
    })
    return;
  }

  const contactDocument = await database.createDocument('radar', 'contacts', ID.unique(), {
      recipient: recipientId,
      sender: senderId
    },
    [
      Permission.read(Role.user(recipientId)),
      Permission.read(Role.user(senderId)),
      Permission.write(Role.user(recipientId)),
      Permission.write(Role.user(senderId)),
      Permission.delete(Role.user(recipientId)),
      Permission.delete(Role.user(senderId))
    ]);

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

  await oneSignalClient.createNotification(notification);

  res.json({
    contactDocument
  });
};
