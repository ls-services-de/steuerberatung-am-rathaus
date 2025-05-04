import Link from "next/link";

export default function AppointmentButton({ href, className = "" }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-between bg-[#E3DAC9] text-black rounded-full font-[Arial] overflow-hidden transition-all hover:opacity-90 ${className}`}
    >
      <span className="px-12 py-4 text-lg font-normal -translate-x-[20px]">Termin vereinbaren</span>
      <div className="relative h-16 mr-1.5 ">
        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center bg-[#6B6B6B] h-12 w-24 rounded-full text-[#E3DAC9]">
          <svg
            width="24"
            height="16"
            viewBox="0 0 24 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#E3DAC9]"
          >
            <path
              d="M23.7071 8.70711C24.0976 8.31658 24.0976 7.68342 23.7071 7.29289L17.3431 0.928932C16.9526 0.538408 16.3195 0.538408 15.9289 0.928932C15.5384 1.31946 15.5384 1.95262 15.9289 2.34315L21.5858 8L15.9289 13.6569C15.5384 14.0474 15.5384 14.6805 15.9289 15.0711C16.3195 15.4616 16.9526 15.4616 17.3431 15.0711L23.7071 8.70711ZM0 9H23V7H0V9Z"
              fill="#E3DAC9"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}