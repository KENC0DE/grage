import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { categoriesAPI, subcategoriesAPI, serviceRequestsAPI } from "../lib/api";
import type { Category, Subcategory } from "../lib/api";
import { Loader2, AlertCircle, Send } from "lucide-react";

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    subcategoryId: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    addressFull: "",
  });

  // API data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll({ isActive: true });
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        setError("Failed to load service categories.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (formData.categoryId) {
      const fetchSubcategories = async () => {
        setIsSubcategoriesLoading(true);
        setSubcategories([]); // Clear previous subcategories
        setFormData(prev => ({ ...prev, subcategoryId: ''})); // Reset selection
        try {
          const res = await subcategoriesAPI.getByCategory(parseInt(formData.categoryId));
          if (res.data?.subcategories) {
            setSubcategories(res.data.subcategories);
          }
        } catch (err) {
          setError("Failed to load sub-categories for the selected category.");
        } finally {
            setIsSubcategoriesLoading(false);
        }
      };
      fetchSubcategories();
    }
  }, [formData.categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError("You must be logged in to create a request.");
        return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await serviceRequestsAPI.create({
        customerName: user.name,
        customerPhone: user.phone,
        categoryId: parseInt(formData.categoryId),
        subcategoryId: parseInt(formData.subcategoryId),
        description: formData.description,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        address: {
          fullAddress: formData.addressFull,
        },
        // Using hardcoded location as per plan
        location: {
          coordinates: [-73.935242, 40.730610], // [longitude, latitude] for NYC
        },
      });

      if (response.success && response.data?.serviceRequest) {
        // Navigate to the detail page of the newly created request
        navigate(`/service-requests/${response.data.serviceRequest.id}`);
      } else {
        setError(response.message || "An unknown error occurred.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create service request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Service Request</h1>
        <p className="mt-2 text-lg text-gray-600">
          Let us know what you need, and we'll connect you with a nearby garage.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Service Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="input-field mt-1"
              >
                <option value="" disabled>Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700">
                Specific Service
              </label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                required
                disabled={!formData.categoryId || isSubcategoriesLoading || subcategories.length === 0}
                className="input-field mt-1 disabled:bg-gray-100"
              >
                <option value="" disabled>
                    {isSubcategoriesLoading ? 'Loading...' : 'Select a sub-category...'}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Issue Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Describe the Issue
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="e.g., My car is making a strange noise when I turn the wheel."
            />
          </div>

          {/* Location and Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
                <label htmlFor="addressFull" className="block text-sm font-medium text-gray-700">
                Your Location Address
                </label>
                <input
                type="text"
                id="addressFull"
                name="addressFull"
                value={formData.addressFull}
                onChange={handleChange}
                required
                className="input-field mt-1"
                placeholder="123 Main St, New York, NY 10001"
                />
            </div>
            <div>
                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
                Preferred Date
                </label>
                <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="input-field mt-1"
                min={new Date().toISOString().split("T")[0]}
                />
            </div>
            <div>
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                Preferred Time
                </label>
                <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                className="input-field mt-1"
                />
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !formData.categoryId || !formData.subcategoryId}
              className="w-full btn-primary flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Service Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;