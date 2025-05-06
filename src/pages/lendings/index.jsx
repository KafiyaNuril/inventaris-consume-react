import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constant";
import Modal from "../../components/modal";

export default function Lendings() {
    const [stuffs, setStuffs] = useState([]);
    const [error, setError] = useState([]);
    const navigate = useNavigate();

    const [isModalOpen,setIsModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({
        stuff_id: "",
        name: "",
        total_stuff: 0,
        note: ""
    });

    const [alert, setAlert] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        axios.get(API_URL + "/stuffs")
        .then(res => setStuffs(res.data.data))
        .catch(err => {
            if (err.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem("user")
                navigate("/login");
            }
            setError(err.response.data);
        });
    }

    function handleBtn(stuffId) {
        setFormModal({...formModal, stuff_id: stuffId});
        setIsModalOpen(true);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        axios.post(API_URL + "/lendings", formModal)
        .then((res) => {
            setIsModalOpen(false);
            setFormModal({stuff_id: "", name: "", total_stuff: "", note: ""});
            setAlert("Success add new lending!");
            fetchData();
        })
        .catch((err) => {
            if (err.status == 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                navigate("/login");
            }
            setError(err.response.data);
        })
    }

    return (
        <>
            {alert !== "" ? (
                <div className="alert alert-success">{alert}</div>
                ) : ""
            }
            <div className="row my-5">
                {
                    stuffs.map((item, index) => (
                        <div className="col-3 mx-2 card text-center">
                            <h5>{item.name}</h5>
                            <p>Total Available : {item.stuff_stock ? item.stuff_stock.total_available : 0}</p>
                            {/* disable() disable jika sesuai kondisi {} */}
                            <button className="btn btn-outline-primary" disabled={!(item.stuff_stock && item.stuff_stock.total_available)} onClick={() => handleBtn(item.id)}>
                                {item.stuff_stock && item.stuff_stock.total_available ? 'Select' : 'Stock Not Available'}
                            </button>
                        </div>
                    ))
                }
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={"Add Lending"}>
                {
                    Object.keys(error).length > 0 ? (
                        <ol className="alert alert-danger m-2 p-2">
                            {
                                Object.entries(error.data).length > 0 > 0 ?
                                Object.entries(error.data).map(([key, value]) =>  (
                                    <li>{value}</li>
                                )) : error.message
                            }
                        </ol>
                    ) : ''
                }
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Total Stuff <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={(e) => setFormModal({ ...formModal, total_stuff: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Note <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" onChange={(e) => setFormModal({ ...formModal, note: e.target.value })}/>
                    </div>
                    <button type="submit" className="btn btn-primary">Process</button>
                </form>
            </Modal>
        </>
    )
}