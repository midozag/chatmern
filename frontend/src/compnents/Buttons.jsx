import React from "react";

export const PrimaryButton = ({children,fun}) =>{
    return(
        <button
          onClick={onclick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
         {children}
        </button>
    )
}

export const SecondaryButton = ({children,onclick}) =>{
  return (
    <button
    onClick={onclick}
    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      {children}
    </button>
  )
}

