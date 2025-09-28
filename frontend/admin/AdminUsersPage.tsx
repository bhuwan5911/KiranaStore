import React from 'react';
import { useAppContext } from "../context/AppContext";
import { User } from '../../types'; // User type ko import karna acchi practice hai

export const AdminUsersPage: React.FC = () => {
    const { users } = useAppContext();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3 font-semibold text-text-secondary">User ID</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Name</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Email</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Phone</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: User) => (
                            // --- BADLAV: user.id ki jagah user._id ka istemal karein ---
                            <tr key={user._id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-500 text-sm">#{user._id.slice(-6)}</td>
                                <td className="p-3 text-text-primary font-semibold">{user.name}</td>
                                <td className="p-3 text-text-primary">{user.email}</td>
                                <td className="p-3 text-text-secondary">{user.phone}</td>
                                <td className="p-3 capitalize">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
