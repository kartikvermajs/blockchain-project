"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function getUserSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }
  return { status: "success", user: data.user };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const avatarUrl = `https://ui-avatars.com/api/?name=${username}`;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error || !data?.user) {
    return {
      status: error?.message || "Signup failed",
      user: null,
    };
  }

  const user = data.user;

  // Insert into user_profiles table
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: user.id,
    email: user.email,
    username,
    avatar_url: avatarUrl,
  });

  if (profileError) {
    return { status: profileError.message, user: null };
  }

  revalidatePath("/", "layout");
  return { status: "success", user };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return {
      status: error?.message || "Invalid credentials",
      user: null,
    };
  }

  const user = data.user;

  // Check if user already exists in user_profiles table
  const { data: existingUser, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  // If user does not exist, insert with avatar
  if (!existingUser && !fetchError) {
    const avatarUrl =
      user.user_metadata?.avatar_url ||
      `https://ui-avatars.com/api/?name=${user.email}`;

    const { error: insertError } = await supabase.from("user_profiles").insert({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || "User",
      avatar_url: avatarUrl,
    });

    if (insertError) {
      return {
        status: insertError?.message,
        user: null,
      };
    }
  }

  revalidatePath("/", "layout");
  return { status: "success", user };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGithub() {
  const origin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_SITE_URL!;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect("/error");
  } else if (data.url) {
    return redirect(data.url);
  }
}

export async function signInWithGoogle() {
  const origin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_SITE_URL!;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    redirect("/error");
  } else if (data.url) {
    return redirect(data.url);
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
    {
      redirectTo: `${origin}/reset-password`,
    }
  );

  if (error) {
    return { status: error.message };
  }
  return { status: "success" };
}

export async function resetPassword(formData: FormData, code: string) {
  const supabase = await createClient();
  const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);

  if (codeError) {
    return { status: codeError.message };
  }

  const { error } = await supabase.auth.updateUser({
    password: formData.get("password") as string,
  });

  if (error) {
    return { status: error.message };
  }
  return { status: "success" };
}
