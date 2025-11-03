export const users = [
  { id: 1, name: 'Alice Johnson', email: 'ajohnson@gmail.com', tier: 'premium', credits: 5 },
  { id: 2, name: 'Bob Smith', email: ' bsmith@gmail.com', tier: 'free', credits: 2 },
  { id: 3, name: 'Charlie Brown', email: 'cbrown@gmail.com', tier: 'premium', credits: 8 },
  { id: 4, name: 'David Lee', email: 'DLee@outlook.com', tier: 'free', credits: 1 },
  { id: 5, name: 'Emily Davis', email: 'Emilyd@hotmail.com', tier: 'premium', credits: 15 },
];

export type User = {
  id: number;
  name: string;
  email: string;
  tier: string;
  credits: number;
};
