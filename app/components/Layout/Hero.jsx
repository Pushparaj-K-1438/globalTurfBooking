import { Calendar, MapPin, Star, ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative min-h-[90vh] pt-28 pb-16 overflow-hidden bg-emerald-950">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/hero-turf.jpg')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-teal-800/70"></div>
            </div>

            {/* Floating elements for visual appeal */}
            <div className="absolute top-24 left-10 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-48 right-16 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-40 left-20 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    {/* Main headline */}
                    <div className="animate-in slide-in-from-bottom-5 duration-700">
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-100 text-sm font-semibold mb-6 border border-emerald-500/30">
                            #1 Sports Booking Platform
                        </span>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                            Book Your Perfect
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
                                Turf Experience
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Premium quality turfs for cricket and football available. Easy booking, instant confirmation, and an amazing playing experience.
                        </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="animate-in slide-in-from-bottom-5 duration-700 delay-200 flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <a
                            href="#booking"
                            className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-lg px-8 py-4 flex items-center rounded-full font-semibold group"
                        >
                            <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                            Book Now
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="https://maps.app.goo.gl/xcZ8stYt9gxCcVif7"
                            target="_blank"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all hover:scale-105 active:scale-95 text-lg px-8 py-4 flex items-center rounded-full font-semibold"
                        >
                            <MapPin className="mr-2 h-5 w-5" />
                            Locate Turf
                        </a>
                    </div>
                </div>

                {/* Feature divs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <div className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/15 transition-colors group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                                <Calendar className="h-6 w-6 text-emerald-300" />
                            </div>
                            <h3 className="text-xl font-bold ml-4 text-white">Easy Booking</h3>
                        </div>
                        <p className="text-emerald-100/70 leading-relaxed">
                            Book your turf in just a few taps. Select time, duration, and confirm instantly with zero hassle.
                        </p>
                    </div>

                    <div className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/15 transition-colors group">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors">
                                <Star className="h-6 w-6 text-amber-300" />
                            </div>
                            <h3 className="text-xl font-bold ml-4 text-white">Premium Quality</h3>
                        </div>
                        <p className="text-emerald-100/70 leading-relaxed">
                            High-quality synthetic grass and proper maintenance for the best playing experience.
                        </p>
                    </div>

                    <div className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/15 transition-colors group sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-teal-500/20 rounded-xl group-hover:bg-teal-500/30 transition-colors">
                                <MapPin className="h-6 w-6 text-teal-300" />
                            </div>
                            <h3 className="text-xl font-bold ml-4 text-white">Great Location</h3>
                        </div>
                        <p className="text-emerald-100/70 leading-relaxed">
                            Conveniently located with easy access and dedicated parking facilities available.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;