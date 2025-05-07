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

  const phone = "+94785250119";
  const message = encodeURIComponent(
    "Hi, I'm reaching out from the VideoConnect website"
  );

  const mail = "fahhamohmad17@gmail.com";
  const mailto = `mailto:${mail}?subject=Inquiry%20from%20VideoConnect%20Website`;

  const linkdIn = "https://linkedin.com/in/mohamedfahham";
  const instagram = "https://instagram.com/mhmd_fahham_";
  const github = "https://github.com/FahhaMohamed";

  return (
    <div className="flex space-x-4 mt-4 md:mt-0">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${phone}?text=${message}`}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sr-only">WhatsApp</span>
        <FaWhatsapp className={iconClasses} aria-hidden="true" />
      </a>

      {/* Email */}
      <a href={mailto} className={linkClasses}>
        <span className="sr-only">Email</span>
        <FaEnvelope className={iconClasses} aria-hidden="true" />
      </a>

      {/* Instagram */}
      <a
        href={instagram}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sr-only">Instagram</span>
        <FaInstagram className={iconClasses} aria-hidden="true" />
      </a>

      {/* LinkedIn */}
      <a
        href={linkdIn}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sr-only">LinkedIn</span>
        <FaLinkedin className={iconClasses} aria-hidden="true" />
      </a>

      {/* GitHub */}
      <a
        href={github}
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
