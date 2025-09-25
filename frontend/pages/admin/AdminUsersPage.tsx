import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const AdminUsersPage: React.FC = () => {
    const { users } = useAppContext();

    return (
        <div className="bg-neutral-light p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-dark">
                        <tr>
                            <th className="text-left p-3 font-semibold text-text-secondary">User ID</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Name</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Email</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Phone</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-neutral-dark transition-colors hover:bg-teal-50">
                                <td className="p-3 font-medium text-text-secondary">{user.id}</td>
                                <td className="p-3 text-text-primary">{user.name}</td>
                                <td className="p-3 text-text-primary">{user.email}</td>
                                <td className="p-3 text-text-secondary">{user.phone}</td>
                                <td className="p-3 capitalize">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
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