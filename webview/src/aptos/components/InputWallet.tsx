
import React from 'react';
interface InputWallet {
    label: string;
    value: string;
}
const InputWallet: React.FC<InputWallet> = ({ label, value }) => {
    return (
        <div>
            <label className="block text-white text-xl font-semibold mb-2">{label}</label>
            <input
                className="w-full peer outline-none ring px-4 py-3 h-12 text-[20px] text-black border-0 rounded-lg ring-gray-200 duration-500 focus:ring-2 focus:border-gray-100 relative placeholder:duration-500 placeholder:absolute focus:placeholder:pt-10 shadow-xl shadow-gray-400/10 focus:shadow-none focus:rounded-md focus:ring-[#15ba42] placeholder:text-gray-400"
                type="text"
                value={value}
            />
        </div>
    );

};
export default InputWallet;
