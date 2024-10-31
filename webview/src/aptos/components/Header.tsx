import React from 'react';
import { ArrowLeft } from '../../../assets/icons/ArrowLeft';
import { FoundryIcon } from '../../../assets/icons/FoundryIcon';
import { AptosIcon } from '../../../assets/icons/AptosIcon';
interface NavigateTitle {
    handleNavigate: () => void;
    iconType: 'foundry' | 'aptos';
    title: string;
}

const NavigateTitle: React.FC<NavigateTitle> = ({ handleNavigate, iconType, title }) => {
    return (
        <div
            className="flex items-end gap-[8px] relative self-stretch w-full flex-[0_0_auto]"
            onClick={handleNavigate}>
            <ArrowLeft className="!relative !w-[24px] !h-[24px]" />
            {iconType === 'foundry' ?
                <FoundryIcon className="!relative !w-[24px] !h-[24px] bg-white rounded-xl" /> : <AptosIcon className="!relative !w-[24px] !h-[24px] bg-white rounded-xl" />}
            <div className="relative w-fit mt-[-1.00px] [font-family:'Aeonik-Regular',Helvetica] font-normal text-white text-[18px] text-center tracking-[0] leading-[21.6px] whitespace-nowrap uppercase">
                {title}
            </div>
        </div>
    )
}

export default NavigateTitle;