import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqSections = [
  {
    category: "For Users",
    faqs: [
      {
        question: "What is NearBux?",
        answer: "NearBux is a platform to discover local shops, explore promotions, and place online orders from nearby stores. to get reward coins"
      },
      {
        question: "How do I place an order?",
        answer: "Just click 'Shop Now', browse products from your selected shop, and place your order securely through the platform."
      },
      {
        question: "Are there any charges for using NearBux?",
        answer: "No, NearBux is completely free to use for customers."
      },
      {
        question: "What are NearBux Coins?",
        answer: "NearBux Coins are loyalty points you earn when you shop. You can use them across different stores on the platform."
      }
    ]
  },
  {
    category: "For Business Owners",
    faqs: [
      {
        question: "How can my business join NearBux?",
        answer: "You can join NearBux by registering your business on our platform. It's quick and easy!"
      },
      {
        question: "What is the cost structure for businesses?",
        answer: "NearBux is free and just has a small promotion charge."
      },
      {
        question: "How long does the onboarding process take?",
        answer: "Basic integration takes just the time you take to register."
      },
      {
        question: "How does the coins system benefit my business?",
        answer: "The coins system increases customer retention and drives traffic by allowing customers to redeem coins earned elsewhere at your shop."
      },
      {
        question: "What business insights and analytics does NearBux provide?",
        answer: "You get real-time data on customer behavior, top-selling products, peak hours, and retention to help grow your business."
      },
      {
        question: "Can I customize offers and promotions for my customers?",
        answer: "Yes! You can create targeted offers, seasonal campaigns, and time-limited discounts tailored to your audience."
      },
      {
        question: "What technical support is available during and after onboarding?",
        answer: "We provide complete onboarding help and ongoing support for integration, troubleshooting, and platform usage."
      },
      {
        question: "How secure are the payment transactions on NearBux?",
        answer: "All transactions are encrypted and follow industry-grade security and privacy standards."
      }
    ]
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let faqCounter = 0;

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-8 md:px-16">
      <h2 className="text-4xl font-extrabold text-blue-600 text-center mb-12">Frequently Asked Questions</h2>
      <div className="max-w-5xl mx-auto space-y-16">
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-2xl font-semibold text-blue-700 mb-6 border-b border-blue-200 pb-2">
              {section.category}
            </h3>
            <div className="space-y-4">
              {section.faqs.map((faq, index) => {
                const globalIndex = faqCounter++;
                return (
                  <div
                    key={globalIndex}
                    className="bg-blue-50 border border-blue-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(globalIndex)}
                      className="w-full p-5 flex justify-between items-center text-left text-blue-900 font-medium text-lg focus:outline-none"
                    >
                      {faq.question}
                      {openIndex === globalIndex ? (
                        <ChevronUp className="text-blue-600" />
                      ) : (
                        <ChevronDown className="text-blue-600" />
                      )}
                    </button>
                    {openIndex === globalIndex && (
                      <div className="px-5 pb-5 text-blue-800 border-t border-blue-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
