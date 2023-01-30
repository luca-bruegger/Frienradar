export type ContactModel = {
  receivedFrom: {
    senderId: string;
    contactId: string;
  }[];
  sentTo: {
    recipientId: string;
    contactId: string;
  }[];
};

export default ContactModel;
