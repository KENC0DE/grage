import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { serviceRequestsAPI } from "../lib/api";
import type { ServiceRequest } from "../lib/api";
import { Plus, Car, Wrench, Clock, Loader2, AlertCircle, Inbox } from "lucide-react";

// A simple, reusable card for displaying service request info
const ServiceRequestCard = ({ request }: { request: ServiceRequest }) => (
  <Link to={`/service-requests/${request.id}`} className="block card hover:border-primary-500 border-transparent border-2 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-primary-600">{request.subcategory?.name || 'Service'}</p>
        <p className="text-sm text-gray-500">Request #{request.requestNumber}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        request.status === 'completed' ? 'bg-green-100 text-green-800' :
        request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {request.status.replace('_', ' ')}
      </span>
    </div>
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex items-center">
        <Wrench className="w-4 h-4 mr-2 text-gray-500" />
        <span>Category: {request.category?.name}</span>
      </div>
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-2 text-gray-500" />
        <span>{new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}</span>
      </div>
    </div>
  </Link>
);


const DashboardPage = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await serviceRequestsAPI.getAll({ limit: 5 }); // Fetch latest 5
        if (response.data?.serviceRequests) {
          setRequests(response.data.serviceRequests);
        }
      } catch (err) {
        setError("Failed to fetch service requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderEmptyState = () => (
    <div className="text-center py-12 card bg-gray-50">
        <Inbox className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No service requests</h3>
        <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'customer'
                ? "Get started by creating a new service request."
                : "There are no new requests at the moment."
            }
        </p>
        {user?.role === 'customer' && (
             <div className="mt-6">
                <Link to="/service-requests/new" className="btn-primary inline-flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Request
                </Link>
            </div>
        )}
    </div>
  );

  const stats = [
    { name: 'Total Requests', value: requests.length },
    { name: 'Pending', value: requests.filter(r => r.status === 'pending').length },
    { name: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length },
    { name: 'Completed', value: requests.filter(r => r.status === 'completed').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(stat => (
            <div key={stat.name} className="card p-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
        ))}
      </div>

      {/* Recent Service Requests */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Service Requests</h2>
            <Link to="/service-requests" className="btn-secondary text-sm">View All</Link>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="ml-4 text-gray-600">Loading requests...</p>
          </div>
        )}

        {error && (
            <div className="card bg-red-50 text-red-700 flex items-center">
                <AlertCircle className="w-5 h-5 mr-3"/>
                {error}
            </div>
        )}

        {!loading && !error && (
          requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map(req => (
                <ServiceRequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            renderEmptyState()
          )
        )}
      </div>

      {/* Quick Actions */}
      {user?.role === 'customer' && (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex gap-4">
                 <Link to="/service-requests/new" className="card flex-1 flex flex-col items-center justify-center hover:border-primary-500 border-transparent border-2 transition-all">
                    <Plus className="w-10 h-10 text-primary-600 mb-2"/>
                    <p className="font-semibold">New Service Request</p>
                 </Link>
                 <Link to="/profile" className="card flex-1 flex flex-col items-center justify-center hover:border-primary-500 border-transparent border-2 transition-all">
                    <Car className="w-10 h-10 text-primary-600 mb-2"/>
                    <p className="font-semibold">Manage Profile</p>
                 </Link>
            </div>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;