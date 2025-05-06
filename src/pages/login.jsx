import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// nama function sama dengan nama file
export default function Login() {
    // state : menyimpan data di project react
    // login : nama databnya, setLogin : func untuk mengisi datanya
    // useState() : membuat state dan nilai default
    const[login, setLogin] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");

    //  method untuk memanipulasi yg berhubungan dengan routing
    let navigate = useNavigate();

    function loginProcess(e) {
        e.preventDefault(); // mengambil alih fungsi submit html agar ditangani oleh js
        axios.post("http://45.64.100.26:88/API-Lumen/public/login", login)
        .then(res => {
            // console.log(res);
            // ketika berhasil login, simpan data token dan user di local storage
            localStorage.setItem("access_token", res.data.data.access_token);
            // JSON.stringify() : mengubah json menjadi bentuk string, localstorage hanya bisa menyimpan string
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
            // urutan titik setelah res (res.) disesuaikan isi res pada console.log
            // arahkan halaman ke dashboard
            navigate("/dashboard");
        })
        .catch(err => {
            setError(err.response.data);
            // console.log(err);
        })
    }

    // baris kode html disimpan di return
    return ( //class jadi className
        <>
        
        <form className="card w-50 d-block mx-auto my-5" onSubmit={(e) => loginProcess(e)}>
            <div className="card-header text-center fw-bold fs-3">Login</div>
            {
                // object.keys(error).length : mengecek jika object state error ada isinya
                // {} => ngambil data atau menjalankan sintaks js, () => menampilkan html
                // object.entries(error).map() => looping tipe data object di js
                // object.entries(error) => mengambil data object
                Object.keys(error).length > 0 ? (
                    <ol className="alert alert-danger m-2 p-2">
                        {/* kalau error.data ada isinya lebih dari 0, looping isinya kalau ga ada munculin  bagian message
                        1. error.data perlu menggunakan obejct.entries karena bentuknya [{}] array
                        2. error.message tdk perlu menggunakan kerna bentuknya "" string */}
                        {
                            Object.entries(error.data).length > 0 ?
                            Object.entries(error.data).map(([key, value]) => (
                                <li>{value}</li>
                            )) : error.message
                        }
                    </ol>
                ) : ''
            }
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    {/* setiap tag harus ada penutupnya : / */}
                    <input type="text" className="form-control" id="username" placeholder="Masukan Username Anda" onChange={(e) => setLogin({...login, username: e.target.value})}/>
                    {/* onChange : ketika input berubah nilai value, data dari state login dikeluarkan (...login), diganti (setLogin) bagian username menjadi value input terbaru (e.target.value)*/}
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" placeholder="Masukan Password Anda" onChange={(e) => setLogin({...login, password: e.target.value})}/>
                </div>
                <div className="d-grid">
                    <button className="btn btn-primary" type="submit">Login</button>
                </div>
            </div>
        </form>
        </>
    );
}