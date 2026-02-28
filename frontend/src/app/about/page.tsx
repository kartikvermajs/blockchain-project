"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  img: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Aryan Thakur",
    role: "Team Lead",
    img: "/img1.jpg",
  },
  {
    id: 2,
    name: "Kartik Verma",
    role: "Frontend Designer",
    img: "/img2.jpg",
  },
  {
    id: 3,
    name: "Saksham Kotiyal",
    role: "Backend Logic Designer",
    img: "/img3.jpg",
  },
  {
    id: 4,
    name: "Lokesh Singh Danu",
    role: "Backend Logic Designer",
    img: "/img4.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden px-4 text-white">
      <StarsBackground className="absolute inset-0 opacity-40" />
      <ShootingStars className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        className="team text-center max-w-6xl w-full z-10"
      >
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="text-4xl sm:text-5xl font-bold leading-tight mb-6 sm:mb-8 text-glow"
        >
          Meet Our Team
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="my-4 text-base sm:text-lg md:text-xl lg:text-2xl w-11/12 sm:w-3/4 lg:max-w-5xl mx-auto text-gray-300"
        >
          We are a team of innovators, dedicated to turning ideas into reality
          with passion and precision.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, staggerDirection: 1 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 px-4 container mx-auto"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{
                duration: 0.9,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="bg-gradient-to-br from-indigo-800/30 to-purple-800/20 border border-white/10 backdrop-blur-md text-white text-center rounded-2xl shadow-lg hover:shadow-2xl transform transition-all hover:scale-105 w-full min-h-[350px] p-6"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Image
                  src={member.img}
                  alt={member.name}
                  width={144}
                  height={144}
                  className="mx-auto -mb-6 rounded-full object-cover border-4 border-white/20 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
                />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-semibold mt-6 text-glow">
                {member.name}
              </h2>
              <p className="text-sm sm:text-base text-purple-300 uppercase mt-1">
                {member.role}
              </p>

              <motion.div className="flex justify-center gap-5 mt-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  <Image
                    src="/linkedin.png"
                    alt="LinkedIn"
                    width={28}
                    height={28}
                    className="cursor-pointer"
                  />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.3, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  <Image
                    src="/instagram.png"
                    alt="Instagram"
                    width={28}
                    height={28}
                    className="cursor-pointer"
                  />
                </motion.a>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
