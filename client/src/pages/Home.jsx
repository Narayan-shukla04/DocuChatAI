import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, MessageSquare, Zap, Shield } from "lucide-react";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: <UploadCloud className="w-6 h-6 text-primary" />,
    title: "Universal Upload",
    description:
      "Support for PDF, DOCX, TXT, Excel, and PPTX files. Just drag and drop.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-secondary" />,
    title: "Smart Chat",
    description:
      "Context-aware AI that answers questions based precisely on your documents.",
  },
  {
    icon: <Zap className="w-6 h-6 text-accent" />,
    title: "Lightning Fast",
    description:
      "Powered by advanced RAG pipelines and vector databases for instant retrieval.",
  },
  {
    icon: <Shield className="w-6 h-6 text-green-400" />,
    title: "Secure & Private",
    description: "Your documents are encrypted and only accessible by you.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-text-main selection:bg-primary selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Chat with your <br />
            <span className="neon-text">Documents Instantly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-text-muted mx-auto mb-10"
          >
            Upload any PDF, Excel, Word, or PowerPoint file and get instant
            answers, summaries, and insights using advanced AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transform hover:-translate-y-1"
            >
              Start for free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 glass-card hover:bg-dark-border text-text-main rounded-xl font-semibold text-lg transition-all"
            >
              View Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              Powerful features designed to help you extract knowledge from your
              files effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-dark-bg rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
