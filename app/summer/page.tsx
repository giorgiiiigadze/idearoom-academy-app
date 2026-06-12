"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import HeadTopCourse from "../courses/_components/HeadTopCourse";
import SummerRegistrationForm from "../_components/SummerRegistrationForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useSearchParams } from "next/navigation";
import lightCalendar from "../../public/calendarLight.svg";
import tv from "../../public/tv.svg";
import timer from "../../public/timer.svg";
import user from "../../public/user.svg";
import badge from "../../public/badge.svg";
import checkbox from "../../public/checkbox.svg";
import { createClient } from "../../supabase/client";

const t = {
  breadcrumb: "საზაფხულო სკოლა",
  details: {
    heading: "დეტალები",
    startDate: "დაწყების თარიღი:",
    duration: "კურსის ხანგრძლივობა:",
    sessions: "შეხვედრა",
    sessionLen: "შეხვედრის ხანგრძლივობა:",
    hours: "საათი",
    location: "მდებარეობა:",
    students: "სტუდენტები ჯგუფში:",
    cert: "სერტიფიკატი",
    price: "ფასი:",
    register: "დარეგისტრირდი",
  },
  tabs: {
    details: "დეტალები",
    syllabus: "სილაბუსები",
    lecturer: "მენტორები",
  },
  sections: {
    description: "კურსის აღწერა",
    syllabus: "სილაბუსი",
  },
  fallback: {
    noSyllabus: "სილაბუსი არ არის ხელმისაწვდომი",
    soon: "მალე დაიწყება",
    noMentors: "მენტორები მალე დაემატება",
  },
  dialog: { title: "საზაფხულო სკოლაზე რეგისტრაცია" },
};

type SummerDetails = {
  id: number;
  title: string;
  start_course: string;
  qunatity_of_lessons: number;
  lesson_time: number;
  qunatity_of_students: string;
  location: string;
  price: number;
  old_price: number;
  course_details: string[];
  image: string;
  video_url: string;
  video_thumbnail: string;
};

type SummerMentor = {
  id: number;
  name: string;
  description: string;
  sort_order: number;
};

type SyllabusSection = { title: string; content: (string | string[])[] };

function AccordionItem({ title, content }: { title: string; content: (string | string[])[] }) {
  return (
    <div className="py-2">
      <details className="group">
        <summary className="w-full rounded-[12px] px-6 bg-[#f9fafb] py-5 text-left font-medium text-secondary-500 caps-text flex justify-between items-center list-none cursor-pointer">
          <span className="mt-2 max-md:text-sm">{title}</span>
          <span>
            <img
              className="group-open:rotate-180 w-[16px] h-[16px] transition-transform"
              src="/downArrow.svg"
              alt="dropdown-arrow"
            />
          </span>
        </summary>
        <div className="mt-3 text-secondary-500">
          <div className="xl:ml-12 xl:py-5">
            <ul className="list-disc pl-5">
              {Array.isArray(content) && content.length > 0 ? (
                content.map((item, i) => (
                  <li className="mb-2 text-[#535960]" key={i}>
                    {String(item)}
                  </li>
                ))
              ) : (
                <li className="mb-2 text-[#535960]">
                  {typeof content === "string" ? content : t.fallback.noSyllabus}
                </li>
              )}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}

function DetailsTab({ course_details }: { course_details: string[] }) {
  return (
    <div className="bg-white rounded-[20px] px-4 py-6 lg:px-6 lg:py-8 mb-8 lg:mb-0">
      <p className="text-lg lg:text-xl font-bold caps-text text-secondary-500 mb-5">
        {t.sections.description}
      </p>
      {course_details.map((detail, i) => (
        <div
          key={i}
          className="flex items-start gap-3 lg:gap-4 text-sm mb-6 leading-[24px] text-secondary-500"
        >
          <Image src={checkbox} alt="checkbox" width={20} height={20} className="min-w-[20px] mt-1" />
          <p>{detail}</p>
        </div>
      ))}
    </div>
  );
}

function SyllabusTab({ syllabus }: { syllabus: SyllabusSection[] }) {
  const [activeWeek, setActiveWeek] = useState(0);

  if (!syllabus.length) {
    return (
      <div className="bg-white rounded-[20px] px-4 py-6 lg:px-6 lg:py-8 mb-8 lg:mb-0">
        <p className="text-secondary-500 text-sm">{t.fallback.noSyllabus}</p>
      </div>
    );
  }

  const activeItem = syllabus[activeWeek];
  const lectures = Array.isArray(activeItem?.content) ? activeItem.content : [];

  return (
    <div className="bg-white rounded-[20px] px-4 py-6 lg:px-6 lg:py-8 mb-8 lg:mb-0">
      <p className="text-lg lg:text-xl font-bold caps-text text-secondary-500 mb-5">
        {t.sections.syllabus}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {syllabus.map((week, i) => (
          <button
            key={i}
            onClick={() => setActiveWeek(i)}
            className={`pt-3 p-2 px-4 rounded-[8px] text-sm caps-text cursor-pointer transition-colors ${
              activeWeek === i
                ? "bg-primary-500 text-white"
                : "bg-[#f9fafb] text-secondary-500 hover:bg-gray-100"
            }`}
          >
            {week.title}
          </button>
        ))}
      </div>

      {lectures.length > 0 ? (
        lectures.map((item, i) => (
          <AccordionItem
            key={i}
            title={`ლექცია ${i + 1}`}
            content={typeof item === "string" ? [item] : item}
          />
        ))
      ) : (
        <p className="text-secondary-500 text-sm">{t.fallback.noSyllabus}</p>
      )}
    </div>
  );
}

function MentorsTab({ mentors }: { mentors: SummerMentor[] }) {
  if (!mentors.length) {
    return (
      <div className="bg-white rounded-[20px] px-4 py-6 lg:px-6 lg:py-8 mb-8 lg:mb-0">
        <p className="text-secondary-500 text-sm">{t.fallback.noMentors}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] px-4 py-6 lg:px-6 lg:py-8 mb-8 lg:mb-0">
      <div className="flex flex-col gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="text-sm leading-[24px] text-secondary-500">
            <p className="font-bold caps-text mb-2 text-lg">{mentor.name}</p>
            {mentor.description && (
              <p className="text-[#535960] break-words whitespace-pre-line">{mentor.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoSection({
  videoUrl,
  thumbnailUrl,
}: {
  videoUrl: string;
  thumbnailUrl: string;
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  if (!videoUrl && !thumbnailUrl) return null;

  return (
    <>
      <div className="w-full relative mt-16">
        <img
          src={thumbnailUrl || "/thumbnail1.webp"}
          alt="video-thumbnail"
          className="w-full relative rounded-[16px] h-auto"
        />
        <img
          className="absolute cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-300"
          src="/playButton.svg"
          alt="play-button"
          onClick={() => setIsVideoOpen(true)}
        />
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="flex items-center justify-center outline-none border-none bg-transparent shadow-none [&>button]:hidden p-0 max-w-[90vw] w-fit">
          <DialogTitle className="sr-only"></DialogTitle>
          <div className="relative inline-block">
            <img
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-2 right-2 cursor-pointer w-[36px] h-[36px] max-md:w-[28px] max-md:h-[28px] z-50"
              src="/whiteCancel.svg"
              alt="cancel-svg"
            />
            <video
              controls
              muted={false}
              autoPlay={true}
              playsInline
              className="w-auto h-auto max-h-[85vh] max-w-[85vw] border-none outline-none rounded-[20px] block fullscreen:h-screen fullscreen:max-w-none fullscreen:max-h-none fullscreen:w-auto fullscreen:bg-black"
              onError={(e) => {
                console.error("Video failed to load", e);
                setIsVideoOpen(false);
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CourseInfoCard({
  data,
  onRegister,
}: {
  data: SummerDetails;
  onRegister: () => void;
}) {
  return (
    <div className="bg-white w-full relative px-4 py-6 lg:px-6 lg:py-8 rounded-[20px] mb-8">
      <img
        className="absolute pointer-events-none select-none
          w-[60px] h-[60px] bottom-[72px] right-[12px]
          sm:w-[120px] sm:h-[120px] sm:bottom-[86px] sm:right-[20px]
          xl:w-[170px] xl:h-[170px] xl:bottom-[94px] xl:right-[24px]"
        src="/summer_image.svg"
        alt="illustration svg"
        loading="lazy"
      />

      <h3 className="text-base lg:text-lg font-bold caps-text text-secondary-500 mb-4">
        {t.details.heading}
      </h3>

      <div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <Image src={lightCalendar} alt="calendar" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-[15px]">
            {t.details.startDate}{" "}
            <span className="text-[#88919C] font-[400] regular-text ml-1">
              {data.start_course || t.fallback.soon}
            </span>
          </p>
        </div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <Image src={tv} alt="tv" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-base">
            {t.details.duration}{" "}
            <span className="text-[#88919C] font-[400] regular-text ml-1">
              {data.qunatity_of_lessons} {t.details.sessions}
            </span>
          </p>
        </div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <Image src={timer} alt="timer" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-base">
            {t.details.sessionLen}{" "}
            <span className="text-[#88919C] font-[400] regular-text ml-1">
              {data.lesson_time} {t.details.hours}
            </span>
          </p>
        </div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <Image src={user} alt="user" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-base">
            {t.details.students}{" "}
            <span className="text-[#88919C] font-[400] regular-text ml-1">
              {data.qunatity_of_students}
            </span>
          </p>
        </div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <Image src={badge} alt="badge" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-base">
            {t.details.cert}
          </p>
        </div>
        <div className="flex my-1 items-center gap-3 caps-text">
          <img src="/location_icon.svg" alt="location" width={24} height={24} />
          <p className="mt-2 text-secondary-500 font-[500] text-sm lg:text-base">
            {t.details.location}{" "}
            <span className="text-[#88919C] font-[400] regular-text ml-1">
              {data.location}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center mt-6">
        <p className="text-base lg:text-lg text-secondary-500 caps-text">
          {t.details.price}{" "}
          <span className="font-bold">{data.price} ლარი</span>
        </p>
        {Number(data.old_price) > 0 && (
          <p className="text-[16px] line-through font-[300] ml-4 caps-text text-[#d95a5a]">
            <span className="font-bold leading-[24px]">{data.old_price} ლარი</span>
          </p>
        )}
      </div>

      <Button
        className="w-full mt-4 lg:mt-6 text-[15px] lg:text-[16px] pt-3 lg:pt-4 h-[48px] lg:h-[56px] caps-text font-bold"
        onClick={onRegister}
      >
        {t.details.register}
      </Button>
    </div>
  );
}

const supabase = createClient();

export default function SummerPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [details, setDetails] = useState<SummerDetails | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusSection[]>([]);
  const [mentors, setMentors] = useState<SummerMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;

    (async () => {
      const [detailsRes, syllabusRes, mentorsRes] = await Promise.all([
        supabase
          .from("summer_details")
          .select("*")
          .single(),
        supabase
          .from("summer_syllabus")
          .select("id, name, lectures, sort_order")
          .order("sort_order", { ascending: true }),
        supabase
          .from("summer_mentors")
          .select("id, name, description, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

      if (!active) return;

      setLoading(false);

      if (detailsRes.error) {
        console.error("Failed to load summer details:", detailsRes.error);
      } else if (detailsRes.data) {
        setDetails(detailsRes.data as SummerDetails);
      }

      if (syllabusRes.error) {
        console.error("Failed to load summer syllabus:", syllabusRes.error);
      } else if (syllabusRes.data) {
        setSyllabus(syllabusRes.data.map((row) => ({ title: row.name, content: row.lectures })));
      }

      if (mentorsRes.error) {
        console.error("Failed to load summer mentors:", mentorsRes.error);
      } else if (mentorsRes.data) {
        setMentors(mentorsRes.data as SummerMentor[]);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const getDialogContentStyle = (): React.CSSProperties =>
    isFullscreen
      ? { border: "none", borderRadius: "0px", maxHeight: "100vh", overflowY: "auto" }
      : { maxHeight: "90vh", height: "auto", borderRadius: "20px", border: "none", overflowY: "hidden" };

  useEffect(() => {
    if (searchParams.get("summer_registration") === "true") {
      setShowRegistrationForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const check = () => setIsFullscreen(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleRegister = useCallback(() => {
    setShowRegistrationForm(true);
    const url = new URL(window.location.href);
    url.searchParams.set("summer_registration", "true");
    url.searchParams.delete("registration");
    window.history.pushState({}, "", url.toString());
  }, []);

  const handleCancel = useCallback(() => {
    setShowRegistrationForm(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("summer_registration");
    url.searchParams.delete("registration");
    window.history.pushState({}, "", url.toString());
  }, []);

  const tabs = [
    { key: "details", label: t.tabs.details },
    { key: "syllabus", label: t.tabs.syllabus },
    { key: "lecturer", label: t.tabs.lecturer },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <section className="container mx-auto max-lg:max-w-[95%] max-sm:max-w-[90%] mt-[128px]">
      <HeadTopCourse isCoursesPage={false}>
        <p className="cursor-pointer">{t.breadcrumb}</p>
      </HeadTopCourse>

      <div className="grid grid-cols-1 max-sm:mt-7 lg:grid-cols-12 gap-8 xl:gap-12">
        {/* Left column */}
        <div className="lg:col-span-7">
          <img
            className="w-full max-xl:rounded-[16px] rounded-[18px] max-xl:h-[380px] xl:h-[500px] max-sm:h-auto object-cover"
            src={details?.image || "/coverweb.webp"}
            alt={details?.title || t.breadcrumb}
          />
          <h4 className="text-xl caps-text font-bold mt-6 lg:mt-8 text-secondary-500">
            {details?.title || ""}
          </h4>

          {/* Mobile: CourseInfoCard + VideoSection */}
          <div className="lg:hidden mt-6 mb-8">
            {details && <CourseInfoCard data={details} onRegister={handleRegister} />}
            <VideoSection videoUrl={details?.video_url ?? ""} thumbnailUrl={details?.video_thumbnail ?? ""} />
          </div>

          <div className="flex my-5 lg:my-7 mb-8 lg:mb-12 text-sm items-center gap-3 caps-text overflow-x-auto whitespace-nowrap">
            {tabs.map(({ key, label }) => (
              <div
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${
                  activeTab === key
                    ? "bg-primary-500 text-white"
                    : "bg-white text-secondary-500"
                } pt-3 lg:pt-4 p-2 lg:p-3 px-3 lg:px-5 rounded-[8px] cursor-pointer`}
              >
                {label}
              </div>
            ))}
          </div>

          {activeTab === "details" && (
            <DetailsTab course_details={details?.course_details ?? []} />
          )}
          {activeTab === "syllabus" && <SyllabusTab syllabus={syllabus} />}
          {activeTab === "lecturer" && <MentorsTab mentors={mentors} />}
        </div>

        <div className="lg:col-span-5 max-lg:hidden">
          {details && <CourseInfoCard data={details} onRegister={handleRegister} />}
          <VideoSection videoUrl={details?.video_url ?? ""} thumbnailUrl={details?.video_thumbnail ?? ""} />
        </div>
      </div>

      <AlertDialog
        open={showRegistrationForm}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
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

          <SummerRegistrationForm
            onCancel={handleCancel}
            isFullscreen={isFullscreen}
          />
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}