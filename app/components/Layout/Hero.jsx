import { Calendar, MapPin, Star, ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative min-h-screen pt-16 overflow-hidden">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/hero-turf.jpg')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E7D32]/80 via-[#2E7D32]/60 to-[#FBC02D]/70"></div>
            </div>
            {/* Floating elements for visual appeal */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-[#FBC02D]/20 rounded-full animate-float"></div>
            <div className="absolute top-40 right-16 w-16 h-16 bg-[#2E7D32]/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-40 left-20 w-12 h-12 bg-[#FBC02D]/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    {/* Main headline */}
                    <div className="animate-fade-in-up">
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                            Book Your Perfect
                            <span className="block text-accent">Turf Experience</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
                        Premium quality turfs for cricket and football available. Easy booking, instant confirmation, and an amazing playing experience
                        </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="animate-bounce-in flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <a
                            href="#booking"
                            size="lg"
                            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow transition-bounce text-lg px-8 py-4 flex items-center rounded-lg"
                        >
                            <Calendar className="mr-2 h-5 w-5" />
                            Book Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                        <a
                            href="https://maps.app.goo.gl/xcZ8stYt9gxCcVif7"
                            target="_blank"
                            variant="outline"
                            size="lg"
                            className="border text-primary-foreground hover:bg-white/10 text-lg px-8 py-4 flex items-center rounded-lg"
                            style={{ borderColor: 'rgba(237, 237, 237, 0.3)' }}
                        >
                            <MapPin className="mr-2 h-5 w-5 cursor-pointer" />
                            Locate Turf
                        </a>
                    </div>
                </div>

                {/* Feature divs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    <div className="p-6 gradient-div border-0 shadow-medium transition-bounce hover:scale-105 bg-white rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-[hsl(142_76%_36%_/_0.1)] rounded-lg">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold ml-3 text-black">Easy Booking</h3>
                        </div>
                        <p className="text-muted-foreground text-[#23846D]">
                            Book your turf in just a few taps. Select time, duration, and confirm instantly.
                        </p>
                    </div>

                    <div className="p-6 gradient-div border-0 shadow-medium transition-bounce hover:scale-105 bg-white rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-[hsl(45_93%_47%_/_0.1)] rounded-lg">
                                <Star className="h-6 w-6 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold ml-3 text-black">Premium Quality</h3>
                        </div>
                        <p className="text-muted-foreground text-[#23846D]">
                            High-quality synthetic grass and proper maintenance for the best playing experience.
                        </p>
                    </div>

                    <div className="p-6 gradient-div border-0 shadow-medium transition-bounce hover:scale-105 bg-white rounded-lg sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-[hsl(142_76%_36%_/_0.1)] rounded-lg">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold ml-3 text-black">Great Location</h3>
                        </div>
                        <p className="text-muted-foreground text-[#23846D]">
                            Conveniently located with easy access and parking facilities available.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;