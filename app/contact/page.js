"use client"
import React from 'react';
import { PhoneCall, MessagesSquare, MailOpen, MapPin } from "lucide-react";

const ContactCard = ({ icon, title, subtitle }) => {
  // Define the button action based on the card title
  const handleButtonClick = () => {
    if (title === "Email Us Now") {
      window.location.href = "mailto:sanjuraj.1438@gmail.com";
    } else if (title === "Locate Us") {
      window.location.href = "https://maps.app.goo.gl/xcZ8stYt9gxCcVif7";
    } else {
      window.location.href = "tel:7806995770";
    }
  };

  return (
    <div className="h-24 relative p-4 rounded-2xl border-2 text-sm font-medium flex items-center justify-center transition-all
                  bg-white text-[#16a249] border-[#E0F5E8] gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#E0F5E8] rounded-[12px] flex items-center justify-center p-">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 md:whitespace-nowrap">{subtitle}</p>
        </div>
      </div>
      <button
        className="px-4 py-2 flex whitespace-nowrap bg-[#16a249] text-white rounded-full hover:bg-[#16a249] cursor-pointer"
        onClick={handleButtonClick}
      >
        Contact Us
      </button>
    </div>
  );
};

const page = () => {
  return (
    <section className='relative min-h-screen pt-16 overflow-hidden text-black'>
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-hero">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-4 text-black">
              <h1 className="text-4xl md:text-4xl font-medium">Contact</h1>
              <p className="text-xl md:text-lg max-w-2xl mx-auto text-gray-400">
                Feel free to contact us. Submit your queries here and we will listen.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row flex-wrap justify-around gap-12 md:gap-20">
            <ContactCard
              icon={<MapPin />}
              title="Locate Us"
              subtitle="Find our location or get in touch with us."
            />
            <ContactCard
              icon={<PhoneCall />}
              title="Call Us Now"
              subtitle="Get Question ? We have got an answer."
            />
            <ContactCard
              icon={<MessagesSquare />}
              title="Chat with Us"
              subtitle="Get Question ? We have got an answer."
            />
            <ContactCard
              icon={<MailOpen />}
              title="Email Us Now"
              subtitle="Get Question ? We have got an answer."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;