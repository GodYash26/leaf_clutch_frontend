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
	const [searchCode, setSearchCode] = useState('');

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
			await fetchUsers();
			if (code) {
				alert(`Certificate generated: ${code}`);
			}
		} catch (e: any) {
			setError(e?.response?.data?.message ?? e.message ?? 'Failed to generate code');
		} finally {
			setBusyId(null);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchCode.trim()) {
			window.location.href = `/verify/${searchCode.trim()}`;
		}
	};

	return (
		<div className="users-container">
			<div className="users-header">
				<h2 className="users-title">Users</h2>
				<button
					className="btn-refresh"
					onClick={fetchUsers}
					disabled={loading}
				>
					{loading ? 'Refreshing…' : 'Refresh'}
				</button>
			</div>

			{/* Certificate Search Bar */}
			<form onSubmit={handleSearch} className="search-form">
				<div className="search-form-group">
					<input
						type="text"
						value={searchCode}
						onChange={(e) => setSearchCode(e.target.value)}
						placeholder="Search certificate code (e.g., LC-86528U)"
						className="search-input"
					/>
					<button
						type="submit"
						disabled={!searchCode.trim()}
						className="btn-verify"
					>
						Verify Certificate
					</button>
				</div>
			</form>

			{error && (
				<div className="alert alert-error">{error}</div>
			)}

			<div className="table-wrapper">
				<table className="users-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Phone</th>
							<th>Role</th>
							<th>Certificate Code</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u._id}>
								<td>{u.fullName}</td>
								<td>{u.email}</td>
								<td>{u.phoneNumber}</td>
								<td>{u.role}</td>
								<td className="cert-code-cell">
									{u.certificateCode ? (
										<a 
											href={`/verify/${u.certificateCode}`} 
											target="_blank" 
											rel="noreferrer"
											className="cert-code-link"
										>
											{u.certificateCode}
										</a>
									) : (
										<span className="cert-code-empty">—</span>
									)}
								</td>
								<td className="action-cell">
									{u.certificateCode ? (
										<a
											href={`/verify/${u.certificateCode}`}
											target="_blank"
											rel="noreferrer"
											className="btn-action btn-verify-link"
										>
											Verify Certificate
										</a>
									) : (
										<button
											className="btn-action btn-generate"
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

