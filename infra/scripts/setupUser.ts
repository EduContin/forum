import { createUser } from "@/lib/user";
import database from "../database";
import bcrypt from "bcrypt";

async function setupAdmin() {
  const adminDetails = {
    username: "TestUser",
    email: "test@test.com",
    password: "Test123@#", // You should change this
  };

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminDetails.password, 10);
    adminDetails.password = hashedPassword;

    // Create the admin user
    const newUser = await createUser(adminDetails);

    if (!newUser) {
      throw new Error("Failed to create admin user");
    }

    // Update the user_group to admin
    const updateResult = await database.query({
      text: "UPDATE users SET user_group = $1 WHERE email = $2",
      values: ["Admin", adminDetails.email],
    });

    if (updateResult.rowCount === 1) {
      console.log("Admin user created and set up successfully");
    } else {
      throw new Error("Failed to update user_group to admin");
    }
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}

setupAdmin();
