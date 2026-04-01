import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, FileText, BrainCircuit, LineChart, Menu, X } from 'lucide-react';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { restoreSession } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await api.get('/health');
        
        const token = localStorage.getItem('r2i_token');
        if (token) {
          try {
            await restoreSession();
            navigate('/home');
          } catch (e) {
            localStorage.removeItem('r2i_token');
          }
        }
      } catch (e) {
        // App can still render landing, login attempts will show error
      }
    };

    initApp();
  }, [navigate, restoreSession]);

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="R2I Logo" className="h-10 w-auto object-contain flex-shrink-0" />
            <span className="font-syne font-bold text-xl tracking-tight text-foreground">
              Resume2<span className="text-primary">Interview</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          <button 
            className="md:hidden text-foreground" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border p-6 flex flex-col gap-4 shadow-xl">
            <Link 
              to="/login" 
              className="w-full text-center text-base font-semibold text-muted-foreground p-3 hover:bg-surface-2 rounded-lg"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="w-full text-center text-base font-semibold bg-primary text-primary-foreground p-3 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden border-b border-border">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Col: Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start z-10"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 text-sm font-semibold rounded-full mb-8 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                AI-Powered Interview Prep
              </div>
              
              <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4rem] font-bold text-foreground tracking-tight leading-[1.1] mb-6 shadow-sm">
                Ace your next technical interview.
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                Upload your resume, practice with tailored AI-generated questions, and get instant, actionable feedback to land your dream job.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all group"
                >
                  Start Practicing Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-sm font-medium text-muted-foreground">
                  No credit card required
                </span>
              </div>
            </motion.div>

            {/* Right Col: Dashboard Graphic */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 w-full"
            >
              {/* Decorative background blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 rounded-full blur-3xl -z-10 opacity-70"></div>
              
              {/* CSS Mockup Container */}
              <div className="bg-surface rounded-2xl shadow-2xl border border-border p-2 sm:p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-background rounded-xl overflow-hidden border border-border/50">
                  
                  {/* Mockup Header */}
                  <div className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-2 border border-border"></div>
                    <div className="w-32 h-4 rounded-full bg-surface-2 border border-border"></div>
                    <div className="ml-auto w-20 h-8 rounded-lg bg-primary/20"></div>
                  </div>
                  
                  {/* Mockup Body Grid */}
                  <div className="p-6 grid gap-6">
                    {/* Top Row Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Card 1 */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                        className="bg-surface rounded-xl p-5 border border-border shadow-sm flex flex-col gap-4"
                      >
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                        >
                           <FileText className="w-5 h-5 text-primary" />
                        </motion.div>
                        <div className="w-24 h-3 rounded-full bg-surface-2"></div>
                        <motion.div 
                          animate={{ width: ["40%", "100%"] }} 
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="h-2 rounded-full bg-surface-3 mt-auto"
                        ></motion.div>
                      </motion.div>

                      {/* Card 2 */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                        className="bg-surface rounded-xl p-5 border border-border shadow-sm flex flex-col gap-4"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"
                        >
                           <Sparkles className="w-5 h-5 text-emerald-500" />
                        </motion.div>
                        <div className="w-24 h-3 rounded-full bg-surface-2"></div>
                        <motion.div 
                          animate={{ width: ["60%", "100%"] }} 
                          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                          className="h-2 rounded-full bg-surface-3 mt-auto"
                        ></motion.div>
                      </motion.div>
                    </div>
                    
                    {/* Bottom Row Chart */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="bg-surface rounded-xl p-5 border border-border shadow-sm"
                    >
                      <div className="w-32 h-3 rounded-full bg-surface-2 mb-6"></div>
                      <div className="h-32 flex items-end justify-between px-2 gap-2">
                        {[40, 60, 30, 80, 50, 70].map((height, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: "0%" }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: 1 + (i * 0.1), type: "spring" }}
                            className="w-full rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors"
                          ></motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface/50">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-start mb-16 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Built for modern job seekers
              </h2>
              <p className="text-lg text-muted-foreground">
                Our platform analyzes your unique background to provide the most relevant interview practice possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart Resume Parsing</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We extract your key skills and experiences to generate targeted questions that interviewers will actually ask.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">AI Mock Interviews</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Practice in a realistic environment with dynamic questions that adapt to your answers in real-time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  <LineChart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Actionable Feedback</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Get detailed scoring and suggestions for improvement on every answer to continuously refine your pitch.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Splash;
