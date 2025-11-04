export const users = [
  {
    "id": 1,
    "name": "Matthew Smith",
    "email": "asphincter@gmail.com",
    "tier": "premium",
    "credits": 12,
    "avatarUrl": "https://i.pravatar.cc/150?img=1",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-04T01:00:55.972Z"
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "email": "bsmith@gmail.com",
    "tier": "free",
    "credits": 2,
    "avatarUrl": "https://i.pravatar.cc/150?img=2",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-04T01:00:55.972Z"
  },
  {
    "id": 3,
    "name": "Charlie Brown",
    "email": "cbrown@gmail.com",
    "tier": "premium",
    "credits": 8,
    "avatarUrl": "https://i.pravatar.cc/150?img=3",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-04T01:00:55.972Z"
  },
  {
    "id": 4,
    "name": "David Lee",
    "email": "DLee@outlook.com",
    "tier": "free",
    "credits": 1,
    "avatarUrl": "https://i.pravatar.cc/150?img=4",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-04T01:00:55.972Z"
  },
  {
    "id": 5,
    "name": "Emily Davis",
    "email": "Emilyd@hotmail.com",
    "tier": "premium",
    "credits": 15,
    "avatarUrl": "https://i.pravatar.cc/150?img=5",
    "createdAt": "2025-11-03T12:00:00.000Z",
    "updatedAt": "2025-11-04T01:00:55.972Z"
  }
];

export type User = {
  id: number;
  name: string;
  email: string;
  tier: string;
  credits: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};
