import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import Modal from "../../components/modal";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Inbound() {
    const [inboundStuffs, setInboundStuffs] = useState([]);
    const [isDeleteModalInbound, setIsDeleteModalInbound] = useState(false);
    const [selectedInbound, setselectedInbound] = useState(null);
    const [error, setError] = useState([]);
    const [alert, setAlert] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        axios.get(API_URL + "/inbound-stuffs")
            .then(res => 
                setInboundStuffs(res.data.data),
            )
            .catch(err => {
                if (err.response.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }

    function handleDelete() {
        axios.delete(API_URL + "/inbound-stuffs/" + selectedInbound.id)
            .then(() => {
                setIsDeleteModalInbound(false);
                setselectedInbound(null);
                setAlert("Success delete Inbound stuff");
                setError([]);
                fetchData();
            })
            .catch(err => {
                if (err.response.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
                
            });
    }

    function exportExcel() {
        const formattedData = inboundStuffs.map((item, index) =>  ({
            No: index + 1,
            StuffName: item.stuff.name,
            TotalItem: item.total,
            ProofFile: item.proof_file,
            Date: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
        saveAs(file, "data_inboundStuffs.xlsx"); //Download File
    }

    return (
        <>
        {alert !== "" ? (
            <div className="alert alert-success">{alert}</div>
            ) : ""
        }
        
        <div className="d-flex justify-content-end my-3">
            <button className="btn btn-success me-3" onClick={exportExcel}>Export Excel</button>
        </div>

        <table className="table table-bordered m-5">
            <thead>
                <tr className="fw-bold">
                    <td rowSpan={2}>#</td>
                    <td rowSpan={2}>Stuff</td>
                    <td rowSpan={2}>Total New Item</td>   
                    <td rowSpan={2}>Proof File</td>
                    <td rowSpan={2}></td>
                </tr>
            </thead>
            <tbody>
                {inboundStuffs.map((value, index) => {
                    return (
                        // digunakan untuk memberi identitas unik pada element yg dilooping
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{value.stuff.name}</td>
                            <td>{value.total}</td>
                            <td>
                                {value.proof_file ? (
                                    <a href={value.proof_file} target="_blank" rel="">
                                        <img className="w-50 d-block mt-2" src={value.proof_file} alt="Proof" />
                                    </a>
                                ) : ''}
                            </td>
                            <td className="w-25">
                                <button className="btn btn-danger" onClick={() => {
                                    setselectedInbound(value);
                                    setIsDeleteModalInbound(true);
                                    setError([]);
                                }}>Delete</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

        <Modal isOpen={isDeleteModalInbound} onClose={() => setIsDeleteModalInbound(false)} title="Delete Inbound Stuff">
            {/* ? antisipasi jika selectedInbound masih null*/}
            <p>Are you sure want to delete <strong>{selectedInbound?.stuff.name}</strong>?</p>
            <div className="d-flex justify-content-end">
                <button className="btn btn-secondary mx-2" onClick={() => setIsDeleteModalInbound(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
        </Modal>
        </>
    );
}

