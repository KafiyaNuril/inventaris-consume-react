import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function LendingData() {
    const [lendings, setLendings] = useState([]);
    const [error, setError] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({
        lending_id: "",
        total_good_stuff: 0,
        total_defec_stuff: 0,
    });
    const [alert, setAlert] = useState("");
    const [detailLending, setDetailLending] = useState({});
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState("");
    const filteredLendings = lendings.filter((item) =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    
    const navigate = useNavigate();

    function fetchData() {
        axios.get(API_URL + "/lendings")
        .then((res) => setLendings(res.data.data))
        .catch((err) => {
            if (err.status == 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                navigate("/login");
            }
            setError(err.response.data);
        })
    }

    useEffect(() => {
        fetchData();
    }, []);

    function handleBtnCreate(lending) {
        // parameter diatur mengambil seluruh data lending, karna data lending yg diperlukan bukan hanya id, yg lainnya diperlukan untk modal
        setDetailLending(lending);
        setFormModal({...formModal, lending_id: lending.id});
        setIsModalOpen(true);
    }

    function handleSubmitFrom(e) {
        e.preventDefault();
        axios.post(API_URL + "/restorations", formModal)
        .then((res) => {
            setIsModalOpen(false);
            setFormModal({
                lending_id: "",
                total_good_stuff: 0,
                total_defec_stuff: 0
            });
            setDetailLending({});
            setAlert("Success create restoration of lending!");
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

    function handleBtnDetail(lending) {
        setDetailLending(lending);
        setIsModalDetailOpen(true);
    }

    function exportExcel() {
        const formattedData = lendings.map((item, index) =>  ({
            No: index + 1,
            Name: item.name,
            StuffName: item.stuff.name,
            TotalStuff: item.total_stuff,
            DateOfLending: new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long'}),
            RestorationStatus: item.restoration ? "Returned" : "-",
            RestorationTotalGoodStuff: item.restoration ? item.restoration.total_good_stuff : "-",
            RestorationTotalDefecStuff: item.restoration ? item.restoration.total_defec_stuff : "-",
            DateOfRestoration: item.restoration ? new Date(item.restoration.created_at).toLocaleDateString('id-ID', { dateStyle: 'long'}) : "-"
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreedsheetml.sheet"
        });
        saveAs(file, "data_restoration.xlsx"); //Download File
    }

    return (
        <>
        {
            alert !== "" ? (
                <div className="alert alert-success">{alert}</div>
            ) : ""
        }
            <div className="d-flex justify-content-end my-3">
                <button className="btn btn-success me-3" onClick={exportExcel}>Export Excel</button>
                <input type="text" placeholder="Search by Name" className="form-control w-25" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
            </div>
            <table className="table table-bordered mt-5">
                <thead>
                    <tr>
                        <td rowSpan={2}>#</td>
                        <td rowSpan={2}>Name</td>
                        <td colSpan={2}>Stuff</td>   
                        <td rowSpan={2}>Date</td>
                        <td rowSpan={2}></td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>Total</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredLendings.map((item, index) => (
                            <tr>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.stuff?.name}</td> {/* ? untuk isset*/}
                                <td>{item.total_stuff}</td>
                                <td>{new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long'})}</td> {/* untuk format bulan */}
                                <td>
                                    {/*  jika sudah memiliki resoration munculkan btn detail, jika blm btn create */}
                                    {
                                        item.restoration ? ( <button className="btn btn-info" onClick={() => handleBtnDetail(item)}>Detail Restoration</button> ) : ( <button className="btn btn-primary" onClick={() => handleBtnCreate(item)}>Create Restoration</button> )
                                    }
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {/* Create Restoration */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Restoration">
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
                <form onSubmit={handleSubmitFrom}>
                    <div className="alert alert-info">Lending <b>{detailLending.name}</b> with total stuff <b>{detailLending.total_stuff}</b></div>
                    <div className="form-group mt-2">
                        <label className="form-label">Total Good Stuff</label>
                        <input type="number" className="form-control" onChange={(e) => setFormModal({ ...formModal, total_good_stuff: e.target.value })}/>
                    </div>
                    <div className="form-group mt-2">
                        <label className="form-label">Total Defec Stuff</label>
                        <input type="number" className="form-control" onChange={(e) => setFormModal({ ...formModal, total_defec_stuff: e.target.value })}/>
                    </div>
                    <button className="btn btn-primary mt-3">Create</button>
                </form>
            </Modal>

            {/* Detail Restoration */}
            <Modal isOpen={isModalDetailOpen} onClose={() => setIsModalDetailOpen(false)} title="Detail Restoration">
                <ol>
                    <li>Date of Restoration : {new Date(detailLending.restoration?.created_at).toLocaleDateString('id-ID', { dateStyle: 'long'})}</li>
                    <li>Total Item of Lending : {detailLending.total_stuff  }</li>
                    <li>Total Good Stuff of Restoration : {detailLending.restoration?.total_good_stuff}</li>
                    <li>Total Defec Stuff of Restoration : {detailLending.restoration?.total_defec_stuff}</li>
                </ol>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onClick={() => setIsModalDetailOpen(false)}>Close</button>
                </div>
            </Modal>
        </>
    )
}