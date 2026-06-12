"use client";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "../_components/Logo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { getCourses } from "../services/apiCourses";
import RegistrationForm from "./RegistrationForm";

const t = {
  nav: {
    summer: "საზაფხულო სკოლა",
    courses: "კურსები",
    offer: "შეთავაზება",
    blog: "ბლოგი",
    about: "ჩვენ შესახებ",
    contact: "კონტაქტი",
    register: "რეგისტრაცია",
  },
  dialog: {
    title: "კურსზე რეგისტრაცია",
  },
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const fullscreenChecked = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCourseOrOfferPage =
    pathname.startsWith("/courses/") || pathname.startsWith("/offer/");
  const isSummerPage = pathname === "/summer";

  useEffect(() => {
    const registrationParam = searchParams.get("registration");
    const summerRegistrationParam = searchParams.get("summer_registration");
    if (registrationParam === "true" && !isCourseOrOfferPage && !isSummerPage && summerRegistrationParam !== "true") {
      setIsRegistrationOpen(true);
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    const checkViewportWidth = () => {
      const isMobile = window.innerWidth < 1024;
      if (isFullscreen !== isMobile) setIsFullscreen(isMobile);
    };

    if (!fullscreenChecked.current) {
      checkViewportWidth();
      fullscreenChecked.current = true;
    }

    window.addEventListener("resize", checkViewportWidth);
    return () => window.removeEventListener("resize", checkViewportWidth);
  }, [isFullscreen]);

  useEffect(() => {
    if (isRegistrationOpen && courses.length === 0) fetchCourses();
  }, [isRegistrationOpen]);

  const fetchCourses = async () => {
    setIsCoursesLoading(true);
    try {
      const coursesData = await getCourses();
      if (coursesData?.length > 0) setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleLinkClick = () => setMobileMenuOpen(false);

  const safelyToggleMobileMenu = () => {
    setTimeout(() => setMobileMenuOpen((prev) => !prev), 0);
  };

  const safelySetRegistrationOpen = (open) => {
    if ((isCourseOrOfferPage || isSummerPage) && open) return;
    if (open && new URLSearchParams(window.location.search).get("summer_registration") === "true") return;

    setTimeout(() => {
      setIsRegistrationOpen(open);

      if (!isCourseOrOfferPage) {
        const currentUrl = new URL(window.location);
        open
          ? currentUrl.searchParams.set("registration", "true")
          : currentUrl.searchParams.delete("registration");
        window.history.pushState({}, "", currentUrl.toString());
      }
    }, 0);
  };

  const getDialogContentStyle = () =>
    isFullscreen
      ? { border: "none", borderRadius: "0px", maxHeight: "100vh", overflowY: "auto" }
      : { maxHeight: "90vh", height: "auto", borderRadius: "20px", border: "none", overflowY: "hidden" };

  const navLinks = [
    { href: "/courses", label: t.nav.courses },
    { href: "/offer",   label: t.nav.offer   },
    { href: "/blog",    label: t.nav.blog    },
    { href: "/about",   label: t.nav.about   },
    { href: "/contact", label: t.nav.contact },
  ];

  const RegistrationDialog = () => (
    <AlertDialog open={isRegistrationOpen} onOpenChange={safelySetRegistrationOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-[156px] h-[48px] pt-[11px]">{t.nav.register}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className={`p-0 overflow-hidden ${
          isFullscreen
            ? "rounded-none w-screen h-screen max-w-none max-h-none"
            : "rounded-[20px] w-[95vw] max-w-[1220px]"
        } bg-white shadow-none animate-in fade-in-0 zoom-in-95 duration-300`}
        style={getDialogContentStyle()}
      >
        <AlertDialogTitle className="sr-only text-[#434A53]">
          {t.dialog.title}
        </AlertDialogTitle>
        <RegistrationForm
          onCancel={() => setIsRegistrationOpen(false)}
          isFullscreen={isFullscreen}
          courses={courses}
          isCoursesLoading={isCoursesLoading}
        />
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <header className="fixed max-lg:px-4 max-md:px-0 w-full top-0 left-0 z-50">
      <nav className="container max-sm:max-w-[95%] mx-auto flex items-center justify-between py-4 pl-7 pr-5 nav-shadow rounded-[16px] bg-white mt-6">
        <Logo />

        <ul className="hidden lg:flex caps-text gap-[36px] font-medium max-xl:text-[14px] text-base items-center">
          <li>
            <Link href="/summer" className="group">
              <Image src="/summer_logo.png" alt={t.nav.summer} width={508} height={360} className="object-contain transition-all duration-300 group-hover:[filter:drop-shadow(0_0_6px_#8471D9)_brightness(0.92)_saturate(1.2)]" style={{ width: "127px", height: "56px" }} />
            </Link>
          </li>

          {navLinks.map(({ href, label, icon, className }) => (
            <li key={href} className="mt-[4px]">
              <Link
                href={href}
                className={`leading-[24px] hover:text-primary-500 duration-300 transition-all ${
                  pathname === href ? "text-primary-500" : ""
                } ${className || ""}`}
              >
                {icon}{label}
              </Link>
            </li>
          ))}

          <li>
            <RegistrationDialog />
          </li>
        </ul>

        <div className="lg:hidden">
          <button onClick={safelyToggleMobileMenu} className="p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-sm:max-w-[95%] mx-auto container mt-2 bg-white rounded-[16px] nav-shadow p-4 animate-in slide-in-from-top duration-300">
          <ul  className="flex caps-text flex-col gap-3 font-medium">

            <li>
              <Link href="/summer" onClick={handleLinkClick} className="group">
                <Image src="/summer_logo.png" alt={t.nav.summer} width={508} height={360} className="object-contain transition-all duration-300 group-hover:[filter:drop-shadow(0_0_6px_#8471D9)_brightness(0.92)_saturate(1.2)]" style={{ width: "127px", height: "56px" }} />
              </Link>
            </li>

            {navLinks.map(({ href, label, icon ,className }) => (
              <li key={href} className="mt-[4px]">
                <Link
                  href={href}
                  className={`leading-[24px] hover:text-primary-500 duration-300 transition-all ${
                    pathname === href ? "text-primary-500" : ""
                  } ${className || ""}`}
                >
                  {icon}{label}
                </Link>
              </li>
            ))}
            
            <li className="py-2">
              <AlertDialog open={isRegistrationOpen} onOpenChange={safelySetRegistrationOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="w-full text-[14px]">{t.nav.register}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className={`p-0 overflow-hidden ${
                    isFullscreen
                      ? "rounded-none w-screen h-screen max-w-none max-h-none"
                      : "rounded-[20px] w-[95vw] max-w-[1220px]"
                  } animate-in fade-in-0 zoom-in-95 duration-300`}
                  style={getDialogContentStyle()}
                >
                  <AlertDialogTitle className="sr-only">
                    {t.dialog.title}
                  </AlertDialogTitle>
                  <RegistrationForm
                    onCancel={() => setIsRegistrationOpen(false)}
                    isFullscreen={isFullscreen}
                    courses={courses}
                    isCoursesLoading={isCoursesLoading}
                  />
                </AlertDialogContent>
              </AlertDialog>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}