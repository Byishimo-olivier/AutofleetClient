import React from "react";
import { Link } from "react-router-dom";
import { Car, ShieldCheck, MapPin, CalendarCheck, ArrowRight, Star } from "lucide-react";
import { useSettings } from "@/contexts/SettingContxt";

export default function LandingPage() {
    const { settings } = useSettings();
    const isDark = settings?.darkMode;

    // Neumorphism colors
    // Light: bg-[#e0e5ec] shadows: #a3b1c6, #ffffff
    // Dark: bg-[#1e1e24] shadows: #141418, #282830

    const bgClass = isDark ? "bg-[#21232c] text-gray-200" : "bg-[#e0e5ec] text-gray-700";

    // Core Neumorphic classes
    const neuCardFlat = isDark
        ? "bg-[#21232c] shadow-[8px_8px_16px_#14151a,-8px_-8px_16px_#2e313e]"
        : "bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]";

    const neuCardInset = isDark
        ? "bg-[#21232c] shadow-[inset_8px_8px_16px_#14151a,inset_-8px_-8px_16px_#2e313e]"
        : "bg-[#e0e5ec] shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]";

    const neuButton = `
        relative px-8 py-4 rounded-2xl font-bold transition-all duration-200 ease-in-out
        ${isDark ? 'text-blue-400' : 'text-blue-600'}
        ${neuCardFlat}
        hover:shadow-[inset_4px_4px_8px_#14151a,inset_-4px_-4px_8px_#2e313e] /* hover inset fallback */
        active:shadow-[inset_6px_6px_10px_#14151a,inset_-6px_-6px_10px_#2e313e] /* real active */
    `.trim();

    return (
        <div className={`min-h-screen font-sans ${bgClass}`}>

            {/* Neumorphic Header */}
            <header className={`fixed top-0 inset-x-0 z-50 h-24 flex items-center ${bgClass}`}>
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">

                    {/* Brand */}
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-full ${neuCardFlat}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${neuCardInset}`}>
                            <Car className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                            AutoFleet
                        </span>
                    </div>

                    {/* Nav Links - Pill Buttons */}
                    <nav className="hidden md:flex items-center gap-6 font-medium">
                        <a href="#how-it-works" className={`px-5 py-2.5 rounded-full transition-all ${neuCardFlat} hover:${neuCardInset} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>How it works</a>
                        <a href="#benefits" className={`px-5 py-2.5 rounded-full transition-all ${neuCardFlat} hover:${neuCardInset} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Benefits</a>
                        <a href="#fleet" className={`px-5 py-2.5 rounded-full transition-all ${neuCardFlat} hover:${neuCardInset} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Our Fleet</a>
                    </nav>

                    {/* Auth & CTA */}
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="font-semibold px-4">
                            Sign In
                        </Link>
                        <Link to="/home" className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 ${neuCardFlat} active:${neuCardInset} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Explore Fleet
                        </Link>
                    </div>
                </div>
            </header>

            {/* Metamorphism Hero Section */}
            <main className="pt-40 lg:pt-48 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Hero Content */}
                        <div className="flex flex-col gap-10">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full w-fit ${neuCardInset}`}>
                                <span className={`text-sm font-bold tracking-widest uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                    Premium Vehicle Rentals
                                </span>
                            </div>

                            <h1 className={`text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                Rent Your <br />
                                Next Vehicle <br />
                                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>With Ease.</span>
                            </h1>

                            <p className="text-xl max-w-lg leading-relaxed font-medium">
                                AutoFleet offers a smooth, tactile experience for acquiring the perfect vehicle. Wide selection, transparent pricing, and instant booking.
                            </p>

                            <div className="flex items-center gap-6 pt-4">
                                <Link to="/home" className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg ${neuCardFlat} active:${neuCardInset} transition-all`}>
                                    <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Browse Fleet</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${neuCardInset}`}>
                                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Hero Image Container - Soft Framing */}
                        <div className={`p-6 rounded-[2.5rem] ${neuCardFlat} w-full aspect-square flex items-center justify-center`}>
                            <div className={`w-full h-full rounded-[2rem] overflow-hidden ${neuCardInset} p-4`}>
                                <img
                                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"
                                    alt="Premium SUV"
                                    className="w-full h-full object-cover rounded-xl opacity-90 sepia-[.2] hue-rotate-[-10deg]"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-extrabold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Simple, Soft Process</h2>
                        <p className="max-w-2xl mx-auto text-lg font-medium">
                            We have optimized the booking flow so you can secure your vehicle in just a few smooth tactile clicks.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <MapPin className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
                                title: "1. Select Location",
                                desc: "Choose your pickup and drop-off locations from our network."
                            },
                            {
                                icon: <Car className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
                                title: "2. Choose Vehicle",
                                desc: "Browse our diverse fleet and find the perfect car."
                            },
                            {
                                icon: <CalendarCheck className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
                                title: "3. Book & Drive",
                                desc: "Confirm dates, make a secure payment, and hit the road."
                            }
                        ].map((step, i) => (
                            <div key={i} className={`p-10 rounded-[2rem] ${neuCardFlat} flex flex-col items-center gap-6 text-center`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${neuCardInset}`}>
                                    {step.icon}
                                </div>
                                <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{step.title}</h3>
                                <p className="leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App-like CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className={`p-16 rounded-[3rem] ${neuCardInset} text-center flex flex-col items-center gap-8`}>
                        <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Ready to drive?</h2>
                        <p className="text-xl font-medium max-w-2xl">
                            Join thousands of satisfied customers and experience the most reliable soft-UI vehicle rental platform today.
                        </p>
                        <Link to="/home" className={`mt-4 px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-3 ${neuCardFlat} active:${neuCardInset} transition-all ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
