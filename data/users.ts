export const users = [
  { id: 1, name: 'Alice Johnson', email: 'ajohnson@gmail.com', tier: 'Premium', credits: 5 },
  { id: 2, name: 'Bob Smith', email: ' bsmith@gmail.com', tier: 'Free', credits: 2 },
  { id: 3, name: 'Charlie Brown', email: 'cbrown@gmail.com', tier: 'Premium', credits: 8 },
  { id: 4, name: 'David Lee', email: 'DLee@outlook.com', tier: 'Free', credits: 1 },
  { id: 5, name: 'Emily Davis', email: 'Emilyd@hotmail.com', tier: 'Premium', credits: 15 },
];

export type User = {
  id: number;
  name: string;
  email: string;
  tier: string;
};
