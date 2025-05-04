"use client";

import RouteButton from "./button-route";

export default function LocationSection() {
  const address = "Kirchhellener Str. 42, 46236 Bottrop";
  const businessName = "Steuerberatung am Rathaus";
  const businessSubtitle = "Steuerberatungs mbH";

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      "_blank"
    );
  };

  return (
    <section className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-2">
          <h2 className="text-[#E3DAC9] text-lg mb-2">Standort</h2>
        </div>

        <h1 className="text-white text-3xl lg:text-4xl font-light leading-tight mb-8">
          Besuchen Sie uns vor Ort
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px] items-start">
          {/* Google Maps Embed */}
          <div className="h-[400px] bg-gray-300 rounded-md overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src="https://maps.google.com/maps?width=520&amp;height=400&amp;hl=en&amp;q=Kirchhellener%20Str.%2042,%2046236%20Bottrop%20+(Steuerberatung%20am%20Rathaus%20Steuerberatungs%20mbH)&amp;t=&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
              allowFullScreen
            ></iframe>
          </div>

          <div>
            <h3 className="text-2xl font-light leading-tight mb-2 text-[#E3DAC9]">
              {businessName}
            </h3>
            <p className="text-2xl font-light leading-tight mb-4 text-[#E3DAC9]">
              {businessSubtitle}
            </p>
            <p className="text-[#E4E4E4] mb-6">{address}</p>

           <RouteButton 
           href="https://www.google.com/maps/dir//Kirchhellener+Stra%C3%9Fe+42,+Bottrop/@51.5254875,6.8818987,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x47b8ebd392debfa7:0xfcfad4d893019c86!2m2!1d6.9230981!2d51.5254413?entry=ttu&g_ep=EgoyMDI1MDQxMy4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D"
          className="w-full max-w-[300px]" />
          </div>
        </div>
      </div>
    </section>
  );
}