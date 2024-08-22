import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const HomeBannerCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Automatically slide every 500ms
    useEffect(() => {
        const intervalId = setInterval(() => {
            handleNext();
        }, 1500);

        return () => clearInterval(intervalId);
    }, [currentIndex]);

    const handlePrev = () => {
        if (currentIndex === 0) {
            // Move to the last slide without transition, then activate the transition
            setIsTransitioning(false);
            setCurrentIndex(images.length - 1);
            setTimeout(() => setIsTransitioning(true), 20); // Small timeout to reset the transition
        } else {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex === images.length - 1) {
            // Move to the first slide without transition, then activate the transition
            setIsTransitioning(false);
            setCurrentIndex(0);
            setTimeout(() => setIsTransitioning(true), 20); // Small timeout to reset the transition
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="relative w-full h-[400px] overflow-hidden">
            {/* Images */}
            <div
                className={`flex ${
                    isTransitioning
                        ? "transition-transform duration-500 ease-in-out"
                        : ""
                }`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                        <img
                            src={image}
                            alt={`Slide ${index}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                onClick={handlePrev}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            >
                <FaArrowLeft />
            </button>

            {/* Right Arrow */}
            <button
                onClick={handleNext}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            >
                <FaArrowRight />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                            currentIndex === index ? "bg-white" : "bg-white/50"
                        }`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default HomeBannerCarousel;
