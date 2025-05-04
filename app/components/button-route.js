import Link from "next/link";

export default function RouteButton({ href, className = "" }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-between bg-[#E3DAC9] text-black rounded-full font-[Arial] overflow-hidden transition-all hover:opacity-90 ${className}`}
    >
      <span className="px-12 py-4 text-lg font-normal -translate-x-[20px]">Route planen</span>
      <div className="relative h-16 mr-1.5 ">
        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center bg-[#6B6B6B] h-12 w-24 rounded-full text-[#E3DAC9]">
        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 384 512"
  fill="#E3DAC9"
  className="w-6 h-6 text-[#E3DAC9]"
>
  <path d="M168 0C75.1 0 0 75.1 0 168c0 87.5 136.7 271.4 151.1 290.5 4.5 6 11.6 9.5 18.9 9.5s14.4-3.5 18.9-9.5C215.3 439.4 352 255.5 352 168 352 75.1 276.9 0 184 0zm0 240c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z"/>
</svg>



        </div>
      </div>
    </Link>
  );
}