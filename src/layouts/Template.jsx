import React from 'react';
import Navbar from '../components/navbar';
import { Outlet } from 'react-router-dom';

export default function Template() {
    return (
        <>
            <Navbar />
            <div className="container">
                {/* seperti yield : mengisi content dinamis */}
                <Outlet />
            </div>
        </>
    )
}