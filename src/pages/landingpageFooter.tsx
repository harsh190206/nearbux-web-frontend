import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail  } from 'lucide-react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Logo size={36} />
              <span className="ml-2 text-xl font-bold text-white">NearBux</span>
            </div>
            <p className="mb-4">
              Transforming Indian local shops into digital businesses while rewarding customers for every purchase.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/16Q3RwRTq1/" className="text-gray-400 hover:text-accent-400 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/NearBux?t=NRObGJiUBhr-iRp6MOna2g&s=09" className="text-gray-400 hover:text-accent-400 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/nearbux?igsh=MXdpcXZtcnZ4M2VoaA==" className="text-gray-400 hover:text-accent-400 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/nearbux/" className="text-gray-400 hover:text-accent-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
             
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-accent-400 transition-colors">About Us</a></li>
              <li><a href="/feedback" className="hover:text-accent-400 transition-colors">Feedback</a></li>
            
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>    <a href="mailto:info@nearbux.com" className="inline-flex items-center hover:text-accent-400 transition-colors">
             
              Contact us 
            </a></li>
              <li><a href="/faq" className="hover:text-accent-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="hover:text-accent-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-accent-400 transition-colors">Terms of Service</a></li>
        
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 text-center md:flex md:justify-between md:items-center">
          <p>&copy; {currentYear} NearBux. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <a href="mailto:info@nearbux.com" className="inline-flex items-center hover:text-accent-400 transition-colors">
              <Mail size={16} className="mr-2" />
              info@nearbux.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;