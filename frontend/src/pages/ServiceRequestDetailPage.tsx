import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serviceRequestsAPI } from "../lib/api";
import type { ServiceRequest } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Loader2, AlertCircle, Calendar, Clock, MapPin, User, Wrench, Shield } from "lucide-react";

type Status = ServiceRequest['status'];

// Updated function to provide consistent Tailwind classes
const getStatusLook = (status: Status) => {
    switch (status) {
        case 'pending': return { label: 'Pending', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
        case 'assigned': return { label: 'Assigned', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
        case 'accepted': return { label: 'Accepted', badge: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500' };
        case 'in_progress': return { label: 'In Progress', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' };
        case 'completed': return { label: 'Completed', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
        case 'cancelled': return { label: 'Cancelled', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
        case 'rejected': return { label: 'Rejected', badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
        default: return { label: 'Unknown', badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    }
}

const ServiceRequestDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchRequest = async () => {
        if (!id) {
            setError("No request ID provided.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await serviceRequestsAPI.getById(Number(id));
            if (response.success && response.data?.serviceRequest) {
                setRequest(response.data.serviceRequest);
            } else {
                setError(response.message || "Could not find service request.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch service request details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const handleStatusUpdate = async (status: Status, comment?: string) => {
        if (!id) return;
        setIsUpdating(true);
        try {
            await serviceRequestsAPI.updateStatus(Number(id), status, comment);
            await fetchRequest(); // Refetch data to get the latest state
        } catch (err: any) {
            alert(err.response?.data?.message || "An error occurred while updating status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!id) return;
        if (window.confirm("Are you sure you want to cancel this service request?")) {
            setIsUpdating(true);
            try {
                await serviceRequestsAPI.cancel(Number(id), "Cancelled by customer");
                await fetchRequest(); // Refetch data
            } catch (err: any) {
                alert(err.response?.data?.message || "An error occurred while canceling.");
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const renderStatusActions = () => {
        if (!user || !request) return null;

        const canCancel = user.role === 'customer' && !['completed', 'cancelled'].includes(request.status);
        if (canCancel) {
            return <button onClick={handleCancel} disabled={isUpdating} className="btn-secondary border-red-500 text-red-600 hover:bg-red-50">Cancel Request</button>;
        }

        if (user.role === 'admin') {
            switch (request.status) {
                case 'pending':
                case 'assigned':
                    return <button onClick={() => handleStatusUpdate('accepted')} disabled={isUpdating} className="btn-primary">Accept Request</button>;
                case 'accepted':
                    return <button onClick={() => handleStatusUpdate('in_progress')} disabled={isUpdating} className="btn-primary">Start Service</button>;
                case 'in_progress':
                    return <button onClick={() => handleStatusUpdate('completed')} disabled={isUpdating} className="btn-primary bg-green-600 hover:bg-green-700">Mark as Completed</button>;
                default:
                    return null;
            }
        }
        return null;
    }
    
    if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /><p className="ml-4">Loading Request Details...</p></div>;
    if (error) return <div className="card max-w-4xl mx-auto my-8 bg-red-50 text-red-700 flex items-center"><AlertCircle className="w-5 h-5 mr-3"/>{error}</div>;
    if (!request) return null;

    const statusLook = getStatusLook(request.status);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Request #{request.requestNumber}</h1>
                    <p className="mt-1 text-lg text-gray-600">
                        <span className={`inline-block w-3 h-3 rounded-full ${statusLook.dot} mr-2`}></span>
                        Status: <span className="font-semibold">{statusLook.label}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {renderStatusActions()}
                </div>
            </div>

            {isUpdating && <div className="flex items-center text-primary-600"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Updating status...</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><Wrench className="w-6 h-6 mr-3 text-primary-600"/>Service Details</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="font-medium text-gray-500">Category</dt>
                            <dd className="text-gray-900">{request.category?.name}</dd>
                            <dt className="font-medium text-gray-500">Service</dt>
                            <dd className="text-gray-900">{request.subcategory?.name}</dd>
                        </dl>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Problem Description</p>
                            <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md">{request.description}</p>
                        </div>
                    </div>
                     <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><Calendar className="w-6 h-6 mr-3 text-primary-600"/>Schedule & Location</h2>
                         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="font-medium text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-2"/>Address</dt>
                            <dd className="text-gray-900">{request.addressFull}</dd>
                            <dt className="font-medium text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-2"/>Preferred Date</dt>
                            <dd className="text-gray-900">{new Date(request.preferredDate).toLocaleDateString()}</dd>
                             <dt className="font-medium text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-2"/>Preferred Time</dt>
                            <dd className="text-gray-900">{request.preferredTime}</dd>
                        </dl>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><User className="w-6 h-6 mr-3 text-primary-600"/>Customer Details</h2>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold">{request.customerName}</p>
                            <p className="text-gray-600">{request.customerEmail || 'Not provided'}</p>
                            <p className="text-gray-600">{request.customerPhone}</p>
                        </div>
                    </div>
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><Shield className="w-6 h-6 mr-3 text-primary-600"/>Assigned Garage</h2>
                        {request.assignedTo ? (
                             <div className="space-y-1 text-sm">
                                <p className="font-semibold">{request.assignedTo.garageName}</p>
                                <p className="text-gray-600">{request.assignedTo.email}</p>
                                <p className="text-gray-600">{request.assignedTo.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Not yet assigned to a garage.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestDetailPage;
