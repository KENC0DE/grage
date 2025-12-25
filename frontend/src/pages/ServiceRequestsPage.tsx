import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { serviceRequestsAPI } from "../lib/api";
import type { ServiceRequest } from "../lib/api";
import { Loader2, AlertCircle, Inbox, Plus, ChevronRight } from "lucide-react";

const ServiceRequestsPage = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await serviceRequestsAPI.getAll();
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
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No service requests found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {user?.role === 'customer'
          ? "You haven't made any service requests yet."
          : "There are no service requests to display."
        }
      </p>
      {user?.role === 'customer' && (
        <div className="mt-6">
          <Link to="/service-requests/new" className="btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Request
          </Link>
        </div>
      )}
    </div>
  );
  
  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'assigned': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-indigo-100 text-indigo-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="mt-2 text-lg text-gray-600">
            {user?.role === 'customer' 
              ? "Track all your service requests in one place."
              : "Manage all incoming and assigned service requests."
            }
          </p>
        </div>
        {user?.role === 'customer' && (
          <Link to="/service-requests/new" className="btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="ml-4 text-gray-600">Loading requests...</p>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {!loading && !error && (
        requests.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  {user?.role !== 'customer' && (
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.requestNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{request.subcategory?.name}</td>
                    {user?.role !== 'customer' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.customerName}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.preferredDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/service-requests/${request.id}`} className="text-primary-600 hover:text-primary-900 inline-flex items-center">
                        View <ChevronRight className="w-4 h-4 ml-1"/>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          renderEmptyState()
        )
      )}
    </div>
  );
};

export default ServiceRequestsPage;