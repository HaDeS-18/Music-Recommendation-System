'use client';

import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Smart Recommendations",
    description: "Powered by advanced AI to find music that matches your taste",
    delay: 0.2,
  },
  {
    title: "Personalized Experience",
    description: "Create an account to save your favorites and get better suggestions",
    delay: 0.4,
  },
  {
    title: "Vast Library",
    description: "Access millions of songs across all genres and decades",
    delay: 0.6,
  },
];

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: feature.delay }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-colors"
        >
          <h3 className="text-lg font-grotesk font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
            {feature.title}
          </h3>
          <p className="text-gray-400 font-inter">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
