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
import signUpPic from "../../public/registration.webp";
import { createUser } from "../services/apiUsers";

const RegistrationForm = ({
  onCancel,
  isFullscreen = false,
  courses = [],
  isCoursesLoading = false,
  preselectedCourse = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Add state for form field values to preserve them on validation errors
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    socialId: "",
    choosedCourse: preselectedCourse ? preselectedCourse.id.toString() : "",
    choosedMedia: "",
    terms: false,
  });

  const handleCancel = () => {
    // Clean up and call the parent's onCancel
    setFormError("");
    setFormSuccess(false);
    onCancel();
  };

  // Function to handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Function to handle native date picker's value
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

  // Function to update full date based on day, month, and year
  useEffect(() => {
    if (day && month && year && year.length === 4) {
      const formattedDay = day.padStart(2, "0");
      const formattedMonth = month.padStart(2, "0");
      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
      setDateValue(formattedDate);
    }
  }, [day, month, year]);

  // Handle form submission: extract form data and validate
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    // Client-side validation for socialId (personal ID)
    if (!/^\d{11}$/.test(formValues.socialId)) {
      setFormError("პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს");
      setIsLoading(false);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setFormError("");
      }, 5000);

      return;
    }

    if (!formValues.terms) {
      setFormError("გთხოვთ დაეთანხმოთ წესებს და პირობებს");
      setIsLoading(false);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setFormError("");
      }, 5000);

      return;
    }

    try {
      // Find the corresponding course object to get the title
      let selectedCourse, courseTitle;

      if (preselectedCourse) {
        // თუ წინასწარ არჩეული კურსია
        selectedCourse = preselectedCourse;
        courseTitle = preselectedCourse.title;
      } else {
        // სტანდარტული შემთხვევა - select-იდან არჩეული კურსი
        selectedCourse = courses.find(
          (course) => course.id.toString() === formValues.choosedCourse
        );
        courseTitle = selectedCourse ? selectedCourse.title : "";
      }

      const userData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        birth_date: dateValue,
        socialId: formValues.socialId,
        choosedCourse: courseTitle, // Save the course title instead of ID
        choosedCourseId: formValues.choosedCourse, // Optionally keep the ID as well
        choosedMedia: formValues.choosedMedia,
      };

      await createUser(userData);
      setFormSuccess(true);

      setTimeout(() => {
        onCancel();
        setFormSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      // Display the specific error message from the API
      setFormError(
        error.message ||
          "შეცდომა მოხდა რეგისტრაციისას. გთხოვთ, სცადოთ მოგვიანებით."
      );

      // Clear error message after 5 seconds
      setTimeout(() => {
        setFormError("");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom styles for select dropdown options
  const selectStyles = `
    select option:hover, select option:focus {
      background-color: #E4E0F5 !important;
      color: #282525 !important;
    }
    
    select option:checked {
      background-color: #E4E0F5 !important;
      color: #282525 !important;
    }
    
    select option {
      padding: 8px;
    }
  `;

  return (
    <div className="flex relative p-2 lg:p-4 w-full caps-text rounded-[8px] lg:rounded-[20px] lg:gap-[16px] flex-col lg:flex-row h-full lg:max-h-[650px]">
      <style jsx global>
        {selectStyles}
      </style>
      <div className="hidden lg:flex bg-[#EAF1FA] h-[auto] w-full lg:w-[50%] items-center justify-center rounded-[20px]">
        <img
          src={signUpPic.src}
          alt="sign-up-illustration"
          className="w-[544px] object-cover"
        />
      </div>

      <div
        className={`w-full lg:w-[50%] p-4 lg:p-8 ${
          isFullscreen
            ? "max-h-[80vh] overflow-y-auto"
            : "h-[650px] overflow-y-hidden"
        }`}
      >
        <div className="mb-12 flex items-center justify-between relative">
          <div>
            <h2 className="text-xl max-lg:mt-[48px] lg:text-2xl font-bold text-[#434A53]">
              კურსზე რეგისტრაცია
            </h2>

            <div className="mt-2 h-1 w-20 lg:w-24 rounded-[4px] bg-primary-500"></div>
          </div>
          <Image
            className="lg:absolute lg:top-[-62%] right-[10px] max-lg:mt-[40px] lg:right-[-5%] cursor-pointer w-[30px] h-[30px] lg:w-[36px] lg:h-[36px] z-10"
            src={cancel}
            onClick={handleCancel}
            alt="cancel svg"
          />
        </div>

        {formSuccess ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
            რეგისტრაცია წარმატებით დასრულდა! მადლობა.
          </div>
        ) : (
          <form className="space-y-3 lg:space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                  placeholder="სახელი"
                  required
                />
              </div>
              <div>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                  placeholder="გვარი"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div>
                <Input
                  id="telephone"
                  name="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                  placeholder="ტელეფონი"
                  required
                />
              </div>

              <div className="relative overflow-hidden w-full">
                {/* Mobile-friendly date input that shows native calendar picker */}
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
                  style={{
                    colorScheme: "light",
                  }}
                  required
                />

                {/* Custom calendar icon */}
                <Image
                  className="absolute overflow-hidden right-[20px] top-1/2 transform -translate-y-1/2 pointer-events-none z-30 max-sm:bg-white max-sm:w-[30px] max-sm:px-1 max-sm:right-[5px] max-lg:top-[26px]"
                  src={calendar}
                  alt="calendar icon"
                />

                {/* Custom text display - shows selected date or placeholder */}
                <div className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-[#707378] text-[13px] pt-2 lg:text-sm font-[500] pointer-events-none z-20 whitespace-nowrap">
                  {dateValue ? (
                    `${day}/${month}/${year}`
                  ) : (
                    <span>
                      <span className="lg:hidden">დაბ. თარიღი</span>
                      <span className="hidden lg:inline">დაბადების თარიღი</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                  placeholder="ელ.ფოსტა"
                  required
                />
              </div>
              <div>
                <Input
                  id="personalId"
                  name="socialId"
                  value={formValues.socialId}
                  onChange={handleInputChange}
                  className="w-full font-[500] mt-1 text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px]"
                  placeholder="პირადი ნომერი"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                {preselectedCourse ? (
                  // თუ კონკრეტული კურსი/შეთავაზებაა წინასწარ არჩეული - ვაჩვენებთ input ველს disabled მდგომარეობაში
                  <Input
                    id="course"
                    name="choosedCourse"
                    value={preselectedCourse.title}
                    className="w-full mt-1 font-[500] text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px] cursor-not-allowed"
                    readOnly
                  />
                ) : (
                  // სტანდარტული select ველი როცა ზოგადი რეგისტრაცია ხდება
                  <>
                    <select
                      id="course"
                      name="choosedCourse"
                      value={formValues.choosedCourse}
                      onChange={handleInputChange}
                      className="w-full mt-1 font-[500] text-[#707378] bg-white shadow-none border border-[#E7ECF2] text-[13px] lg:text-sm pt-2 pl-3 lg:pl-4 h-[45px] lg:h-[50px] rounded-[6px] cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                      required
                    >
                      <option value="" disabled>
                        {isCoursesLoading
                          ? "მიმდინარეობს ჩატვირთვა..."
                          : "აირჩიეთ კურსი"}
                      </option>
                      {courses.map((course) => (
                        <option
                          className="py-4"
                          key={course.id}
                          value={course.id.toString()}
                        >
                          {course.title}
                        </option>
                      ))}
                      {/* Fallback options if courses don't load */}
                      {courses.length === 0 && !isCoursesLoading && (
                        <>
                          <option value="web">ვებ დეველოპმენტი</option>
                          <option value="mobile">მობაილ დეველოპმენტი</option>
                          <option value="design">გრაფიკული დიზაინი</option>
                        </>
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                  </>
                )}
              </div>
            </div>

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
                  <option value="" disabled>
                    საიდან გაიგეთ ჩვენი კურსის შესახებ?
                  </option>
                  <option className="relative h-[30px]" value="friend">
                    მეგობარი
                  </option>
                  <option value="google">Google</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">Linkedin</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">სხვა.</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={formValues.terms}
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({ ...prev, terms: checked }))
                }
                required
              />
              <Label
                htmlFor="terms"
                className="text-xs lg:text-sm regular-text cursor-pointer text-[#434A53]"
              >
                ვეთანხმები{" "}
                <Link href="/privacy" target="_blank">
                  <span className="text-[#5387C9] cursor-pointer">
                    წესებს და პირობებს
                  </span>
                </Link>
              </Label>
            </div>

            {formError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="pt-3 lg:pt-4 pb-4">
              <Button
                type="submit"
                className="w-full bg-primary-500 h-[46px] lg:h-[56px] hover:bg-primary-600 duration-300 transition-all text-white text-sm lg:text-base py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "მიმდინარეობს..." : "გაგზავნა"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
