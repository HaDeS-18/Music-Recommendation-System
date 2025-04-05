import React from "react";
import { motion } from "framer-motion";
import { Disc3} from "lucide-react";
import { TypeWriter } from "./TypeWriter";
import { TypeAnimation } from "react-type-animation";

export function WelcomeHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotate: 180 }}
        className="relative"
      >
        <Disc3 className="h-24 w-24 mx-auto mb-6 text-green-500" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <TypeAnimation
        sequence={[
          "Welcome to Beatwise",
          1000,
          "Discover New Music",
          1000,
          "Find Your Next Favorite",
          1000,
          "Welcome to Beatwise",
        ]}
        wrapper="h1"
        speed={50}
        className="text-5xl font-grotesk font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-transparent bg-clip-text tracking-tight"
        repeat={Infinity}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-inter text-gray-400"
      >
        <TypeWriter
          text="Discover your next favorite song through the power of AI"
          speed={30}
        />
      </motion.p>
    </motion.div>
  );
}
