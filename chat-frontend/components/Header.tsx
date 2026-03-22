"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/actions/auth";
import { Button } from "./ui/button";

type HeaderProps = {
  user?: {
    name?: string;
    email?: string;
  } | null;
};

export default function Header({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            CW
          </span>
          <div>
            <p className="text-lg font-semibold leading-tight text-foreground">Chat Workspace</p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live rooms</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Connected
          </div>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/80 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="User menu"
              >
                {getInitials(user.name)}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/70 bg-white/95 py-2 shadow-xl backdrop-blur">
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="h-px bg-border/60" />
                  <Link
                    href="/user"
                    className="block px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-destructive hover:text-destructive/80"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button className="rounded-full px-5">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
