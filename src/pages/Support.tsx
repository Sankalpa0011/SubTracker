import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, FileQuestion } from 'lucide-react';

const Support = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Live Chat</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Chat with our support team in real-time for immediate assistance.
          </p>
          <button className="btn btn-primary w-full">Start Chat</button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Email Support</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Send us an email and we'll get back to you within 24 hours.
          </p>
          <button className="btn btn-primary w-full">Send Email</button>
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: "How do I add a new subscription?",
              answer: "Click the 'Add Subscription' button on the dashboard or subscriptions page and fill in the required details."
            },
            {
              question: "Can I connect multiple email accounts?",
              answer: "Yes, you can connect multiple email accounts to track subscriptions across different addresses."
            },
            {
              question: "How do I change notification settings?",
              answer: "Go to Settings > Notifications to customize your notification preferences."
            }
          ].map((faq, index) => (
            <details
              key={index}
              className="group bg-gray-50 rounded-lg"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <FileQuestion className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Phone className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Business Hours</h3>
            <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
            <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
            <p className="text-gray-600">Sunday: Closed</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Contact Details</h3>
            <p className="text-gray-600">Email: support@subtracker.com</p>
            <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
            <p className="text-gray-600">Address: 123 Subscription St, Tech City</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Support;