import ChatInterface from "./_components/landing/chat-interface";
import Contact from "./_components/landing/contact";
import DataVisualization from "./_components/landing/data-visualization";
import DatabaseConnection from "./_components/landing/database-connection";
import Features from "./_components/landing/features";
import Footer from "./_components/landing/footer";
import Hero from "./_components/landing/hero";
import Navbar from "./_components/landing/navbar";
import Pricing from "./_components/landing/pricing";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="connect">
        <DatabaseConnection />
      </section>
      <section id="chat">
        <ChatInterface />
      </section>
      <section id="visualize">
        <DataVisualization />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <section id="contact">
        <Contact/>
      </section>
      <Footer />
    </main>
  )
}

