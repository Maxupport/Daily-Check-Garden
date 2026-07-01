"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 登入、註冊、與設定頁面不需要檢查
    if (
      pathname === "/auth/setup" ||
      pathname === "/auth/signin" ||
      pathname === "/auth/register"
    ) {
      return;
    }

    getSession().then((session) => {
      if (session?.user && (session.user as any).isComplete === false) {
        // 如果已登入但還沒設定密碼，導向設定頁面
        router.push("/auth/setup");
      }
    });
  }, [pathname, router]);

  return null;
}
