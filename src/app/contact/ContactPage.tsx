import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { FaCode, FaGraduationCap, FaComments, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

type FormType = 'Freelance' | 'Tutoring' | 'Other';

const ContactPage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formType, setFormType] = useState<FormType>('Freelance');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [messageError, setMessageError] = useState<string>('');

  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3 }
    }));
  }, [controls]);

  const handleContactClick = (type: FormType) => {
    setShowForm(true);
    setFormType(type);
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateMessage = (message: string): boolean => {
    const wordCount = message.trim().split(/\s+/).length;
    return wordCount >= 5 && wordCount <= 1000;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const BackToMainButton: React.FC = () => (
    <Link href="/" className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300">
      <FaArrowLeft size={24} /> <span className="text-white font-medium">Back to Main</span>
    </Link>
  );

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setMessageError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateEmail(email) && validateMessage(message)) {
      const formData = new FormData();
      formData.append('entry.1051105728', formType);
      formData.append('entry.1903401428', email);
      formData.append('entry.298427919', message);

      try {
        const response = await fetch(
          'https://docs.google.com/forms/d/e/1FAIpQLSeG52V9U9XEixlAS_kyJAhZ7iSVVko_Kwn9D8NtL6zr35LY8w/formResponse',
          {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
          }
        );

        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    } else {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      }
      if (!validateMessage(message)) {
        setMessageError('There was an error with your message. Please try again.');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setEmail('');
    setMessage('');
    setEmailError('');
    setMessageError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <BackToMainButton />
      <div className="h-screen flex flex-col items-center justify-center relative">
        <motion.h1 
          className="text-6xl font-bold mb-8 text-purple-400"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
        >
          CONTACT
        </motion.h1>
        <motion.div
          className="text-2xl text-purple-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Scroll...
          </motion.span>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          <motion.div
            custom={0}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className="flex flex-col md:flex-row items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-7xl mr-6 text-blue-400 flex-shrink-0"
            >
              <FaCode />
            </motion.div>
            <div className="flex-grow md:ml-6">
              <h2 className="text-2xl font-semibold mb-2 text-blue-300">Freelance</h2>
              <p className="text-gray-400 mb-4">I do programming, copywriting, and everything in between. You can check out my Upwork, if you're more comfortable with that, or contact me directly!</p>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <Link href="https://www.upwork.com/freelancers/~0101d2191d7f64c09f" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center mb-2 sm:mb-0 sm:mr-4 pr-10">
                  View my Upwork profile
                  <FaExternalLinkAlt className="ml-2 text-sm" />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContactClick('Freelance')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Get in touch for work
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className="flex flex-col md:flex-row-reverse items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-7xl ml-6 text-green-400 flex-shrink-0"
            >
              <FaGraduationCap />
            </motion.div>
            <div className="flex-grow md:mr-6 text-right">
              <h2 className="text-2xl font-semibold mb-2 text-green-300">Tutoring</h2>
              <p className="text-gray-400 mb-4">I'm a tutor too! You can find me on SuperProf or connect directly! I teach all maths, applied maths, physics, computer science, and Spanish, with a particular emphasis on the Leaving Certificate.</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
                <Link href="https://www.superprof.ie/engineering-student-with-625-leaving-cert-points-teaches-maths-physics-applied-maths.html" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors inline-flex items-center justify-end mb-2 sm:mb-0 sm:ml-4 pr-10">
                  View my SuperProf profile
                  <FaExternalLinkAlt className="ml-2 text-sm" />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContactClick('Tutoring')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Contact for tutoring
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            custom={2}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className="flex flex-col md:flex-row items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-7xl mr-6 text-purple-400 flex-shrink-0"
            >
              <FaComments />
            </motion.div>
            <div className="flex-grow md:ml-6">
              <h2 className="text-2xl font-semibold mb-2 text-purple-300">Anything else?</h2>
              <p className="text-gray-400 mb-4">Why wouldn't you want to chat to me? If your reasons for contacting me don't fit in one of the previous reasons, drop me a line and I'll get back to you as soon as I can...or whenever it is I remember my email password...</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleContactClick('Other')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Message
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-8 max-w-md w-full"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">Contact Form - {formType}</h2>
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <input type="hidden" name="entry.1051105728" value={formType} />
                  <div className="mb-4">
                    <label htmlFor="entry.1903401428" className="block text-gray-300 mb-2">Email</label>
                    <input 
                      type="email" 
                      id="entry.1903401428" 
                      name="entry.1903401428" 
                      value={email}
                      onChange={handleEmailChange}
                      required 
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded" 
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  </div>
                  <div className="mb-4">
                    <label htmlFor="entry.298427919" className="block text-gray-300 mb-2">Message</label>
                    <textarea 
                      id="entry.298427919" 
                      name="entry.298427919" 
                      value={message}
                      onChange={handleMessageChange}
                      required 
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded" 
                      rows={4}
                    ></textarea>
                    {messageError && <p className="text-red-500 text-sm mt-1">{messageError}</p>}
                  </div>
                  <div className="flex justify-between">
                    <button 
                      type="submit" 
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center text-green-400">
                  <p>Your message has been transmitted across the cosmos!</p>
                  <button
                    onClick={handleCloseForm}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactPage;