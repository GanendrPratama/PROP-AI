import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { predictPrice } from "../services/predict";
import { formatCurrencyIDR } from "../utils/format";
import { getUser } from "../utils/auth";
import { createHousingAd, uploadImage, addImageToAd } from '../services/housingAd';

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    landSize: "",
    buildingArea: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    garageCapacity: "",
    yearBuilt: "",
    facilitiesText: "",
    listingPrice: "",
    contactPhone: '',
  });
  const [extras, setExtras] = useState([{ key: "", value: "" }]);
  const [errors, setErrors] = useState({});
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleExtraChange = (index, field, value) => {
    setExtras((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addExtra = () => setExtras((prev) => [...prev, { key: "", value: "" }]);
  const removeExtra = (index) =>
    setExtras((prev) => prev.filter((_, i) => i !== index));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const validFiles = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`)
        continue
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      })
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles])
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  };

  const validate = () => {
    const nErr = {};
    if (!form.title?.trim()) nErr.title = "Title is required";
    if (!form.location?.trim()) nErr.location = "Location is required";
    if (!form.landSize || Number(form.landSize) <= 0)
      nErr.landSize = "Land size is required";
    if (!form.buildingArea || Number(form.buildingArea) <= 0)
      nErr.buildingArea = "Building area is required";
    if (!form.bedrooms || Number(form.bedrooms) < 0)
      nErr.bedrooms = "Bedrooms is required";
    if (!form.bathrooms || Number(form.bathrooms) < 0)
      nErr.bathrooms = "Bathrooms is required";
    if (!form.contactPhone?.trim()) nErr.contactPhone = 'Contact phone is required';

    setErrors(nErr);
    return Object.keys(nErr).length === 0;
  };

  const buildPayload = () => {
    const facilities = form.facilitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const extrasObj = extras
      .filter((x) => x.key.trim())
      .reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});

    return {
      location: form.location,
      landSize: Number(form.landSize),
      buildingArea: Number(form.buildingArea),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      floors: form.floors ? Number(form.floors) : 0,
      garageCapacity: form.garageCapacity ? Number(form.garageCapacity) : 0,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      facilities,
      extras: extrasObj,
    };
  };

  const getSuggestion = async () => {
    if (!validate()) return;
    setLoadingSuggest(true);
    try {
      const payload = buildPayload();
      const res = await predictPrice(payload);
      setSuggestion(res);
      if (!form.listingPrice) {
        setForm((f) => ({ ...f, listingPrice: res.estimatedPrice }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to get suggested price.");
    } finally {
      setLoadingSuggest(false);
    }
  };

  const submitListing = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const user = getUser();
    if (!user || !user.user_id) {
      alert('Please login to create a listing.');
      navigate('/login');
      return;
    }

    // Siapkan payload sesuai backend
    const adData = {
      user_id: user.user_id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.listingPrice || 0),
      address: form.location,
      city: form.location,
      province: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      land_size_sqm: Number(form.landSize),
      building_size_sqm: Number(form.buildingArea),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      garage_capacity: Number(form.garageCapacity || 0),
      facilities: form.facilitiesText,
      contact_phone: form.contactPhone
    };

    try {
      const result = await createHousingAd(adData);
      if (result.success) {
        const adId = result.data.ad_id;
        // Upload gambar jika ada
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const uploadResult = await uploadImage(images[i].file);
            await addImageToAd(adId, {
              cloudinary_url: uploadResult.payload.url,
              cloudinary_public_id: uploadResult.payload.public_id,
              is_primary: i === 0
            });
          }
        }
        alert('Listing created successfully!');
        navigate('/my-listings');
      } else {
        alert(result.message || 'Failed to create listing.');
      }
    } catch (err) {
      alert(err.message || 'Failed to create listing.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <NavBar />
      <main className="flex-1">
        <section className="py-6 md:py-10 px-0">
          <div className="w-full bg-white rounded-none md:rounded-xl shadow-sm border-t md:border border-gray-200 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#395192]">
                Create Property Listing
              </h1>
              <button
                type="button"
                onClick={getSuggestion}
                disabled={loadingSuggest}
                className="bg-[#395192] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {loadingSuggest
                  ? "Getting AI Suggestion…"
                  : "Get AI Suggested Price"}
              </button>
            </div>
            {suggestion ? (
              <div className="mb-6 bg-[#f9fafb] border rounded-lg p-4">
                <p className="text-sm text-gray-700">AI suggested price</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatCurrencyIDR(suggestion.estimatedPrice)}
                </p>
                <p className="text-xs text-gray-500">
                  This is a suggestion only. You can set your own price.
                </p>
              </div>
            ) : null}

            <form
              onSubmit={submitListing}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={change}
                  placeholder="e.g., Rumah 2 Lantai di Dago, Bandung"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.title ? (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                ) : null}
              </div>


              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={change}
                  rows={3}
                  placeholder="Describe your property (nearby facilities, renovations, etc.)"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (City/Neighborhood) *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={change}
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.location ? (
                  <p className="text-sm text-red-600 mt-1">{errors.location}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land Size (m²) *
                </label>
                <input
                  type="number"
                  name="landSize"
                  value={form.landSize}
                  onChange={change}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.landSize ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.landSize ? (
                  <p className="text-sm text-red-600 mt-1">{errors.landSize}</p>
                ) : null}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Area (m²) *
                </label>
                <input
                  type="number"
                  name="buildingArea"
                  value={form.buildingArea}
                  onChange={change}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.buildingArea ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.buildingArea ? (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.buildingArea}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={change}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bedrooms ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.bedrooms ? (
                  <p className="text-sm text-red-600 mt-1">{errors.bedrooms}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={change}
                  min="0"
                  step="1"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bathrooms ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.bathrooms ? (
                  <p className="text-sm text-red-600 mt-1">{errors.bathrooms}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garage Capacity
                </label>
                <input
                  type="number"
                  name="garageCapacity"
                  value={form.garageCapacity}
                  onChange={change}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={change}
                  placeholder="e.g., 08123456789"
                  className={`w-full px-4 py-2 bg-white text-black border rounded-lg transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactPhone ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.contactPhone ? (
                  <p className="text-sm text-red-600 mt-1">{errors.contactPhone}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Parameters
                  </label>
                  <button
                    type="button"
                    onClick={addExtra}
                    className="text-sm bg-[#395192] text-white px-4 py-2 rounded-lg hover:bg-[#2f4178] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    + Add parameter
                  </button>
                </div>

                <div className="space-y-3">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={ex.key}
                        onChange={(e) =>
                          handleExtraChange(idx, "key", e.target.value)
                        }
                        placeholder="Parameter name (e.g., Near MRT)"
                        className="col-span-5 w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <input
                        type="text"
                        value={ex.value}
                        onChange={(e) =>
                          handleExtraChange(idx, "value", e.target.value)
                        }
                        placeholder="Value (e.g., Yes)"
                        className="col-span-6 w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtra(idx)}
                        className="col-span-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        aria-label="Remove"
                      >
                        ✕
                      </button>

                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col items-center gap-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Listing Price (IDR)
                  </label>
                  <input
                    type="number"
                    name="listingPrice"
                    value={form.listingPrice}
                    onChange={change}
                    className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  {suggestion ? (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      AI suggests {formatCurrencyIDR(suggestion.estimatedPrice)}{" "}
                      — feel free to adjust.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Use the button above to get an AI suggestion.
                    </p>
                  )}
                </div>


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center cursor-pointer ${uploadingImage ? 'opacity-60' : ''}`}
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload images (max 5MB each)'}
                      </span>
                    </label>

                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img.preview}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload up to 10 images. First image will be the primary photo.</p>
                </div>


                <div className="w-full md:w-1/3 flex justify-center">
                  <button
                    type="submit"
                    className="w-full bg-[#8F333E] text-white font-semibold px-6 py-2 rounded-lg border-2 border-[#8F333E] hover:bg-white hover:text-[#8F333E] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  >
                    Publish Listing
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
