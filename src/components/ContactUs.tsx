// src/components/ContactUs.tsx
import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const ContactUs = () => {
  const team = [
    {
      name: 'ABHIJITH M NAIR',
      role: ' DEVELOPER',
      github: 'lifeofabzz',
      githubUrl: 'https://github.com/lifeofabzZ',
      linkedin: 'Abhijith M Nair',
      linkedinUrl: 'www.linkedin.com/in/abhijith-m-nair10'
    },
    {
      name: 'ABHAYDEV P',
      role: ' DEVELOPER ',
      github: 'Abhaydev P',
      githubUrl: 'https://github.com/AbhayadevP/',
      linkedin: 'Abhaydev P',
      linkedinUrl: 'https://www.linkedin.com/in/abhayadev-p-a85907259/'
    },
    {
      name: 'SACHIN SAJUKUMAR',
      role: ' DEVELOPER',
      github: 'SACHIN SAJUKUMAR',
      githubUrl: 'https://github.com/Sachin-0429',
      linkedin: 'SACHIN SAJUKUMAR',
      linkedinUrl: 'www.linkedin.com/in/sachin-sajukumar'
    },
    {
      name: 'SANJAY SAJUKUMAR',
      role: 'DEVELOPER',
      github: 'SANJAY SAJUKUMAR',
      githubUrl: 'https://github.com/Sanjay-0429',
      linkedin: 'SANJAY SAJUKUMAR',
      linkedinUrl: 'www.linkedin.com/in/sanjay-sajukumar'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            Meet Our Team
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our dedicated team of developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.github}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="h-6 w-6" />
                  </a>
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;