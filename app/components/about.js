import Image from "next/image"

export default function AboutUsSection() {
  return (
    <section className=" text-white py-16 px-6 lg:px-12">
      <div className="container mx-auto">
        <div className="mb-2">
          <h2 className="text-[#E3DAC9] text-lg mb-2">Über Uns</h2>
        </div>

        <h1 className="text-white text-3xl lg:text-4xl font-light leading-tight mb-7">Kompetent. Persönlich. Für Sie da.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2  items-center">
          <div>
            <Image
              src="/aboutbild-blackoverlay.png"
              alt="Team von Steuerberatern"
              width={600}
              height={400}
              className="rounded-md"
            />
          </div>

          <div>
            <h3 className=" text-[#E3DAC9] text-2xl font-bold mb-4 lg:mt-0 mt-10">Wir kümmern uns um Ihre Zahlen – und um Sie</h3>

            <p className="text-[#E4E4E4] text-xl leading-relaxed max-w-[600px]">
              Unter der Leitung von Hans-Georg Friemel, Steuerberater, bieten wir Ihnen professionelle Steuerberatung,
              die auf Ihre individuellen Bedürfnisse abgestimmt ist. Ob Vermietung, Existenzgründung oder komplexe
              steuerliche Fragen – wir beraten Sie kompetent und effizient. Vereinbaren Sie einfach einen Termin, um
              gemeinsam die beste Lösung für Ihre steuerlichen Anliegen zu finden.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
