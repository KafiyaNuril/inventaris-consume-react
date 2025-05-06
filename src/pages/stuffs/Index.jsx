import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constant";
import Modal from "../../components/modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function StuffIndex() {
    const [stuffs, setStuffs] = useState([]);
    const [error, setError] = useState([]);
    // untuk mengecek apakah modal akan dibuka/tidak
    const [isModalOpen, setIsModalOpen] = useState(false);
    // menyimpan data form modal
    const [formModal, setFormModal] = useState({
        name: '',
        type: ''
    });
    const [alert, setAlert] = useState("");

    const [formInbound, setFormInbound] = useState({
        stuff_id: "",
        total: 0,
        proof_file: null
    });

    const [isModalInboundOpen, setIsModalInboundOpen] = useState(false);

    const [selectedStuff, setSelectedStuff] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate();

    // useEffect() = menjalankan function ketika state/pemicu lain mengalami perubahan data
    // useEffect(func, pemicu) : pemicu [] artinya dijalankan ketika halaman baru dibuka
    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        // base url/port yg disimpan di contant dengan enpointv.stuffs
        // token disimpan pada headers -> Authorization. "Bearer " untuk memberi tau tipe token
        axios.get(API_URL + "/stuffs")
        .then(res => 
            setStuffs(res.data.data), //pake set karna mau nampilin data baru
        )
        .catch(err => {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data);
        });
    }

    function handleSubmitModal(e) {
        e.preventDefault();
        axios.post(API_URL + "/stuffs", formModal)
            .then(() => {
                // setelah berhasil tutup modal
                setIsModalOpen(false);
                // munculkan alert success
                setAlert("Success add new data stuff");
                setFormModal({ name: '', type: '' });
                setError([]);
                // panggil data lagi
                fetchData();
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    // jika error merupakan 401 (unauthorize) karna otken expired arahkan ke halaman login
                    localStorage.clear();
                    navigate("/login");
                }
                // jika error bukan 401, ambil detail err
                setError(err.response.data);
                
            });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        axios.patch(API_URL+"/stuffs/"+selectedStuff.id, formModal)
            .then(() => {
                setIsEditModalOpen(false);
                setSelectedStuff(null);
                setAlert("Success update stuff");
                setFormModal({ name: '', type: '' });
                setError([]);
                fetchData();
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
                
            });
    }

    function handleDelete() {
        axios.delete(`${API_URL}/stuffs/${selectedStuff.id}`)
            .then(() => {
                setIsDeleteModalOpen(false);
                setSelectedStuff(null);
                setAlert("Success delete stuff");
                setError([]);
                fetchData();
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
                
            });
    }

    function handleInboundBtn(stuffId) {
        // simpan value.id yg diambil param stuffId ke form inbound
        // stuff_id dari satte formInbound
        // stuffId dari parameter (stuffId) dari btn -> handleInboundBtn(value.id)
        setFormInbound({...formInbound, stuff_id: stuffId});
        // ubah nilai state modal
        setIsModalInboundOpen(true);
    }

    function handleInboundSubmit(e) {
        e.preventDefault();
        // new formData() : object js yg fungsinya sams dengan enctype="multiple/form-data" HTML -> mengirim file
        const data = new FormData();
        // append -> membuat pasangan key - value untuk payload
        data.append("stuff_id", formInbound.stuff_id);
        data.append("total", formInbound.total);
        data.append("proof_file", formInbound.proof_file);

        axios.post(API_URL+"/inbound-stuffs", data)
        .then(res => {
            setIsModalInboundOpen(false);
            // reset data state
            setFormInbound({
                stuff_id: "",
                total: 0,
                proof_file: null
            });
            setAlert("Success add data inbound stuff");
            fetchData();
        })
        .catch(err => {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data);
            
        });
        
    }

    function exportExcel() {
        // Buat format data (column) apa saja yg akan dibuat pada excel
        const formattedData = stuffs.map((item, index) =>  ({
            No: index + 1,
            Title: item.name,
            Type: item.type,
            TotalAvailable: item.stuff_stock ? item.stuff_stock.total_available : 0,
            TotalDefec: item.stuff_stock ? item.stuff_stock.total_defec : 0
        }));

        // Ubah array of object jadi worksheet excel
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        // buat workbook baru
        const workbook = XLSX.utils.book_new();
        // membuat sheets excel = tambahkan worksheet kedalam workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
        // mengatur format data array dan tipe file xlsx
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        // simpan file dengan extensi .xlsx
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreedsheetml.sheet"
        });
        saveAs(file, "data_stuffs.xlsx"); //Download File
    }

    return (
        <>
            {/* memunculkan alert success */}
            {alert !== "" ? (
                <div className="alert alert-success">{alert}</div>
                ) : ""
            }

            <div className="d-flex justify-content-end my-3">
                <button className="btn btn-success me-3" onClick={exportExcel}>Export Excel</button>
                 {/* jika button diclick, state isModalOpen diisi true agar mentrigger component modal untuk muncul */}
                <button className="btn btn-primary" onClick={() => {
                    setIsModalOpen(true);
                    setFormModal({ name: '', type: '' });
                    setError([]);
                }}> + ADD </button>
            </div>

            <table className="table table-bordered m-5">
                <thead>
                    <tr className="fw-bold">
                        <td rowSpan={2}>#</td>
                        <td rowSpan={2}>Name</td>
                        <td rowSpan={2}>Type</td>   
                        <td colSpan={2}>Stock</td>
                        <td rowSpan={2}></td>
                    </tr>
                    <tr className="fw-bold">
                        <td>Available</td>
                        <td>Defec</td>
                    </tr>
                </thead>
                <tbody>
                    {stuffs.map((value, index) => { //stuffs karena menampilkan data yang udah ada
                        const defec = value.stuff_stock ? value.stuff_stock.total_defec : "0";
                        const isDefecLow = defec < 3 && defec > 0;
                        return (
                            // digunakan untuk memberi identitas unik pada element yg dilooping
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{value.name}</td>
                                <td>{value.type}</td>
                                <td>{value.stuff_stock ? value.stuff_stock.total_available : "0"}</td>
                                <td className={isDefecLow ? "text-danger" : ""}>{defec}</td>
                                <td className="w-25">
                                    {/* inbound memerlukan data stuff_id, sehingga id stuff (value.id dikirim sebagai argumen) */}
                                    <button className="btn btn-success" onClick={() => handleInboundBtn(value.id)}>Add Stock</button>
                                    <button className="btn btn-info mx-2" onClick={() => {
                                        setSelectedStuff(value);
                                        setFormModal({ name: value.name, type: value.type });
                                        setIsEditModalOpen(true);
                                        setError([]);
                                    }}>Edit</button>
                                    <button className="btn btn-danger" onClick={() => {
                                        setSelectedStuff(value);
                                        setIsDeleteModalOpen(true);
                                        setError([]);
                                    }}>Delete</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ADD MODAL */}
            {/* row function buat sebaris, kalau lebih dari sebaris ga pake row function. kalau ngubah nilai panggil rownya */}
            {/* jika memerlukan argument pake row*/}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Stuff"> 
                <form onSubmit={handleSubmitModal}>
                    {/* memunculkan data err */}
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
                    <div className="form-group">
                        <label className="form-label">Name <span className="text-danger">*</span></label>
                        {/* parameter e (event) : bawaan js untuk mengambil semua kontent html di tag html di tempat dia disimpan */}
                        {/* ... sebagai splitoperator = untuk mengeluarkan nilai objek atau array */}
                        <input type="text" className="form-control" value={formModal.name} onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Type <span className="text-danger">*</span></label>
                        <select className="form-select" value={formModal.type} onChange={(e) => setFormModal({ ...formModal, type: e.target.value })}>
                            <option value="">-- Select Type --</option>
                            <option value="HTL/KLN">HTL/KLN</option>
                            <option value="Lab">Lab</option>
                            <option value="Sarpras">Sarpras</option>
                        </select>
                    </div>
                    {/* onSubmit karena di eksekusinya setelah disubmit */}
                    <button type="submit" className="btn btn-primary mt-2">ADD</button>
                </form>
                 {/* isi didalam tag <Modal> akan masuk ke parameter children pada file component/Modal.jsxnya */}
            </Modal>

            {/* EDIT MODAL */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Stuff">
                <form onSubmit={handleEditSubmit}>
                    {/* memunculkan data err */}
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
                    <div className="form-group">
                        <label className="form-label">Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.name}
                            onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Type <span className="text-danger">*</span></label>
                        <select
                            className="form-select"
                            value={formModal.type}
                            onChange={(e) => setFormModal({ ...formModal, type: e.target.value })}
                        >
                            <option value="">-- Select Type --</option>
                            <option value="HTL/KLN">HTL/KLN</option>
                            <option value="Lab">Lab</option>
                            <option value="Sarpras">Sarpras</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary mt-2">UPDATE</button>
                </form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Stuff">
                <p>Are you sure want to delete <strong>{selectedStuff?.name}</strong>?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary mx-2" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </Modal>

            {/* ADD STOCK MODAL */}
            <Modal isOpen={isModalInboundOpen} onClose={() => setIsModalInboundOpen(false)} title="Add Stock">
                <form onSubmit={handleInboundSubmit}>
                    {/* memunculkan data err */}
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
                    <div className="form-group">
                        <label className="form-label">Total Item <span className="text-danger">*</span></label>
                        <input type="number" className="form-control" onChange={(e) => setFormInbound({ ...formInbound, total: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Proof Image <span className="text-danger">*</span></label>
                        <input type="file" className="form-control" onChange={(e) => setFormInbound({ ...formInbound, proof_file: e.target.files[0] })}/>
                    </div>
                    <button type="submit" className="btn btn-primary mt-2">Add Stock</button>
                </form>
            </Modal>
        </>
    );
}