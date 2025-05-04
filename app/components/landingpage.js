import Image from "next/image"


export default function Landingpage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black opacity-60 z-10" />
      <Image
        src="/bg.jpeg"
        alt="Background Image"
        width={1000}
        height={2000}
        className="w-full h-[100vh] object-cover object-[center_0%]"
      />

      {/* Main Text Content - centered but shifted right */}
      <div className="absolute inset-0 flex flex-col justify-center z-20 text-white lg:pl-[55%]  pl-[5%] pt-[200px] lg:pt-[0px]">
        <h2 className="lg:text-6xl text-5xl font-bold mb-4">Steuern</h2>
        <h2 className="lg:text-6xl text-5xl font-bold mb-4">Unternehmen</h2>
        <h2 className="lg:text-6xl text-5xl font-bold mb-8">Buchhaltung</h2>
        <p className="text-xl max-w-[500px] text-[#E4E4E4]">
          Ihr Partner für innovative und maßgeschneiderte Lösungen – transparent, digital und effizient.
        </p>
      </div>
    </div>
  )
}
