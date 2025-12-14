import { useEffect, useState } from 'react';
import axios from 'axios';

type User = {
	_id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	role: string;
	certificateCode?: string | null;
	isCertificateVerified?: boolean | null;
};

export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`);
            console.log(res.data, "data=============");
			setUsers(res.data);
		} catch (e: any) {
			setError(e?.response?.data?.message ?? e.message ?? 'Failed to fetch users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const generateCode = async (id: string) => {
		try {
			setBusyId(id);
			setError(null);
			const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/${id}/generate`);
			const code = res.data?.certificateCode;
			const verifyUrl = res.data?.verifyUrl;
			await fetchUsers();
			if (code) {
				alert(`Certificate generated: ${code}`);
				if (verifyUrl) window.open(`/verify/${code}`, '_blank');
			}
		} catch (e: any) {
			setError(e?.response?.data?.message ?? e.message ?? 'Failed to generate code');
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Users</h2>
				<button
					className="px-3 py-1 border rounded"
					onClick={fetchUsers}
					disabled={loading}
				>
					{loading ? 'Refreshing…' : 'Refresh'}
				</button>
			</div>

			{error && (
				<div className="mb-3 text-sm text-red-600">{error}</div>
			)}

			<div className="overflow-x-auto">
				<table className="min-w-full border border-gray-200 text-sm">
					<thead>
						<tr className="bg-gray-50">
							<th className="p-2 border">Name</th>
							<th className="p-2 border">Email</th>
							<th className="p-2 border">Phone</th>
							<th className="p-2 border">Role</th>
							<th className="p-2 border">Certificate Code</th>
							<th className="p-2 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u._id}>
								<td className="p-2 border">{u.fullName}</td>
								<td className="p-2 border">{u.email}</td>
								<td className="p-2 border">{u.phoneNumber}</td>
								<td className="p-2 border">{u.role}</td>
								<td className="p-2 border">
									{u.certificateCode ? (
									<a 
										href={`/verify/${u.certificateCode}`} 
										target="_blank" 
										rel="noreferrer"
										className="font-mono text-blue-600 hover:underline"
									>
										{u.certificateCode}
									</a>
									) : (
										<span className="text-gray-400">—</span>
									)}
								</td>
								<td className="p-2 border">
									{u.certificateCode ? (
									<a
										href={`/verify/${u.certificateCode}`}
										target="_blank"
										rel="noreferrer"
										className="inline-block px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
									>
										Verify Certificate
									</a>
								) : (
									<button
										className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
											onClick={() => generateCode(u._id)}
											disabled={busyId === u._id}
											title="Generate certificate"
										>
											{busyId === u._id ? 'Generating…' : 'Generate'}
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

