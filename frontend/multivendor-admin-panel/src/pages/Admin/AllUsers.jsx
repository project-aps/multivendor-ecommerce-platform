import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import usersAxios from "../../utils/axios/users_axios";
import { useNavigate } from "react-router-dom";

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await usersAxios.get("/users");
            if (response.data.success) {
                setUsers(response.data.data);
                toast.success("Users fetched successfully");
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            setError("Failed to fetch users");
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                All Users
            </h2>
            {loading ? (
                <p>Loading users...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    navigate(`/admin/users/${user.id}`);
                                }}
                            >
                                <td className="py-2 px-4 border-b">
                                    {user.id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {user.name}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {user.email}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {user.active ? (
                                        <span className="text-green-500">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="text-red-500">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersTable;
