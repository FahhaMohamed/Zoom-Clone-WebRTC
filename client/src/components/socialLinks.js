import {
    FaWhatsapp,
    FaEnvelope,
    FaInstagram,
    FaLinkedin,
    FaGithub,
  } from "react-icons/fa";
  
  export default function SocialLinks() {
    const linkClasses = "text-gray-400 hover:text-blue-400";
    const iconClasses = "h-6 w-6";
  
    return (
      <div className="flex space-x-4 mt-4 md:mt-0">
        {/* WhatsApp */}
        <a
          href="https://wa.me/1234567890"
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">WhatsApp</span>
          <FaWhatsapp className={iconClasses} aria-hidden="true" />
        </a>
  
        {/* Email */}
        <a href="mailto:youremail@example.com" className={linkClasses}>
          <span className="sr-only">Email</span>
          <FaEnvelope className={iconClasses} aria-hidden="true" />
        </a>
  
        {/* Instagram */}
        <a
          href="https://instagram.com/yourprofile"
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">Instagram</span>
          <FaInstagram className={iconClasses} aria-hidden="true" />
        </a>
  
        {/* LinkedIn */}
        <a
          href="https://linkedin.com/in/yourprofile"
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">LinkedIn</span>
          <FaLinkedin className={iconClasses} aria-hidden="true" />
        </a>
  
        {/* GitHub */}
        <a
          href="https://github.com/yourusername"
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">GitHub</span>
          <FaGithub className={iconClasses} aria-hidden="true" />
        </a>
      </div>
    );
  }
  