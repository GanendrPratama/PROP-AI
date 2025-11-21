import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { predictPrice } from "../services/predict";

export default function Calculation() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    location: "",
    landSize: "",
    buildingArea: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    garageCapacity: "",
    yearBuilt: "",
    facilitiesText: "", // comma separated
  });

  const [extras, setExtras] = useState([{ key: "", value: "" }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
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

  const validate = () => {
    const newErr = {};
    if (!form.location?.trim()) newErr.location = "Location is required";
    if (!form.landSize || Number(form.landSize) <= 0)
      newErr.landSize = "Land size is required";
    if (!form.buildingArea || Number(form.buildingArea) <= 0)
      newErr.buildingArea = "Building area is required";
    if (!form.bedrooms || Number(form.bedrooms) < 0)
      newErr.bedrooms = "Bedrooms is required";
    if (!form.bathrooms || Number(form.bathrooms) < 0)
      newErr.bathrooms = "Bathrooms is required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
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

      const payload = {
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

      const result = await predictPrice(payload);

      // Save to sessionStorage so refresh on Result still works
      sessionStorage.setItem("propai:lastInput", JSON.stringify(payload));
      sessionStorage.setItem("propai:lastResult", JSON.stringify(result));

      navigate("/result", { state: { input: payload, result } });
    } catch (err) {
      console.error(err);
      alert("Failed to get prediction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

	return (
		<div className="flex flex-col min-h-screen bg-gray-50 w-screen">
			<NavBar />

      <main className="flex-1">
        <section className="py-6 md:py-10 px-0">
          <div className="w-full bg-white rounded-none md:rounded-xl shadow-sm border-t md:border border-gray-200 p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold text-[#395192] mb-2">
              Predict Your Property's Value
            </h1>
            <p className="text-gray-600 mb-6">
              Fill in your property details below. Fields marked with * are
              required.
            </p>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (City/Neighborhood) *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Bandung - Dago"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location}</p>
                )}
              </div>


              {/* Land Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land Size (m²) *
                </label>
                <input
                  type="number"
                  name="landSize"
                  value={form.landSize}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.landSize && (
                  <p className="text-sm text-red-600 mt-1">{errors.landSize}</p>
                )}
              </div>

              {/* Building Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Area (m²) *
                </label>
                <input
                  type="number"
                  name="buildingArea"
                  value={form.buildingArea}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.buildingArea && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.buildingArea}
                  </p>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.bedrooms && (
                  <p className="text-sm text-red-600 mt-1">{errors.bedrooms}</p>
                )}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.bathrooms && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.bathrooms}
                  </p>
                )}
              </div>

              {/* Floors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floors
                </label>
                <input
                  type="number"
                  name="floors"
                  value={form.floors}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Garage Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garage Capacity
                </label>
                <input
                  type="number"
                  name="garageCapacity"
                  value={form.garageCapacity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>


              {/* Year Built */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={form.yearBuilt}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Additional Facilities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Facilities
                </label>
                <input
                  type="text"
                  name="facilitiesText"
                  value={form.facilitiesText}
                  onChange={handleChange}
                  placeholder="Comma separated, e.g., Garden, Swimming Pool, Security 24h"
                  className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can also add custom parameters below.
                </p>
              </div>

              {/* Extra parameters */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Parameters
                  </label>
                  <button
                    type="button"
                    onClick={addExtra}
                    className="text-sm bg-[#395192] text-white px-3 py-1 rounded-md hover:opacity-90"
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
                        className="col-span-5 px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <input
                        type="text"
                        value={ex.value}
                        onChange={(e) =>
                          handleExtraChange(idx, "value", e.target.value)
                        }
                        placeholder="Value (e.g., Yes)"
                        className="col-span-5 px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtra(idx)}
                        className="col-span-1 px-4 py-2 bg-white text-red-600 border border-gray-300 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  className="bg-[#395192] text-white font-semibold px-5 py-2 rounded-md hover:bg-white hover:text-[#395192] hover:border hover:border-[#395192]"
                  onClick={() => {
                    setForm({
                      location: "",
                      landSize: "",
                      buildingArea: "",
                      bedrooms: "",
                      bathrooms: "",
                      floors: "",
                      garageCapacity: "",
                      yearBuilt: "",
                      facilitiesText: "",
                    });
                    setExtras([{ key: "", value: "" }]);
                    setErrors({});
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#8F333E] text-white font-semibold px-6 py-2 rounded-md disabled:opacity-60 hover:bg-white hover:text-[#8F333E] hover:border hover:border-[#8F333E]"
                >
                  {submitting ? "Predicting…" : "Predict Price"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>


      <Footer />
    </div>
  );
}
