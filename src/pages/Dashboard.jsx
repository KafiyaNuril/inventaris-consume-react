import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constant";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard() {
    const [chartData, setChartData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(API_URL + "/stuffs")
            .then((res) => {
                const stuffs = res.data.data;

                // reduce = mengkategorikan lalu dihitung 
                const typeCount = stuffs.reduce((acc, curr) => {
                    const type = curr.type;
                    const available = curr.stuff_stock?.total_available || 0;
                    acc[type] = (acc[type] || 0) + available;
                    return acc;
                }, {});

                // Format data untuk chart
                const formatted = Object.entries(typeCount).map(([key, value]) => ({
                    type: key,
                    count: value
                }));

                setChartData(formatted);
            })
            .catch((err) => {
                if (err.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }
            });
    }, []);

    return (
        <>
        <h1 className="text-center mt-5">Halaman Dashboard</h1>
        <div style={{ width: "100%", height: 400 }}>
            <h3 className="text-center mb-4">Jumlah Barang per Kategori</h3>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Jumlah Barang">
                    {
                        chartData.map((key, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
                        ))
                    }
                        <LabelList dataKey="count" position="top" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        </>
    );
}