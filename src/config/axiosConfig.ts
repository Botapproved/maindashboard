import axios from "axios";

const BASE_URL = "https://nirvana-api-fpij.onrender.com/api/";

export default axios.create({
  baseURL: BASE_URL,
});
