import axios from 'axios';

export const fetchGyms = (sortBy = null, sortDir = 'asc') => {
    const params = sortBy ? { sortBy, sortDir } : {};
    return fetch(`${process.env.REACT_APP_API_URL}/gyms?` + new URLSearchParams(params), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch gyms");
            return response.json();
        });
};

export const addGym = (gym, file) => {
    const formData = new FormData();
    formData.append("gym", new Blob([JSON.stringify(gym)], { type: "application/json" }));
    if (file) formData.append("file", file);

    return fetch(`${process.env.REACT_APP_API_URL}/gyms`, {
        method: "POST",
        body: formData,
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to add gym");
            return response.json();
        });
};

export const updateGym = (gym, id, file) => {
    const formData = new FormData();
    formData.append("gym", new Blob([JSON.stringify(gym)], { type: "application/json" }));
    if (file) formData.append("file", file);

    return fetch(`${process.env.REACT_APP_API_URL}/gyms/${id}`, {
        method: "PUT",
        body: formData,
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to update gym");
            return response.json();
        });
};

export const deleteGym = (id) => {
    return fetch(`${process.env.REACT_APP_API_URL}/gyms/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to delete gym");
            return response;
        });
};

export const fetchTrainers = () => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch trainers");
            return response.json();
        });
};

export const addTrainer = (trainer) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to add trainer");
            return response.json();
        });
};

export const updateTrainer = (trainer, id) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to update trainer");
            return response.json();
        });
};

export const deleteTrainer = (id) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to delete trainer");
            return response;
        });
};

export const assignTrainerToGym = (trainerId, gymId) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers/${trainerId}/gyms/${gymId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to assign trainer to gym");
            return response;
        });
};

export const removeTrainerFromGym = (trainerId, gymId) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers/${trainerId}/gyms/${gymId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to remove trainer from gym");
            return response;
        });
};

export const fetchGymsByTrainer = (trainerId, sortBy = null, sortDir = 'asc') => {
    const params = sortBy ? { trainerId, sortBy, sortDir } : { trainerId };
    return fetch(`${process.env.REACT_APP_API_URL}/gyms/trainer?` + new URLSearchParams(params), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch gyms by trainer");
            return response.json();
        });
};

export const fetchTrainersBySpecialty = (specialty) => {
    return fetch(`${process.env.REACT_APP_API_URL}/trainers/specialty?specialty=${specialty}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch trainers by specialty");
            return response.json();
        });
};