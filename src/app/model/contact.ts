export type ContactModel = {
  receivedFrom: {
    senderId: string;
    contactId: string;
    createdAt: string;
  }[];
  sentTo: {
    recipientId: string;
    contactId: string;
    createdAt: string;
  }[];
};

export default ContactModel;
