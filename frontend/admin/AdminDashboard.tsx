import React, { useState, useMemo } from 'react';
// FIX 1: 'Link' component ko react-router-dom se import karein
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { StatCard } from '../components/admin/StatCard';
import { SalesChart } from '../components/admin/SalesChart';
import { DollarSign, Package, ShoppingBag, Users, Calendar as CalendarIcon, ChevronDown, Download } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, startOfDay, format, eachDayOfInterval, subYears } from 'date-fns';
import { Button } from '../components/ui/Button';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
// @ts-ignore - This is to extend the jsPDF type for the autoTable plugin
import autoTable from 'jspdf-autotable';


import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

export const AdminDashboard: React.FC = () => {
    const { orders, products, users } = useAppContext();

    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: addDays(new Date(), -29),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

    const filteredOrders = useMemo(() => {
        if (!dateRange[0].startDate) return [];
        const startDate = startOfDay(dateRange[0].startDate);
        const endDate = new Date(dateRange[0].endDate.setHours(23, 59, 59, 999));
        
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }, [orders, dateRange]);
    
    const setDatePreset = (preset: 'today' | '7days' | '30days' | '1year') => {
        const endDate = new Date();
        let startDate = new Date();
        if (preset === 'today') startDate = new Date();
        if (preset === '7days') startDate = addDays(endDate, -6);
        if (preset === '30days') startDate = addDays(endDate, -29);
        if (preset === '1year') startDate = subYears(endDate, 1);
        
        setDateRange([{ startDate, endDate, key: 'selection' }]);
        setShowCalendar(false);
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Shophub Orders Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 14, 30);

        let yPosition = 40; 

        orders.forEach((order, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20; 
            }
            
            if (index > 0) {
                doc.setDrawColor(200); 
                doc.line(14, yPosition, 196, yPosition);
                yPosition += 10;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Order ID: #${order._id.slice(-8)}`, 14, yPosition);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            yPosition += 7;
            doc.text(`Customer: ${order.userName}`, 14, yPosition);
            doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 80, yPosition);
            doc.text(`Total: ₹${order.totalAmount.toFixed(2)}`, 140, yPosition);
            yPosition += 5;

            const tableHead = [['Product Name', 'Quantity', 'Unit Price', 'Total']];
            const tableBody = order.items.map(item => [
                item.name,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${(item.price * item.quantity).toFixed(2)}`
            ]);

            autoTable(doc, {
                head: tableHead,
                body: tableBody,
                startY: yPosition,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 }, 
                styles: { fontSize: 8 },
            });
            
            // @ts-ignore 
            yPosition = doc.lastAutoTable.finalY + 15;
        });

        doc.save(`shophub-orders-report-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;
    
    const salesData = useMemo(() => {
        if (!dateRange[0].startDate) return [];
        const interval = eachDayOfInterval({ start: dateRange[0].startDate, end: dateRange[0].endDate });
        const dataMap = new Map<string, number>();

        interval.forEach(day => {
            const dayKey = format(day, 'dd MMM');
            dataMap.set(dayKey, 0);
        });

        filteredOrders.forEach(order => {
            const dayKey = format(new Date(order.date), 'dd MMM');
            if (dataMap.has(dayKey)) {
                dataMap.set(dayKey, dataMap.get(dayKey)! + order.totalAmount);
            }
        });

        return Array.from(dataMap, ([name, sales]) => ({ name, sales }));
    }, [filteredOrders, dateRange]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h1>
                    <p className="text-sm text-gray-500">Here's what's happening with your store.</p>
                </div>
                <div className="flex items-center gap-2 relative flex-wrap bg-white p-1 rounded-lg border">
                    <Button variant="ghost" size="sm" onClick={() => setDatePreset('today')}>Today</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDatePreset('7days')}>Last 7 Days</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDatePreset('30days')}>Last 30 Days</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDatePreset('1year')}>Last 1 Year</Button>
                    <Button onClick={() => setShowCalendar(!showCalendar)} size="sm" className="bg-slate-700 text-white hover:bg-slate-800">
                        <CalendarIcon size={16} className="mr-2"/>
                        <span>Custom</span>
                        <ChevronDown size={16} className="ml-2"/>
                    </Button>
                    {showCalendar && (
                        <div className="absolute top-full right-0 mt-2 z-10 shadow-lg rounded-lg border bg-white">
                            <DateRange
                                editableDateInputs={true}
                                onChange={item => setDateRange([item.selection as any])}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                                maxDate={new Date()}
                            />
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<DollarSign size={20}/>} />
                <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingBag size={20}/>} />
                <StatCard title="Put On New" value={0} icon={<Package size={20}/>} />
                <StatCard title="Avg Order Value" value={`₹${(totalRevenue / (totalOrders || 1)).toFixed(0)}`} icon={<DollarSign size={20}/>} />
                <StatCard title="Contact Users" value={totalUsers} icon={<Users size={20}/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Sales Overview</h2>
                        <select 
                            value={chartType} 
                            onChange={(e) => setChartType(e.target.value as any)}
                            className="p-2 rounded-md border-gray-300 text-sm focus:ring-primary focus:border-primary"
                        >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                        </select>
                    </div>
                    <div style={{ height: '350px' }}>
                        <SalesChart data={salesData} type={chartType} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-soft flex flex-col" style={{ height: '442px' }}>
                    <div className="flex justify-between items-center flex-shrink-0 mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                        <div className="flex items-center gap-2">
                            {/* --- FIX: Button ko Link component se wrap kiya gaya hai --- */}
                            <Link to="/admin/orders">
                                <Button variant="ghost" size="sm">View all</Button>
                            </Link>
                            <Button onClick={handleDownloadPDF} size="sm" variant="outline" className="text-sm">
                                <Download size={14} className="mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr className="text-left text-gray-500">
                                    <th className="py-2 font-normal">Order ID</th>
                                    <th className="py-2 font-normal">Customer</th>
                                    <th className="py-2 font-normal">Amount</th>
                                    <th className="py-2 font-normal">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? filteredOrders.slice(0, 20).map(order => (
                                    <tr key={order._id} className="border-t">
                                        <td className="py-3 font-medium text-primary">#{order._id.slice(-6)}</td>
                                        <td className="py-3 text-gray-700">{order.userName}</td>
                                        <td className="py-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                                        <td className="py-3 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center text-gray-500 pt-16">No orders in this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
