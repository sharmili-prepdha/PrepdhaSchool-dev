"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, BookOpen, Dumbbell, Trophy, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentSideNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Dashboard matches both /student and /student/dashboard
    if (path === "/student" || path === "/student/dashboard") {
      return pathname === "/student" || pathname === "/student/dashboard";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/student/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { href: "/student/learn", icon: BookOpen, label: "Learn" },
    { href: "/student/practice", icon: Dumbbell, label: "Practice" },
    { href: "/student/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/student/shop", icon: Store, label: "Shop" },
  ];

  return (
    <div className="flex flex-col w-[260px] border-r min-h-[calc(100vh-65px)] sticky top-[65px] bg-white">
      <div className="flex flex-col p-6 gap-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={isActive(item.href) ? "elevated" : "outline"}
              className={`w-full justify-start gap-4 text-base font-semibold h-14 rounded-xl shadow-sm cursor-pointer border-b-8 transition-all ${isActive(item.href)
                  ? "bg-[#8b3dff] hover:bg-[#7e36e6] text-white border-[#802cfd]"
                  : "text-gray-500 border-3 border-gray-200 hover:bg-gray-50 hover:text-gray-700 shadow-none border-b-8"
                }`}
            >
              <item.icon className={`w-5 h-5 ${!isActive(item.href) && "opacity-70"}`} />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
