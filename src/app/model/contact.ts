export type Contact = {
  receivedFrom: {
    sender: string;
    id: string;
  }[];
  sentTo: string[];
};

export default Contact;
