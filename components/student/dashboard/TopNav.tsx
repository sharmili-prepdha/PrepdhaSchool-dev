import Image from "next/image";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search, Zap, Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { signOut } from "@/auth";

interface TopNavProps {
  overallAccuracy?: number | null;
  overallProgress?: number | null;
  totalXp?: number;
  currentStreak?: number;
}

export default function TopNav({ overallAccuracy = 0, totalXp = 0 }: TopNavProps) {
  return (
    <div className="top-nav flex justify-between w-full px-8 py-3 items-center fixed z-20 top-0 border-b border-gray-200 bg-white">
      <div className="logo-container flex items-center gap-3 w-57.5 cursor-pointer">
        <Image src="/logo.png" width={32} height={32} alt="Prepdha Logo" />
        <span className="font-extrabold text-[#2d2d2d] text-xl">Prepdha</span>
      </div>
      <div className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-150">
          <InputGroup className="w-full bg-gray-50 h-10 border-gray-200 overflow-hidden">
            <InputGroupAddon className="bg-transparent border-none pl-4 text-gray-400">
              <Search className="w-4 h-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search for keywords, topic, chapter, anything."
              className="bg-transparent border-none text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            />
          </InputGroup>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <Button
          variant="outline"
          className="text-blue-500 rounded-full font-extrabold  gap-2 bg-white cursor-pointer"
        >
          <Zap className="w-2 h-2 fill-blue-500" />
          {totalXp} XP
        </Button>
        <Button
          variant="outline"
          className=" text-green-500 rounded-full font-extrabold gap-2 bg-white cursor-pointer"
        >
          <Target className="w-2 h-2 text-red-500" />
          {overallAccuracy}%
        </Button>
        <Button
          variant="outline"
          className=" text-gray-600 rounded-full font-extrabold px-2 bg-white cursor-pointer"
        >
          Aa
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none">
              <Avatar className="h-10 w-10 border border-blue-200 cursor-pointer">
                <AvatarImage src="/avatar.png" />
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSeparator />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="flex w-full items-center text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
