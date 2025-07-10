import React from "react";

const Logo = ({ className }) => {
  return (
    <svg
      className={`w-10 h-10 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17 10H10V8H17V10ZM17 14H10V12H17V14ZM7 15.5C6.17 15.5 5.5 14.83 5.5 14C5.5 13.17 6.17 12.5 7 12.5C7.83 12.5 8.5 13.17 8.5 14C8.5 14.83 7.83 15.5 7 15.5ZM9 17H5C3.9 17 3 16.1 3 15C3 13.9 3.9 13 5 13H9C10.1 13 11 13.9 11 15C11 16.1 10.1 17 9 17ZM19 3H5C3.9 3 3 3.9 3 5V11C3 11.55 3.45 12 4 12H20C20.55 12 21 11.55 21 11V5C21 3.9 20.1 3 19 3ZM19 10H5V5H19V10Z"/>
    </svg>
  );
};

export default Logo;
