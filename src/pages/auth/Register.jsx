import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import {
  FiUser,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiFileText,
  FiMap,
  FiGlobe,
  FiInfo,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  OutlinedInput,
  Box,
  Chip,
} from "@mui/material";

const baseURL = "https://singleclik.com/api/public/api";

import Modal from "../../components/Modal";

const profileTypes = [
  { value: "0", label: "Business" },
  { value: "1", label: "Service" },
  { value: "0,1", label: "Business/Service" },
];

const Register = () => {
  const [profile, setProfile] = useState({
    name: "",
    company_name: "",
    mobile: "",
    email: "",
    profile_type: "",
    category: "",
    sub_category: [],
    subcategory: "", // key name in sub category to show value
    other_category: "",
    other_sub_category: "",
    whatsapp: "",
    website: "",
    photo: "",
    about_us: "",
    catg_id: "",
    area: "",
    referred_by_code: "",
  });
  const [categories, setCategories] = useState([]);
  const [categoriesSub, setCategoriesSub] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedSubCategoryValue, setSelectedSubCategoryValue] = useState([]); // change "" to []

  // for subcategories dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const avatarUrl = useRef(
    "https://avatarfiles.alphacoders.com/161/161002.jpg"
  );
  const [modalOpen, setModalOpen] = useState(false);

  const updateAvatar = (imgSrc) => {
    avatarUrl.current = imgSrc;
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/panel-fetch-register-categories`
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseURL}/panel-fetch-register-sub-categories-by-value/${
          profile.catg_id || ""
        }`
      );
      setCategoriesSub(response.data.categoriessub);
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
    }
  }, [profile?.catg_id]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (profile?.catg_id) {
      fetchSubCategories();
    }
  }, [fetchSubCategories, profile?.catg_id]);

  const validateOnlyDigits = (inputtxt) =>
    /^\d+$/.test(inputtxt) || inputtxt.length === 0;
  const validateOnlyText = (inputtxt) =>
    /^[A-Za-z ]+$/.test(inputtxt) || inputtxt === "";

  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "mobile" || name === "whatsapp") &&
      !validateOnlyDigits(value)
    )
      return;
    if (name === "company_name" && !validateOnlyText(value)) return;
    setProfile({ ...profile, [name]: value });

    if (name == "category") {
      setProfile({ ...profile, catg_id: value, sub_category: [] });
      setSelectedSubCategoryValue([]);
    }
    if (name == "sub_category") {
      const selectedOption = categoriesSub.find((sub) => sub.id === value);
      if (selectedOption) {
        setSelectedSubCategoryValue(selectedOption.subcategory); // Store the selected subcategory value
      }
    }
  };

  const handleSubCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSubCategoryValue(
      typeof value === "string" ? value.split(",") : value
    );
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    if (!selectedFile) {
      toast.error("Pls upload image.", {
        style: {
          color: "black",
          height: "6px",
        },
        autoClose: 1500,
      });

      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    Object.keys(profile).forEach((key) => {
      if (key == "category") {
        formData.append("category", profile.catg_id);
      } else if (key == "sub_category") {
        // formData.append("sub_category",profile.sub_category)
        formData.append("sub_category", selectedSubCategoryValue.join(","));
      } else if (key == "subcategory") {
        formData.append("subcategory", selectedSubCategoryValue);
      } else {
        formData.append(key, profile[key]);
      }
    });
    if (selectedFile) formData.append("photo", selectedFile);

    try {
      const res = await axios.post(`${baseURL}/panel-create-profile`, formData);
      if (res.data.code == "200") {
        toast.success("User Create succefully");
        setShowSuccessModal(true);
        setProfile({
          name: "",
          company_name: "",
          mobile: "",
          email: "",
          profile_type: "",
          category: "",
          sub_category: [],
          subcategory: "",
          other_category: "",
          other_sub_category: "",
          whatsapp: "",
          website: "",
          photo: "",
          about_us: "",
          area: "",
          referred_by_code: "",
        });
        setSelectedSubCategoryValue([]);
        avatarUrl.current =
          "https://avatarfiles.alphacoders.com/161/161002.jpg";
      } else if (res.data.code == "402") {
        toast.error("Duplicate Entry of User Mobile No ");
      } else if (res.data.code == "403") {
        toast.error("Duplicate Entry of User Email Id ");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const inputClass =
    "w-full px-3 py-2 border border-gray-400  bg-[#f3f1f2]  rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  const truncateLabel = (label) => {
    return label.length > 10 ? label.substring(0, 10) + ".." : label;
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      //   className="bg-gradient-to-br from-blue-100 to-red-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      className="bg-[url('/bcb1.jpg')] bg-cover bg-center min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto bg-[#d9eaf9]/80 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
      >
        <div className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center mb-8"
          >
            <img src="/logo.svg" alt="Logo" className="h-16" />
          </motion.div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="name"
                >
                  <FiUser className="mr-2 text-indigo-600" /> Full Name{" "}
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={onInputChange}
                  required
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="company_name"
                >
                  <FiBriefcase className="mr-2 text-green-600" /> Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={profile.company_name}
                  onChange={onInputChange}
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="mobile"
                >
                  <FiPhone className="mr-2 text-blue-600" /> Mobile No
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={profile.mobile}
                  onChange={onInputChange}
                  required
                  maxLength={10}
                  minLength={10}
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="email"
                >
                  <FiMail className="mr-2 text-red-600" /> Email Id
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={onInputChange}
                  required
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="profile_type"
                >
                  <FiFileText className="mr-2 text-purple-600" /> Business
                  Profile<span className="text-red-500">&nbsp;*</span>
                </label>
                <select
                  id="profile_type"
                  name="profile_type"
                  value={profile.profile_type}
                  onChange={onInputChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Profile Type</option>
                  {profileTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="category"
                >
                  <FiFileText className="mr-2 text-yellow-600" /> Business
                  Category<span className="text-red-500">&nbsp;*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={profile.catg_id || ""}
                  onChange={onInputChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((categoriesdata, key) => (
                    <option key={key} value={categoriesdata.id}>
                      {categoriesdata.category}
                    </option>
                  ))}
                </select>
              </motion.div>
              {profile.catg_id !== "31" && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label
                    className="text-gray-700 font-bold mb-2 flex items-center"
                    htmlFor="sub_category"
                  >
                    <FiFileText className="mr-2 text-pink-600" /> Sub Category
                    <span className="text-red-500">&nbsp;*</span>
                  </label>
                  {/* <select
                    id="sub_category"
                    name="sub_category"
                    value={profile.sub_category}
                    onChange={(e) => onInputChange(e)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select Sub Category</option>
                    {categoriesSub.map((categoriesdata, key) => (
                      <option key={key} value={categoriesdata.id}>
                        {categoriesdata.subcategory}
                      </option>
                    ))}
                  </select> */}
                  <FormControl fullWidth>
                    {/* <InputLabel id="demo-multiple-chip-label">sss</InputLabel> */}
                    <Select
                      // labelId="demo-multiple-chip-label"
                      id="demo-multiple-chip"
                      multiple
                      value={selectedSubCategoryValue}
                      onChange={handleSubCategoryChange}
                      onOpen={() => setDropdownOpen(true)}
                      onClose={() => setDropdownOpen(false)}
                      open={dropdownOpen}
                      sx={{
                        height: "40px",
                        borderRadius: "5px",
                        backgroundColor: "#f3f1f2",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                      input={
                        <OutlinedInput id="select-multiple-chip" label="" />
                      }
                      renderValue={(selected) => {
                        // console.log("Selected values:chip in", selected); // Log the selected values
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              overflowX: "auto",
                              overflowX: "hidden",
                              overflowX: "auto",
                              overflowY: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                            }}
                            className="custom-scroll mt-0 lg:mt-[8px]"
                          >
                            {selected.map((id) => {
                              const subcategory = categoriesSub.find(
                                (sub) => sub.id === id
                              );
                              console.log;
                              return (
                                <Chip
                                  sx={{
                                    backgroundColor: "gray",
                                    color: "white",
                                    fontSize: "12px",
                                  }}
                                  key={id}
                                  label={
                                    subcategory
                                      ? truncateLabel(subcategory.subcategory)
                                      : id
                                  }
                                />
                              );
                            })}
                          </Box>
                        );
                      }}
                    >
                      {categoriesSub.map((subcategory) => (
                        <MenuItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.subcategory}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
              )}
              {profile.catg_id === "31" && (
                <>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    <label
                      className="text-gray-700 font-bold mb-2 flex items-center"
                      htmlFor="other_category"
                    >
                      <FiFileText className="mr-2 text-teal-600" /> Other
                      Category<span className="text-red-500">&nbsp;*</span>
                    </label>
                    <input
                      type="text"
                      id="other_category"
                      name="other_category"
                      value={profile.other_category}
                      onChange={onInputChange}
                      required
                      placeholder="please type your buiness category..."
                      className={inputClass}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    <label
                      className="text-gray-700 font-bold mb-2 flex items-center"
                      htmlFor="other_sub_category"
                    >
                      <FiFileText className="mr-2 text-orange-600" /> Other Sub
                      Category<span className="text-red-500">&nbsp;*</span>
                    </label>
                    <input
                      type="text"
                      id="other_sub_category"
                      name="other_sub_category"
                      value={profile.other_sub_category}
                      onChange={onInputChange}
                      required
                      className={inputClass}
                    />
                  </motion.div>
                </>
              )}
              {profile.sub_category === "94" && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <label
                    className="text-gray-700 font-bold mb-2 flex items-center"
                    htmlFor="other_sub_category"
                  >
                    <FiFileText className="mr-2 text-cyan-600" /> Other Sub
                    Category<span className="text-red-500">&nbsp;*</span>
                  </label>
                  <input
                    type="text"
                    id="other_sub_category"
                    name="other_sub_category"
                    value={profile.other_sub_category}
                    onChange={onInputChange}
                    required
                    placeholder="please type..."
                    className={inputClass}
                  />
                </motion.div>
              )}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="whatsapp"
                >
                  <FiPhone className="mr-2 text-green-600" /> WhatsApp
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  required
                  value={profile.whatsapp}
                  placeholder="0123456789"
                  onChange={onInputChange}
                  maxLength={10}
                  minLength={10}
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="website"
                >
                  <FiGlobe className="mr-2 text-blue-600" /> Website
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  placeholder="abc.com"
                  value={profile.website}
                  onChange={onInputChange}
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="area"
                >
                  <FiMap className="mr-2 text-purple-600" /> Area
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={profile.area}
                  onChange={onInputChange}
                  placeholder="Btm Layout, Jayadeva, Vijaynagar, etc."
                  className={inputClass}
                />
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="photo"
                >
                  <FiUpload className="mr-2 text-indigo-600" /> User Image
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                {/* <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className={inputClass}
                /> */}
                <div
                  className={`${inputClass} flex items-center justify-between h-12 `}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={avatarUrl.current}
                      alt="Avatar"
                      className="w-10 h-10 rounded-lg border-2 border-gray-300"
                    />
                    <button
                      className={`${inputClass} bg-white hover:bg-gray-50 text-gray-700 text-sm`}
                      onClick={() => setModalOpen(true)}
                    >
                      Choose Image
                    </button>
                  </div>

                  {modalOpen && (
                    <Modal
                      onFileChange={(file) => setSelectedFile(file)}
                      updateAvatar={updateAvatar}
                      closeModal={() => setModalOpen(false)}
                    />
                  )}
                </div>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                className="sm:col-span-2"
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="about_us"
                >
                  <FiInfo className="mr-2 text-red-600" /> About Your Buisness
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <textarea
                  id="about_us"
                  name="about_us"
                  value={profile.about_us}
                  onChange={onInputChange}
                  required
                  rows={4}
                  className={inputClass}
                ></textarea>
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2 }}
                hidden
              >
                <label
                  className="text-gray-700 font-bold mb-2 flex items-center"
                  htmlFor="referred_by_code"
                >
                  <FiUser className="mr-2 text-yellow-600" /> Referred By
                </label>
                <input
                  type="text"
                  id="referred_by_code"
                  name="referred_by_code"
                  value={profile.referred_by_code}
                  onChange={onInputChange}
                  maxLength={25}
                  minLength={2}
                  className={inputClass}
                />
              </motion.div>
            </div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.2 }}
              className="flex items-center justify-between mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                hidden
              >
                <Link
                  to="/login"
                  className="px-6 py-2 text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                >
                  Cancel
                </Link>
              </motion.div>
            </motion.div>
          </form>
        </div>
      </motion.div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p className="mb-4">User created successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Register;
