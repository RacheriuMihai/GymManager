import React, { useState, useRef, useEffect } from "react";
import "./styles.css";
import { fetchGyms, addGym, updateGym, deleteGym, fetchTrainers, addTrainer, updateTrainer, deleteTrainer, assignTrainerToGym, removeTrainerFromGym, fetchGymsByTrainer, fetchTrainersBySpecialty } from './api';
import Decimal from 'decimal.js';

const App = () => {
    const [gyms, setGyms] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedGym, setSelectedGym] = useState(null);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [search, setSearch] = useState("");
    const [priceFilter, setPriceFilter] = useState(100);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [ratingSearch, setRatingSearch] = useState("");
    const [trainerFilter, setTrainerFilter] = useState("");
    const [specialtySearch, setSpecialtySearch] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortDir, setSortDir] = useState("asc");
    const [gymData, setGymData] = useState({
        name: "",
        location: "",
        openHours: "",
        price: "",
        rating: "",
        file: null
    });
    const [trainerData, setTrainerData] = useState({
        name: "",
        specialty: "",
        experience: ""
    });
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const gymListRef = useRef();

    let cheapestGymId = null;
    let mostExpensiveGymId = null;
    let closestToAverageGymId = null;

    const refreshGyms = () => {
        fetchGyms(sortBy, sortDir)
            .then(data => {
                console.log("Fetched gyms:", data);
                setGyms(data || []);
                findIds(data || []);
            })
            .catch(error => {
                console.error("Error fetching gyms:", error);
                alert("Failed to fetch gyms. Ensure the backend is running at http://localhost:8080.");
                setGyms([]);
            });
    };

    const refreshTrainers = () => {
        fetchTrainers()
            .then(data => {
                console.log("Fetched trainers:", data);
                setTrainers(data || []);
                if (!data || data.length === 0) {
                    console.warn("No trainers returned from /trainers. Check database 'Trainers' table or backend logs.");
                }
            })
            .catch(error => {
                console.error("Error fetching trainers:", error);
                alert("Failed to fetch trainers. Check the backend at http://localhost:8080/trainers and ensure the Trainers table is populated.");
                setTrainers([]);
            });
    };

    useEffect(() => {
        refreshGyms();
        refreshTrainers();
    }, [sortBy, sortDir]);

    const findIds = (gymList) => {
        const sortedGyms = [...gymList].sort((a, b) =>
            new Decimal(a.price.toString()).cmp(new Decimal(b.price.toString()))
        );
        cheapestGymId = sortedGyms[0]?.id;
        mostExpensiveGymId = sortedGyms[sortedGyms.length - 1]?.id;
        closestToAverageGymId = sortedGyms[Math.floor(sortedGyms.length / 2)]?.id;
    };

    const openForm = (type) => {
        if ((type === "updateGym" || type === "deleteGym") && !selectedGym) return;
        if ((type === "updateTrainer" || type === "deleteTrainer") && !selectedTrainer) return;
        setFormType(type);
        setShowForm(true);
        if (type === "updateGym" && selectedGym) {
            setGymData({
                name: selectedGym.name,
                location: selectedGym.location,
                openHours: selectedGym.openHours,
                price: selectedGym.price.toString(),
                rating: selectedGym.rating.toString(),
                file: null
            });
        } else if (type === "updateTrainer" && selectedTrainer) {
            setTrainerData({
                name: selectedTrainer.name,
                specialty: selectedTrainer.specialty,
                experience: selectedTrainer.experience.toString()
            });
        } else {
            setGymData({ name: "", location: "", openHours: "", price: "", rating: "", file: null });
            setTrainerData({ name: "", specialty: "", experience: "" });
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setFormType("");
    };

    const handleGymChange = (e) => {
        const { name, value } = e.target;
        setGymData({ ...gymData, [name]: value });
    };

    const handleTrainerChange = (e) => {
        const { name, value } = e.target;
        setTrainerData({ ...trainerData, [name]: value });
    };

    const handleFileChange = (e) => {
        setGymData({ ...gymData, file: e.target.files[0] });
    };

    const handleGymSubmit = () => {
        const { name, price, openHours, location, rating, file } = gymData;

        if (!name || !price || !location || !rating || !openHours) {
            alert("All fields are required.");
            return;
        }

        const gymPayload = {
            name,
            location,
            openHours,
            price: Number(price),
            rating: Number(rating),
        };

        if (formType === "addGym") {
            addGym(gymPayload, file)
                .then(() => refreshGyms())
                .catch(error => alert("Failed to add gym: " + error.message));
        } else if (formType === "updateGym") {
            updateGym(gymPayload, selectedGym.id, file)
                .then(() => refreshGyms())
                .catch(error => alert("Failed to update gym: " + error.message));
        }
        closeForm();
    };

    const handleTrainerSubmit = () => {
        const { name, specialty, experience } = trainerData;

        if (!name || !specialty || !experience) {
            alert("All fields are required.");
            return;
        }

        const trainerPayload = {
            name,
            specialty,
            experience: Number(experience)
        };

        if (formType === "addTrainer") {
            addTrainer(trainerPayload)
                .then(() => refreshTrainers())
                .catch(error => alert("Failed to add trainer: " + error.message));
        } else if (formType === "updateTrainer") {
            updateTrainer(trainerPayload, selectedTrainer.id)
                .then(() => refreshTrainers())
                .catch(error => alert("Failed to update trainer: " + error.message));
        }
        closeForm();
    };

    const handleDeleteGym = () => {
        deleteGym(selectedGym.id)
            .then(() => {
                refreshGyms();
                setSelectedGym(null);
            })
            .catch(error => alert("Error deleting gym: " + error.message));
        closeForm();
    };

    const handleDeleteTrainer = () => {
        deleteTrainer(selectedTrainer.id)
            .then(() => {
                refreshTrainers();
                setSelectedTrainer(null);
            })
            .catch(error => alert("Error deleting trainer: " + error.message));
        closeForm();
    };

    const handleAssignTrainer = () => {
        if (!selectedGym || !selectedTrainer) {
            alert("Select both a gym and a trainer.");
            return;
        }
        assignTrainerToGym(selectedTrainer.id, selectedGym.id)
            .then(() => refreshGyms())
            .catch(error => alert("Failed to assign trainer: " + error.message));
        closeForm();
    };

    const handleRemoveTrainer = () => {
        if (!selectedGym || !selectedTrainer) {
            alert("Select both a gym and a trainer.");
            return;
        }
        removeTrainerFromGym(selectedTrainer.id, selectedGym.id)
            .then(() => refreshGyms())
            .catch(error => alert("Failed to remove trainer: " + error.message));
        closeForm();
    };

    const handleDownload = (id) => {
        window.open(`http://localhost:8080/gyms/download/${id}`, '_blank');
    };

    const handleTrainerFilter = () => {
        if (trainerFilter) {
            fetchGymsByTrainer(Number(trainerFilter), sortBy, sortDir)
                .then(data => {
                    console.log("Fetched gyms by trainer:", data);
                    setGyms(data || []);
                })
                .catch(error => {
                    console.error("Error fetching gyms by trainer:", error);
                    setGyms([]);
                });
        } else {
            refreshGyms();
        }
    };

    const handleSpecialtySearch = () => {
        if (specialtySearch.trim()) {
            fetchTrainersBySpecialty(specialtySearch.trim())
                .then(data => {
                    console.log("Fetched trainers by specialty:", data);
                    setTrainers(data || []);
                })
                .catch(error => {
                    console.error("Error fetching trainers by specialty:", error);
                    alert("Failed to fetch trainers by specialty. Showing all trainers.");
                    refreshTrainers();
                });
        } else {
            refreshTrainers();
        }
    };

    const filteredGyms = gyms.filter((gym) => {
        const matchesNameSearch = gym.name?.toLowerCase().includes(search.toLowerCase()) || false;
        const matchesRatingSearch = ratingSearch === "" || (gym.rating && parseFloat(gym.rating) >= parseFloat(ratingSearch));
        return matchesNameSearch && matchesRatingSearch &&
            (gym.price && parseFloat(gym.price) <= priceFilter) &&
            (gym.rating && parseFloat(gym.rating) >= ratingFilter);
    });

    console.log("Filtered gyms:", filteredGyms);
    console.log("All trainers:", trainers);

    return (
        <div className="app-container">
            <div className="sidebar">
                <h1 className="title">GymManager</h1>
                <input
                    type="text"
                    placeholder="Search for gym"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-bar"
                />
                <button className="btn" onClick={() => setShowFilters(!showFilters)}>
                    Filters
                </button>
                {showFilters && (
                    <div className="filters">
                        <div className="filter-group">
                            <label htmlFor="price-slider">Max Price: ${priceFilter}</label>
                            <input
                                type="range"
                                id="price-slider"
                                min="0"
                                max="100"
                                step="1"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(Number(e.target.value))}
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="rating-slider">Min Rating: {ratingFilter}</label>
                            <input
                                type="range"
                                id="rating-slider"
                                min="0"
                                max="5"
                                step="0.1"
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(Number(e.target.value))}
                            />
                        </div>
                        <input
                            className="search-bar-hours"
                            type="text"
                            placeholder="Search by Rating (e.g., '4')"
                            value={ratingSearch}
                            onChange={(e) => setRatingSearch(e.target.value)}
                        />
                        <select
                            value={trainerFilter}
                            onChange={(e) => setTrainerFilter(e.target.value)}
                            onBlur={handleTrainerFilter}
                            className="search-bar"
                        >
                            <option value="">All Trainers</option>
                            {trainers.map(trainer => (
                                <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                            ))}
                        </select>
                        <div className="filter-group">
                            <label>Sort By:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="search-bar"
                            >
                                <option value="id">ID</option>
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="rating">Rating</option>
                            </select>
                            <select
                                value={sortDir}
                                onChange={(e) => setSortDir(e.target.value)}
                                className="search-bar"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                )}
                <div className="controls">
                    <button className="btn" onClick={() => openForm("addGym")}>Add Gym</button>
                    <button className="btn update" onClick={() => openForm("updateGym")} disabled={!selectedGym}>Update Gym</button>
                    <button className="btn delete" onClick={() => openForm("deleteGym")} disabled={!selectedGym}>Delete Gym</button>
                    <button className="btn" onClick={() => openForm("addTrainer")}>Add Trainer</button>
                    <button className="btn update" onClick={() => openForm("updateTrainer")} disabled={!selectedTrainer}>Updates Trainer</button>
                    <button className="btn delete" onClick={() => openForm("deleteTrainer")} disabled={!selectedTrainer}>Delete Trainer</button>
                    <button className="btn" onClick={() => openForm("assignTrainer")}>Assign Trainer</button>
                    <button className="btn" onClick={() => openForm("removeTrainer")}>Remove Trainer</button>
                </div>
            </div>

            <div className="main-content">
                <div className="gym-list">
                    {filteredGyms.length === 0 ? (
                        <p>No gyms found. Try adjusting filters, check the backend at http://localhost:8080, or ensure the Gyms table is populated.</p>
                    ) : (
                        filteredGyms.map((gym) => (
                            <div
                                key={gym.id}
                                className={`gym-card ${selectedGym && selectedGym.id === gym.id ? "selected" : ""}`}
                                onClick={() => setSelectedGym(gym)}
                            >
                                <div
                                    className={`card-header ${
                                        gym.id === cheapestGymId
                                            ? "cheapest"
                                            : gym.id === mostExpensiveGymId
                                                ? "most-expensive"
                                                : gym.id === closestToAverageGymId
                                                    ? "closest-to-average"
                                                    : ""
                                    }`}
                                >
                                    <h3>{gym.name}</h3>
                                </div>
                                <div className="card-info">
                                    <p><strong>Location:</strong> {gym.location}</p>
                                    <p><strong>Price:</strong> ${Number(gym.price).toFixed(2)}</p>
                                    <p><strong>Open Hours:</strong> {gym.openHours}</p>
                                    <p><strong>Rating:</strong> {Number(gym.rating).toFixed(2)}</p>
                                    <p><strong>Trainers:</strong> {gym.trainers?.map(t => t.name).join(", ") || "None"}</p>
                                    {gym.filePath && (
                                        <button
                                            className="btn download"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(gym.id);
                                            }}
                                        >
                                            Download File
                                        </button>
                                    )}
                                </div>
                                {gym.filePath && (
                                    <div className="card-file-display">
                                        {gym.filePath.endsWith('.mp4') || gym.filePath.endsWith('.webm') || gym.filePath.endsWith('.ogg') ? (
                                            <video
                                                controls
                                                width="100%"
                                                height="100%"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            >
                                                <source
                                                    src={`http://localhost:8080/gyms/download/${gym.id}`}
                                                    type={gym.filePath.endsWith('.mp4') ? 'video/mp4' : gym.filePath.endsWith('.webm') ? 'video/webm' : 'video/ogg'}
                                                />
                                            </video>
                                        ) : (
                                            <img
                                                src={`http://localhost:8080/gyms/download/${gym.id}`}
                                                alt="Gym file"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        )}
                                        <div
                                            className="file-info"
                                            style={{display: 'none'}}
                                        >
                                            Media preview not available
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="trainer-list">
                    <h2>Trainers</h2>
                    <input
                        type="text"
                        placeholder="Search by Specialty (e.g., Yoga)"
                        value={specialtySearch}
                        onChange={(e) => setSpecialtySearch(e.target.value)}
                        onBlur={handleSpecialtySearch}
                        onKeyPress={(e) => e.key === 'Enter' && handleSpecialtySearch()}
                        className="search-bar"
                    />
                    {trainers.length === 0 ? (
                        <p>No trainers found. Check the backend at http://localhost:8080/trainers or ensure the Trainers table is populated with data (e.g., John Doe, Jane Smith, Mike Johnson). Try adding a trainer using the 'Add Trainer' button.</p>
                    ) : (
                        trainers.map((trainer) => (
                            <div
                                key={trainer.id}
                                className={`trainer-card ${selectedTrainer && selectedTrainer.id === trainer.id ? "selected" : ""}`}
                                onClick={() => setSelectedTrainer(trainer)}
                            >
                                <h3>{trainer.name}</h3>
                                <p><strong>Specialty:</strong> {trainer.specialty}</p>
                                <p><strong>Experience:</strong> {trainer.experience} years</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showForm && (
                <div className="custom-form-overlay">
                    <div className="custom-form">
                        {formType === "deleteGym" ? (
                            <>
                                <h2>Are you sure?</h2>
                                <div className="btn-group">
                                    <button className="btn confirm" onClick={handleDeleteGym}>Yes</button>
                                    <button className="btn cancel" onClick={closeForm}>No</button>
                                </div>
                            </>
                        ) : formType === "deleteTrainer" ? (
                            <>
                                <h2>Are you sure?</h2>
                                <div className="btn-group">
                                    <button className="btn confirm" onClick={handleDeleteTrainer}>Yes</button>
                                    <button className="btn cancel" onClick={closeForm}>No</button>
                                </div>
                            </>
                        ) : formType === "assignTrainer" ? (
                            <>
                                <h2>Assign Trainer to Gym</h2>
                                <p>Select a gym and trainer to assign.</p>
                                <div className="btn-group">
                                    <button className="btn save" onClick={handleAssignTrainer}>Assign</button>
                                    <button className="btn cancel" onClick={closeForm}>Cancel</button>
                                </div>
                            </>
                        ) : formType === "removeTrainer" ? (
                            <>
                                <h2>Remove Trainer from Gym</h2>
                                <p>Select a gym and trainer to remove.</p>
                                <div className="btn-group">
                                    <button className="btn save" onClick={handleRemoveTrainer}>Remove</button>
                                    <button className="btn cancel" onClick={closeForm}>Cancel</button>
                                </div>
                            </>
                        ) : formType === "addTrainer" || formType === "updateTrainer" ? (
                            <>
                                <h2>{formType === "addTrainer" ? "Add Trainer" : "Update Trainer"}</h2>
                                <input
                                    name="name"
                                    value={trainerData.name}
                                    onChange={handleTrainerChange}
                                    placeholder="Trainer Name"
                                />
                                <input
                                    name="specialty"
                                    value={trainerData.specialty}
                                    onChange={handleTrainerChange}
                                    placeholder="Specialty"
                                />
                                <input
                                    name="experience"
                                    type="number"
                                    value={trainerData.experience}
                                    onChange={handleTrainerChange}
                                    placeholder="Experience (years)"
                                />
                                <div className="btn-group">
                                    <button className="btn save" onClick={handleTrainerSubmit}>Save</button>
                                    <button className="btn cancel" onClick={closeForm}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>{formType === "addGym" ? "Add Gym" : "Update Gym"}</h2>
                                <input
                                    name="name"
                                    value={gymData.name}
                                    onChange={handleGymChange}
                                    placeholder="Gym Name"
                                />
                                <input
                                    name="location"
                                    value={gymData.location}
                                    onChange={handleGymChange}
                                    placeholder="Location"
                                />
                                <input
                                    name="openHours"
                                    value={gymData.openHours}
                                    onChange={handleGymChange}
                                    placeholder="Open Hours"
                                />
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={gymData.price}
                                    onChange={handleGymChange}
                                    placeholder="Price"
                                />
                                <input
                                    name="rating"
                                    type="number"
                                    step="0.1"
                                    value={gymData.rating}
                                    onChange={handleGymChange}
                                    placeholder="Rating"
                                />
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleFileChange}
                                />
                                <div className="btn-group">
                                    <button className="btn save" onClick={handleGymSubmit}>Save</button>
                                    <button className="btn cancel" onClick={closeForm}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;