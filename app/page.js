import AboutUsSection from "./components/about";
import Header from "./components/header";
import Landingpage from "./components/landingpage";
import Leistungen from "./components/leistungen";
import LocationSection from "./components/standort";
import AppointmentBooking from "./components/terminbuchung";
import ContactForm from "./components/contact";
import Footer from "./components/footer";


export default function Home() {
  return (
    <div className="bg-[#747171]">
      <Header />
      <div id="start">
      <Landingpage />
      </div>
      <div id="leistungen" className="pt-[50px] scroll-m-[80px]">
        
      <Leistungen />
      </div>
 <div id="terminbuchung" className="mt-[80px] scroll-m-[170px]">
      <AppointmentBooking />
    </div>
    <div id="ueber-uns" className="mt-[150px] scroll-m-[170px]">
      <AboutUsSection />
    </div>
    <div id="standort" className="mt-[150px] scroll-m-[170px]">
      <LocationSection  />
    </div>
    <div id="kontakt" className="mt-[150px] scroll-m-[170px]">
      <ContactForm />
    </div>
    <Footer />
    </div>
  );
}
