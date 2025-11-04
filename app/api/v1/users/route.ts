import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.ts');

// Helper function to read and parse users.ts
async function readUsersFile() {
  const fileContent = await fs.readFile(usersFilePath, 'utf8');
  const match = fileContent.match(/export const users = (\[[\s\S]*?\]);/);
  if (match && match[1]) {
    try {
      // The content of users.ts is a JavaScript array, not a JSON string.
      // A proper fix would be to use a .json file, but to avoid breaking other parts of the app
      // that might rely on the .ts file, we can use a safer way to evaluate it.
      // We will replace single quotes with double quotes and add quotes around keys.
      let arrayString = match[1];
      // Add quotes around keys
      arrayString = arrayString.replace(/([{,])\s*([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
      // Replace single quotes with double quotes for string values
      arrayString = arrayString.replace(/'/g, '"');
      return JSON.parse(arrayString);
    } catch (e) {
      console.error("Error parsing users data:", e);
      return [];
    }
  }
  console.error('Could not find users array in users.ts');
  return [];
}

// Helper function to write users array back to users.ts
async function writeUsersFile(usersArray: any[]) {
  const originalFileContent = await fs.readFile(usersFilePath, 'utf8');
  const newUsersContent = `export const users = ${JSON.stringify(usersArray, null, 2)};`;

  if (/export const users = \[[\s\S]*?\];/.test(originalFileContent)) {
    const newFileContent = originalFileContent.replace(/export const users = \[[\s\S]*?\];/, newUsersContent);
    await fs.writeFile(usersFilePath, newFileContent, 'utf8');
  } else {
    console.error('Could not find users array in original users.ts for writing');
  }
}

export async function GET() {
  const users = await readUsersFile();
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, avatarUrl } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    let users = await readUsersFile();
    const userIndex = users.findIndex((user: any) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedUser = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      avatarUrl: avatarUrl || users[userIndex].avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    await writeUsersFile(users);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
