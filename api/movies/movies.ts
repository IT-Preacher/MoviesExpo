import axios from "axios";

const BASE_URL = 'http://localhost:3001/movies';

export const fetchMovies = async () => 
    await axios.get(BASE_URL)
    .then((response) => response.data)
    .catch((error) => error);

export const fetchMovieById = async (id: string) => 
    await axios.get(`${BASE_URL}/${id}`)
    .then((response) => response.data)
    .catch((error) => error);