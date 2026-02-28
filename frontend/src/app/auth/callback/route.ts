import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js"; // Import Supabase client type

async function generateUniqueUsername(
  supabase: SupabaseClient,
  baseUsername: string
): Promise<string> {
  let uniqueUsername = baseUsername;
  let isUnique = false;

  while (!isUnique) {
    // Append a random number, dot, or underscore to make it unique
    const randomSuffix = Math.floor(Math.random() * 9999);
    uniqueUsername = `${baseUsername}_${randomSuffix}`;

    // Check if the username already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("username", uniqueUsername)
      .limit(1)
      .single();

    if (!existingUser) {
      isUnique = true;
    }
  }

  return uniqueUsername;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient(); // Ensure proper Supabase client type
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data?.user?.email) {
        console.error(
          "Error fetching user data or missing email:",
          userError?.message
        );
        return NextResponse.redirect(`${origin}/error`);
      }

      const email = data.user.email;
      const baseUsername =
        data.user.user_metadata?.user_name || email.split("@")[0];

      // Check if the user exists
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .limit(1)
        .single();

      if (!existingUser) {
        // Generate a unique username
        const uniqueUsername = await generateUniqueUsername(
          supabase,
          baseUsername
        );

        // Insert the new user
        const { error: dbError } = await supabase.from("user_profiles").insert({
          email,
          username: uniqueUsername,
        });

        if (dbError) {
          console.error("Error inserting user data:", dbError.message);
          return NextResponse.redirect(`${origin}/error`);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
