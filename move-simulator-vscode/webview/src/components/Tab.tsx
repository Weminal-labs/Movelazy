import { ArrowRight } from "../icons/ArrowRight";

interface TabProps {
    icon: JSX.Element;
    title: string;
}

export const Tab = ({ icon, title }: TabProps) => {
    return (
        <div className="flex justify-between overflow-hidden p-2.5 bg-[#50505026] mini:w-[80%]">
            <div className="inline-flex items-center gap-3">
                {icon}
                <div className="w-fit mt-[-1px] font-normal text-white text-[18px] whitespace-nowrap font-[Aeonik-Regular]">
                    {title}
                </div>
            </div>
            <ArrowRight className="!relative !w-[24px] !h-[24px] mini:hidden" />
        </div>
    );
};
