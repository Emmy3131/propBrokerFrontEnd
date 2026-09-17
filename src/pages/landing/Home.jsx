import Hero from "./Hero.jsx";
import ValueBar from "./ValuBar.jsx";
import BrokerProp from "./BrokerProp.jsx";
import Markets from "./Market.jsx";
import Platform from "./PlatForm.jsx";
import Challenges from "./Challenges.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Security from "./Security.jsx";
import FAQ from "./FAQ.jsx";
import FinalCTA from "./CTA.jsx";

const Home = () => {
  return (
    <div className="site-bg min-h-screen overflow-hidden">
    

      <main>
        <Hero />

        <ValueBar />

        <BrokerProp />

        <Markets />

        <Platform />

        <Challenges />

        <HowItWorks />

        <Security />

        <FAQ />

        <FinalCTA />
      </main>

    </div>
  );
};

export default Home;