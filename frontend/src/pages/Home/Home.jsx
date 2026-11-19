import { Link } from "react-router-dom";
import heroImage from "../../assets/hero.png";
import "./Home.css";

const steps = [
  {
    number: "01",
    title: "Pick Your Favorites",
    description:
      "Search for songs you love and save them to your MusicVault.",
  },
  {
    number: "02",
    title: "Discover New Music",
    description:
      "Get personalized recommendations based on your favorite tracks.",
  },
  {
    number: "03",
    title: "Rediscover Your Sound",
    description:
      "Explore recommendations and find songs worth listening to again.",
  },
];

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-content">
          <p className="home-eyebrow">WELCOME TO MUSICVAULT</p>

          <h1 id="home-title">
            Rediscover the songs you forgot you loved.
          </h1>

          <p className="home-hero-description">
            Your next favorite song might remind you of an old one.
            Save the music you love and discover personalized
            recommendations that match your taste.
          </p>

          <Link to="/songs" className="home-cta">
            Start Picking Songs
          </Link>
        </div>

        <div className="home-hero-image">
          <img
            src={heroImage}
            alt="MusicVault music discovery illustration"
            width="343"
            height="361"
          />
        </div>
      </section>

      <section
        className="home-how-it-works"
        aria-labelledby="home-how-title"
      >
        <div className="home-section-heading">
          <p className="home-eyebrow">THE MUSICVAULT EXPERIENCE</p>
          <h2 id="home-how-title">How It Works</h2>
          <p>
            Three simple steps to start discovering music
            you'll love.
          </p>
        </div>

        <div className="home-steps">
          {steps.map((step) => (
            <article className="home-step" key={step.number}>
              <span className="home-step-number" aria-hidden="true">
                {step.number}
              </span>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
