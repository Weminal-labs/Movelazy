import React from 'react';

interface ButtonAccount {
    handleClick: () => void;
    span: string;
}


const ButtonAccount: React.FC<ButtonAccount> = ({ handleClick, span }) => {
    return (
        <>
            <button
                className="relative w-full mt-2 inline-flex items-center justify-center px-4 py-3 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                onClick={handleClick}
            >
                <span className="relative px-5 py-2.5 text-[18px] transition-all ease-in duration-75  dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    {span}
                </span>
            </button>
        </>
    )
}

export default ButtonAccount