"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import cancel from "../../public/cancel.svg";
import calendar from "../../public/calendarLight.svg";
import { createSummerUser } from "../services/apiUsers";

const FIXED_COURSE = "საზაფხულო სკოლა კონტენტ კრეატორებისთვის";

const t = {
  title: "საზაფხულო სკოლაზე რეგისტრაცია",
  fields: {
    firstName: "სახელი",
    lastName: "გვარი",
    phone: "ტელეფონი",
    dobShort: "დაბ. თარიღი",
    dobFull: "დაბადების თარიღი",
    email: "ელ.ფოსტა",
    socialId: "პირადი ნომერი",
    media: "საიდან გაიგეთ ჩვენი კურსის შესახებ?",
  },
  mediaOptions: {
    friend: "მეგობარი",
    google: "Google",
    instagram: "Instagram",
    linkedin: "Linkedin",
    facebook: "Facebook",
    other: "სხვა",
  },
  terms: {
    agree: "ვეთანხმები",
    linkLabel: "წესებს და პირობებს",
  },
  submit: "გაგზავნა",
  submitting: "მიმდინარეობს...",
  success: "რეგისტრაცია წარმატებით დასრულდა! მადლობა.",
  errors: {
    socialId: "პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს",
    terms: "გთხოვთ დაეთანხმოთ წესებს და პირობებს",
    generic: "შეცდომა მოხდა რეგისტრაციისას. გთხოვთ, სცადოთ მოგვიანებით.",
  },
};

const SummerRegistrationForm = ({ onCancel, isFullscreen = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    socialId: "",
    choosedMedia: "",
    terms: false,
  });

  const handleCancel = () => {
    setFormError("");
    setFormSuccess(false);
    onCancel();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (e) => {
    const newValue = e.target.value;
    setDateValue(newValue);
    if (newValue) {
      const [yearVal, monthVal, dayVal] = newValue.split("-");
      setYear(yearVal);
      setMonth(monthVal);
      setDay(dayVal);
    }
  };

  useEffect(() => {
    if (day && month && year && year.length === 4) {
      setDateValue(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    }
  }, [day, month, year]);

  const showError = (msg) => {
    setFormError(msg);
    setIsLoading(false);
    setTimeout(() => setFormError(""), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    if (!/^\d{11}$/.test(formValues.socialId)) {
      return showError(t.errors.socialId);
    }

    if (!formValues.terms) {
      return showError(t.errors.terms);
    }

    try {
      const userData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        birth_date: dateValue,
        socialId: formValues.socialId,
        choosedCourse: FIXED_COURSE,
        choosedMedia: formValues.choosedMedia,
      };

      await createSummerUser(userData);
      setFormSuccess(true);

      setTimeout(() => {
        onCancel();
        setFormSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Summer registration error:", error);
      showError(error.message || t.errors.generic);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyles = `
    select option:hover, select option:focus {
      background-color: #E4E0F5 !important;
      color: #282525 !important;
    }
    select option:checked {
      background-color: #E4E0F5 !important;
      color: #282525 !important;
    }
    select option { padding: 8px; }
  `;

  return (
    <div className="flex relative p-2 lg:p-4 w-full caps-text rounded-[8px] lg:rounded-[20px] lg:gap-[16px] flex-col lg:flex-row h-full lg:max-h-[650px]">
      <style jsx global>{selectStyles}</style>

      {/* Image panel */}
      <div className="hidden lg:flex bg-[#EAF1FA] h-auto w-full lg:w-[50%] items-center justify-center rounded-[20px] overflow-hidden">
        <Image
          src="/summer_register.jpg"
          alt="summer-school-illustration"
          width={544}
          height={650}
          className="w-full h-full object-cover rounded-[20px]"
        />
      </div>

      <div className="w-full lg:w-[50%] p-4 lg:p-8 overflow-y-hidden max-h-[90vh] lg:max-h-[650px]">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between relative">
          <div>
            <h2 className="text-xl max-lg:mt-[48px] lg:text-2xl font-bold text-[#434A53]">
              {t.title}
            </h2>
            <div className="mt-2 h-1 w-20 lg:w-24 rounded-[4px] bg-primary-500" />
          </div>
          <Image
            className="lg:absolute lg:top-[-62%] right-[10px] max-lg:mt-[40px] lg:right-[-5%] cursor-pointer w-[30px] h-[30px] lg:w-[36px] lg:h-[36px] z-10"
            src={cancel}
            onClick={handleCancel}
            alt="cancel"
            width={36}
            height={36}
          />
        </div>

        {/* Success */}
        {formSuccess ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
            {t.success}
          </div>
        ) : (
          <form className="space-y-3 lg:space-y-4" onSubmit={handleSubmit}>
            {/* Row 1: Name */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Input
                id="firstName"
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                placeholder={t.fields.firstName}
                required
              />
              <Input
                id="lastName"
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                placeholder={t.fields.lastName}
                required
              />
            </div>

            {/* Row 2: Phone + DOB */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Input
                id="telephone"
                name="phoneNumber"
                value={formValues.phoneNumber}
                onChange={handleInputChange}
                className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                placeholder={t.fields.phone}
                required
              />

              {/* Date picker */}
              <div className="relative overflow-hidden w-full">
                <Input
                  id="actual-dob-input"
                  name="birth_date"
                  type="date"
                  value={dateValue}
                  onChange={handleDateChange}
                  className="w-full font-[500] mt-1 text-transparent bg-white overflow-hidden shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px] relative z-10 cursor-pointer
                    [&::-webkit-datetime-edit]:opacity-0
                    [&::-webkit-datetime-edit-fields-wrapper]:opacity-0
                    [&::-webkit-datetime-edit-text]:opacity-0
                    [&::-webkit-inner-spin-button]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:right-0
                    [&::-webkit-calendar-picker-indicator]:w-full
                    [&::-webkit-calendar-picker-indicator]:h-full
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:z-20"
                  style={{ colorScheme: "light" }}
                  required
                />
                <Image
                  className="absolute overflow-hidden right-[20px] top-1/2 transform -translate-y-1/2 pointer-events-none z-30 max-sm:bg-white max-sm:w-[30px] max-sm:px-1 max-sm:right-[5px] max-lg:top-[26px]"
                  src={calendar}
                  alt="calendar icon"
                  width={20}
                  height={20}
                />
                <div className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-[#707378] text-[13px] pt-2 lg:text-sm font-[500] pointer-events-none z-20 whitespace-nowrap">
                  {dateValue ? (
                    `${day}/${month}/${year}`
                  ) : (
                    <span>
                      <span className="lg:hidden">{t.fields.dobShort}</span>
                      <span className="hidden lg:inline">{t.fields.dobFull}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Email + Personal ID */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Input
                id="email"
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                placeholder={t.fields.email}
                required
              />
              <Input
                id="personalId"
                name="socialId"
                value={formValues.socialId}
                onChange={handleInputChange}
                className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                placeholder={t.fields.socialId}
                required
              />
            </div>

            {/* Fixed course display */}
            <div className="w-full mt-1 font-[500] text-[#707378] bg-[#F7F9FC] border border-[#E7ECF2] text-[13px] lg:text-sm pl-3 lg:pl-4 h-[45px] lg:h-[50px] rounded-[6px] flex items-center">
              {FIXED_COURSE}
            </div>

            {/* Media source */}
            <div className="mb-2 lg:mb-4">
              <div className="relative">
                <select
                  id="whereHeard"
                  name="choosedMedia"
                  value={formValues.choosedMedia}
                  onChange={handleInputChange}
                  className="w-full mt-1 font-[500] text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-1 pl-3 lg:pl-4 h-[45px] lg:h-[50px] rounded-[6px] cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="" disabled>{t.fields.media}</option>
                  <option value="friend">{t.mediaOptions.friend}</option>
                  <option value="google">{t.mediaOptions.google}</option>
                  <option value="instagram">{t.mediaOptions.instagram}</option>
                  <option value="linkedin">{t.mediaOptions.linkedin}</option>
                  <option value="facebook">{t.mediaOptions.facebook}</option>
                  <option value="other">{t.mediaOptions.other}</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={formValues.terms}
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({ ...prev, terms: checked === true }))
                }
                required
              />
              <Label
                htmlFor="terms"
                className="text-xs lg:text-sm regular-text cursor-pointer text-[#434A53]"
              >
                {t.terms.agree}{" "}
                <Link href="/privacy" target="_blank">
                  <span className="text-[#5387C9] cursor-pointer">
                    {t.terms.linkLabel}
                  </span>
                </Link>
              </Label>
            </div>

            {/* Error */}
            {formError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {formError}
              </div>
            )}

            {/* Submit */}
            <div className="pt-3 lg:pt-4 pb-4">
              <Button
                type="submit"
                className="w-full bg-primary-500 h-[46px] lg:h-[56px] hover:bg-primary-600 duration-300 transition-all text-white text-sm lg:text-base py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? t.submitting : t.submit}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SummerRegistrationForm;