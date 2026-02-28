"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

export default function ClientComponent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.log("User doesn't exist");
      } else {
        setUser(data?.user);
      }
    }
    getUser();
  }, []);

  return <h2>{user?.email}</h2>;
}
