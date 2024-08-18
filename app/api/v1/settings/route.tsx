import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import database from "@/infra/database";
import bcrypt from "bcrypt";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { settingType, ...data } = await req.json();

  try {
    switch (settingType) {
      case "email":
        await updateEmail(session.user.id, data.email);
        break;
      case "signature":
        await updateSignature(session.user.id, data.signature);
        break;
      case "profilePicture":
        await updateProfilePicture(session.user.id, data.avatarUrl);
        break;
      case "password":
        await updatePassword(
          session.user.id,
          data.currentPassword,
          data.newPassword,
        );
        break;
      default:
        return NextResponse.json(
          { message: "Invalid setting type" },
          { status: 400 },
        );
    }

    return NextResponse.json({ message: "Setting updated successfully" });
  } catch (error) {
    console.error("Error updating user setting:", error);
    return NextResponse.json(
      { message: "An error occurred while updating setting" },
      { status: 500 },
    );
  }
}

async function updateEmail(userId: string, email: string) {
  await database.query({
    text: "UPDATE users SET email = $1 WHERE id = $2",
    values: [email, userId],
  });
}

async function updateSignature(userId: string, signature: string) {
  await database.query({
    text: "UPDATE users SET signature = $1 WHERE id = $2",
    values: [signature, userId],
  });
}

async function updateProfilePicture(userId: string, avatarUrl: string) {
  await database.query({
    text: "UPDATE users SET avatar_url = $1 WHERE id = $2",
    values: [avatarUrl, userId],
  });
}

async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const userResult = await database.query({
    text: "SELECT password FROM users WHERE id = $1",
    values: [userId],
  });
  const user = userResult.rows[0];

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await database.query({
    text: "UPDATE users SET password = $1 WHERE id = $2",
    values: [hashedPassword, userId],
  });
}
