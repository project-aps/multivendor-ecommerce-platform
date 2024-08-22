import React from "react";
import "react-multi-carousel/lib/styles.css";

import BannerCategories from "../../components/BannerCategories.jsx";
import Categories from "../../components/Categories.jsx";
import HomeBanner from "../../components/HomeBanner";
import ProductList from "../../components/ProductList";
// import Hightlights from "../../components/Hightlights";
import DiscountedBanner from "../../components/DiscountedBanner";
import HomeBannerCarousel from "./HomeCarouselBanner.jsx";
import { slider1, slider2, slider3, slider4 } from "../../assets/index.js";
// import BannerBrands from "../../components/BannerBrands.jsx";

const HomePage = () => {
    const bannerImages = [slider1, slider2, slider3, slider4];

    return (
        <main>
            <BannerCategories />
            <HomeBannerCarousel images={bannerImages} />
            <HomeBanner />
            {/* <Hightlights /> */}
            <Categories />
            <ProductList />
            <DiscountedBanner />
            {/* <BannerBrands /> */}
        </main>
    );
};

export default HomePage;
