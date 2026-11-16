import React from 'react';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Clock } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface FooterProps {
  settings: RestaurantSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center text-lg">
                BD
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Basaveshwara Dabha
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {settings?.description ||
                'Traditional North and South Indian vegetarian delicacies crafted with pure ingredients, authentic recipes and authentic desi ghee.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-950/60 border border-green-800/80 text-green-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% Certified Pure Vegetarian
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>South Indian Tiffins</li>
              <li>North Indian Curries</li>
              <li>Royal Veg Thalis</li>
              <li>Dum Veg Biriyani</li>
              <li>Traditional Bisi Bele Bath</li>
              <li>Fresh Beverages & Sweets</li>
            </ul>
          </div>

          {/* Hours & Service */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Hours & Delivery</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>Daily: {settings?.opening_time || '08:00 AM'} - {settings?.closing_time || '11:00 PM'}</span>
              </li>
              <li>Delivery: Restaurant-managed lightning dispatch</li>
              <li>Pickup: Available at counter</li>
              <li>Min. Order: ₹{settings?.min_order_value || 99}</li>
              <li>Free Delivery over: ₹{settings?.free_delivery_threshold || 499}</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Basaveshwara Circle, Bengaluru, Karnataka'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${settings?.phone}`} className="hover:text-white transition">
                  {settings?.phone || '+91 98765 43210'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{settings?.email || 'contact@basaveshwaradabha.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Basaveshwara Dabha. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for delicious vegetarian dining.
          </p>
        </div>
      </div>
    </footer>
  );
};
