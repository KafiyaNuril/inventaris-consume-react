import React from 'react';

export default function Profile() {
    let data = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ borderRadius: "20px", backgroundColor: "#f5f7fa", width: "40%"}}>
                <div className="text-center">
                    <img src="https://i.pinimg.com/736x/9d/1d/42/9d1d428eb91e669fb41a05866037b91f.jpg" alt="profile" className="rounded-circle mb-3" style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid #CAE0BC" }}/>
                    <h1 className="fw-bold">{data?.username}</h1>
                </div>
                <hr />
                <div className="px-3">
                    <h5 className="text-secondary">Informasi Akun</h5>
                    <ul className="list-unstyled mt-3">
                        <li><strong>Email : </strong> {data?.email}</li>
                        <li><strong>Role : </strong> {data?.role}</li>
                        <li><strong>Status : </strong> {data?.status == 1 ? <span className="text-success fw-bold">Aktif</span> : <span className="text-danger fw-bold">Tidak Aktif</span>}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
