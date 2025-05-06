import React from "react";
import { Navigate, Outlet} from "react-router-dom";

export default function PrivatePage() {
    const authentication = localStorage.getItem("access_token");

    // Jika navigate disimpan di function, harus gunakan useNavigate(), jika digunakan di konten HTML gunakan <navigate />
    // Outlet ---> element children lainnya
    // gapake kurung bulat karena ga pake tag HTML
    return authentication ? <Outlet/> : <Navigate to="/login" replace />
}