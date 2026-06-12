import supabase, { executeWithTimeout, handleSupabaseError } from "./supabase";

// Check if a user with the given social ID already exists
export async function checkSocialIdExists(socialId) {
  try {
    const operation = supabase
      .from("users_form")
      .select("socialId")
      .eq("socialId", socialId)
      .limit(1);

    const { data, error } = await executeWithTimeout(
      operation,
      10000,
      "Check social ID exists"
    );

    if (error) {
      throw handleSupabaseError(error, "Check social ID exists");
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking social ID:", error);
    throw new Error("დროებითი შეფერხება, გთხოვთ სცადოთ მოგვიანებით");
  }
}

// Create a new user in the "users_form" table (a regular table, not the auth table)
export async function createUser(userData) {
  try {
    // Validate that socialId is exactly 11 digits
    if (!/^\d{11}$/.test(userData.socialId)) {
      throw new Error("პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს");
    }

    // Check if user with this social ID already exists
    const exists = await checkSocialIdExists(userData.socialId);
    if (exists) {
      throw new Error(
        "მოცემული პირადი ნომრით მომხმარებელი უკვე დარეგისტრირებულია"
      );
    }

    const operation = supabase.from("users_form").insert(
      [
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          birth_date: userData.birth_date,
          socialId: userData.socialId,
          choosedCourse: userData.choosedCourse,
          choosedMedia: userData.choosedMedia,
          created_at: new Date().toISOString(),
        },
      ],
      { returning: "minimal" }
    );

    const { data, error } = await executeWithTimeout(
      operation,
      15000,
      "Create user"
    );

    if (error) {
      throw handleSupabaseError(error, "Create user");
    }

    return data;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

// Create a new user in the "summer_users_form" table
export async function createSummerUser(userData) {
  try {
    if (!/^\d{11}$/.test(userData.socialId)) {
      throw new Error("პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს");
    }

    const operation = supabase.from("summer_users_form").insert(
      [
        {
          firstName:     userData.firstName,
          lastName:      userData.lastName,
          email:         userData.email,
          phoneNumber:   userData.phoneNumber,
          birth_date:    userData.birth_date,
          socialid:      userData.socialId,
          choosedCourse: userData.choosedCourse,
          choosedMedia:  userData.choosedMedia,
          created_at:    new Date().toISOString(),
        },
      ],
      { returning: "minimal" }
    );

    const { data, error } = await executeWithTimeout(
      operation,
      15000,
      "Create summer user"
    );

    if (error) {
      throw handleSupabaseError(error, "Create summer user");
    }

    return data;
  } catch (error) {
    console.error("Error in createSummerUser:", error);
    throw error;
  }
}