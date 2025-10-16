import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import logoImage from 'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png';

export function ContactUs() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <img src={logoImage} alt="রুপান্তর" className="h-24 w-auto mx-auto mb-8 drop-shadow-lg rounded-3xl" />
          <h1 className="text-4xl mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Get in touch with রুপান্তর and join the climate action movement</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-slate-200/60 mb-8">
              <h2 className="text-3xl mb-8 text-slate-900">Get In Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="text-slate-900 text-lg">contact@rupantor.org</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm text-slate-500 mb-1">Phone</p>
                    <p className="text-slate-900 text-lg">+880 1234-567890</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm text-slate-500 mb-1">Address</p>
                    <p className="text-slate-900 text-lg">Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-10 shadow-lg border border-emerald-100">
              <h3 className="text-2xl mb-6 text-slate-900">Follow Us</h3>
              <div className="flex gap-5">
                <a href="#" className="group w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Facebook className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="group w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Instagram className="w-7 h-7 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a href="#" className="group w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Twitter className="w-7 h-7 text-sky-600 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-slate-200/60">
            <h2 className="text-3xl mb-8 text-slate-900">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-3 text-slate-700 font-medium">Name</label>
                <Input type="text" placeholder="Your name" required className="rounded-xl border-slate-200 focus:border-emerald-300 py-6" />
              </div>
              <div>
                <label className="block text-sm mb-3 text-slate-700 font-medium">Email</label>
                <Input type="email" placeholder="your@email.com" required className="rounded-xl border-slate-200 focus:border-emerald-300 py-6" />
              </div>
              <div>
                <label className="block text-sm mb-3 text-slate-700 font-medium">Message</label>
                <Textarea placeholder="Tell us how we can help..." rows={6} required className="rounded-xl border-slate-200 focus:border-emerald-300" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
