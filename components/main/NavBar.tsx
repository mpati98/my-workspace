"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LINKS } from "@/utilities/constants";
import Image from "next/image";
import logo from "@/assets/logo.svg";

const Navbar = () => {
    const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetHref, setTargetHref] = useState("/");
  const [dots, setDots] = useState(".");
  const dotTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle loading state and dot animation
    useEffect(() => {
    if (loading) {
      dotTimer.current = setInterval(
        () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
        380,
      );
    } else {
      if (dotTimer.current) clearInterval(dotTimer.current);
      setDots(".");
    }
    return () => {
      if (dotTimer.current) clearInterval(dotTimer.current);
    };
  }, [loading]);

  useEffect(() => {
    if (loading) setTimeout(() => setLoading(false), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
// Navigation handler
  function navigate(href: string) {
    if (href === pathname || loading) return;
    setTargetHref(href);
    setLoading(true);
    setTimeout(() => router.push(href), 60);
  }
// Determine the active link based on the current pathname
  const target = LINKS.find((l) => l.href === targetHref) ?? LINKS[0];

  return (
  <>
      {loading && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center animate-loader-in bg-[#0d0f12] text-white"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${target.color}07 1px,transparent 1px),linear-gradient(90deg,${target.color}07 1px,transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#1a1d24]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-ring"
              style={{
                borderTopColor: target.color,
                borderRightColor: target.color + "33",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full animate-glow-pulse"
              style={{
                background: target.color,
                boxShadow: `0 0 16px ${target.color}`,
              }}
            />
          </div>
          <div className="animate-slide-up text-center relative z-10" suppressHydrationWarning>
            <div
              className="text-sm font-semibold tracking-[4px] mb-2.5"
              style={{ color: target.color }}
            >
              {target.page.toUpperCase()}
            </div>
            <div className="text-[10px] tracking-[3px] text-[#2d3340]">
              LOADING{dots}
            </div>
          </div>
        </div>
      )}
            <nav className="relative z-100 flex items-center h-11 bg-[#111214] border-b border-[#1e2128]">
        {/* Spacer pushes links to the right */}
        <div className="flex-1" />
        <div className="flex items-center h-full overflow-x-auto">
          {LINKS.map(({ href, label, color }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className="relative flex items-center h-full px-3 sm:px-5 bg-transparent border-none font-mono text-[10px] sm:text-[11px] tracking-widest whitespace-nowrap transition-colors duration-200"
                style={{
                  color: active ? color : "#4b5563",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {active && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm"
                    style={{ background: color }}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
        {/* Logo with left gap */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center pl-6 pr-4 sm:pl-8 sm:pr-6 shrink-0 border-l border-[#1e2128] cursor-pointer"
        >
          <Image src={logo} width={28} height={28} alt="my logo" />
        </div>
      </nav>
    </>)
};

export default Navbar;
