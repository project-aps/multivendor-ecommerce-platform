import { useEffect } from "react";
import Container from "../../components/Container";
import UserInfo from "../../components/UserInfo";
import Loading from "../../components/Loading";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../components/Breadcrumbs";

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Profile",
        path: "/profile",
    },
];

const ProfilePage = () => {
    const { isLoading, error, user } = useSelector((state) => state.auth);
    console.log(user);

    return (
        <Container>
            {/* Breadcrumbs component */}
            {breadcrumbsData && <Breadcrumbs crumbs={breadcrumbsData} />}
            {user && <UserInfo currentUser={user} />}
            {isLoading && <Loading />}
            {error && <p>Error: {error}</p>}
        </Container>
    );
};

export default ProfilePage;
