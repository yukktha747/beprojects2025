import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

async function login(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/`, {
            username,
            password,
        });

        if (response.status === 200) {
            const token = response.data.access;
            const refresh = response.data.refresh;
            localStorage.setItem('token', token);
            localStorage.setItem('refresh', refresh);
            console.log("Login successful");
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

async function register(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/register/`, {
            username,
            password,
        });

        if (response.status === 201) {
            console.log("Registration successful");
            login(username, password);
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

function getToken() {
    return localStorage.getItem("token");
}

function getRefreshToken() {
    return localStorage.getItem('refresh');
}

function deleteToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
}

async function logoutBlacklist() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/logout/`, {
            "refresh": getRefreshToken(),
        }, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
        if (response.status === 200) {
            deleteToken();
            console.log("Logout successful");
            return true;
        }
    } catch (error) {
        return false;
    }
}

function isLoggedIn() {
    return Boolean(getToken());
}

const authAxios = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

authAxios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

async function uploadFiles(files, privacy = 'public') {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        formData.append('privacy', privacy);

        const response = await authAxios.post('/vault/upload_files/', formData);
        return response.data;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function getPublicImages(limit = 10, offset = 0) {
    try {
        const response = await authAxios.get(`/vault/get_all_public_photos/?limit=${limit}&offset=${offset}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

async function getPrivateImages(limit = 10, offset = 0) {
    try {
        const response = await authAxios.get(`/vault/get_user_private_images/?limit=${limit}&offset=${offset}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

async function getPrivateDocuments(limit = 10, offset = 0) {
    try {
        const response = await authAxios.get(`/vault/get_user_documents_private/?limit=${limit}&offset=${offset}`);
        return response.data.results.private_documents;
    } catch (error) {
        console.log(error);
    }
}

async function getPublicDocuments(limit = 10, offset = 0) {
    try {
        const response = await authAxios.get(`/vault/get_all_public_documents/?limit=${limit}&offset=${offset}`);
        console.log(response.data.results);
        return response.data.results.public_documents;
    } catch (error) {
        console.log(error);
    }
}

async function addToFavorites(id) {
    try {
        console.log(id);
        const response = await authAxios.post('/vault/add_to_favorites/', { "id": id });
        return response.data;
    } catch (error) {
        return false;
    }
}

async function removeFromFavorites(imageId) {
    try {
        const response = await authAxios.post('/vault/remove_from_favorites/', { image_id: imageId });
        return response.data;
    } catch (error) {
        return false;
    }
}

async function getUserFavorites() {
    try {
        const response = await authAxios.get('/vault/get_user_favorites/');
        return response.data.favorites;
    } catch (error) {
        console.log(error);
    }
}

async function checkIsFavorite(id) {
    if (id) {
        try {
            const response = await authAxios.get(`/vault/is_favorite/${id}/`);
            return response.data.is_favorite;
        } catch (error) {
            console.log(error);
        }
    }
}

async function changeFilePrivacy(id, privacy) {
    try {
        const response = await authAxios.post('/vault/change_file_privacy/', {
            image_id: id,
            privacy: privacy, // Should be either 'public' or 'private'
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error("Error changing file privacy:", error);
        console.log(error);
    }
}

async function getUserTrash() {
    try {
        const response = await authAxios.get('/vault/get_user_trash/');
        return response.data.trash;
    } catch (error) {
        console.log(error);
    }
}

async function markAsTrash(id) {
    try {
        const response = await authAxios.post('/vault/mark_image_as_trash/', { image_id: id });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

async function restoreFromTrash(id) {
    try {
        const response = await authAxios.post('/vault/restore_from_trash/', { image_id: id });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

async function search(query, documentType = null) {
    try {
        const params = {
            query: query,
        };

        if (documentType) {
            params.document_type = documentType;
        }

        const response = await authAxios.get('/vault/search/', { params });
        return response.data.results;
    } catch (error) {
        console.error("Error searching images:", error);
        return [];
    }
}

export {
    // Auth exports
    login, // Done
    register, // Done
    getToken, // Done
    getRefreshToken, // Done
    deleteToken, // Done
    logoutBlacklist, // Done
    isLoggedIn, // Done
    // Vault exports
    uploadFiles, // Done
    getPublicImages, // Done
    getPrivateImages, // Done
    getPrivateDocuments, // Done
    getPublicDocuments, // Done
    addToFavorites, // Done
    removeFromFavorites, // Done
    getUserFavorites, // Done
    checkIsFavorite, // Done
    changeFilePrivacy, // Done
    getUserTrash, // Done
    markAsTrash, // Done
    restoreFromTrash, // Done
    search,
};