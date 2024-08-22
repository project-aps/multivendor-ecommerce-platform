export const DashboardCard = ({ title, value }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 h-32 flex-col items-center justify-center">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-3xl mt-2  font-bold">{value} </p>
        </div>
    );
};
