export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  confirmed: boolean;
  description: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  profile_picture: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  geolocation_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  invitation_count: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  preferred_distance: number;
};
