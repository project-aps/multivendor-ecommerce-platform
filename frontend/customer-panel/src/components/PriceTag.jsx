import { twMerge } from "tailwind-merge";
import FormattedPrice from "./FormattedPrice";

const PriceTag = ({ regularPrice, discountedPrice, className }) => {
    return (
        <div className={twMerge("flex items-center gap-2", className)}>
            <p className="line-through text-red-300 font-medium">
                <FormattedPrice amount={regularPrice} />
            </p>
            <p className="font-bold text-green-500">
                <FormattedPrice amount={discountedPrice} />
            </p>
        </div>
    );
};

export default PriceTag;
