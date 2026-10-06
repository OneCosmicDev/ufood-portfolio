import React from "react";
import { Image } from "react-bootstrap";
import { getGravatarUrl } from "../utils/gravatar";

interface AvatarProps {
  email: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ email, name, size = 50, className = "" }) => {
  const gravatarUrl = getGravatarUrl(email, size);

  return (
    <Image
      src={gravatarUrl}
      alt={`${name}'s avatar`}
      roundedCircle
      width={size}
      height={size}
      className={`object-fit-cover ${className}`}
      loading="lazy"
    />
  );
};

export default Avatar;
