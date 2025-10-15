"use client";
import { Bell } from "lucide-react";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import logo2 from "@/assets/images/logo.png";
import logo from "@/assets/images/logo.jpeg";
import Image from "next/image";
import { Settings } from "lucide-react";

import { Button } from "./button";
type Prop = {
  isAdmin: boolean;
  canShowInput: boolean;
  inputPlaceHolder?: string;
  pageTitle: string;
};

export default function DashBoardHeader({ data }: { data: Prop }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky bg-transparent backdrop-blur-3xl  justify-between flex border-b z-2  items-center p-3   top-0 right-0 w-full">
      <Link
        href={"/dashboard"}
        className=" overflow-hidden items-center lg:hidden flex   gap-2 "
      >
        <Image
          src={theme == "dark" ? logo2 : logo}
          alt="logo"
          className="h-7 w-7 object-contain"
        />
      </Link>
      <h1 className="text-xl hidden lg:flex">{data.pageTitle}</h1>
      <div className="flex gap-2">
        <div
          className="border cursor-pointer justify-center flex items-center   rounded-md p-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme != "dark" ? (
            <Sun className="w-5 h-5 " />
          ) : (
            <Moon className="w-5 h-5 " />
          )}
        </div>
        <Link
          href={"/dashboard/settings"}
          className="border cursor-pointer justify-center flex items-center   rounded-md p-2 lg:hidden"
        >
          <Settings />
        </Link>
      </div>
    </header>
  );
}
