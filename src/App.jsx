import axios from "axios";
import Lottie from "lottie-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import loadingAnimation from "./assets/animation/loading.json";
import searchanimation from "./assets/animation/search.json";
import { FaDownload, FaTimes } from "react-icons/fa";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const IMAGES_PER_PAGE = 20;

function ImageSearchApp() {
  const searchInputRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = useCallback(async () => {
    try {
      if (searchInputRef.current.value) {
        setErrorMsg("");
        setLoading(true);
        const { data } = await axios.get(
          `${UNSPLASH_API_URL}?query=${
            searchInputRef.current.value
          }&page=${currentPage}&per_page=${IMAGES_PER_PAGE}&client_id=${
            import.meta.env.VITE_API_KEY
          }`
        );
        setSearchResults(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("Please check your internet connection and try again.");
      console.error(error);
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setCurrentPage(1);
    fetchImages();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    resetSearch();
  };

  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const handleDownload = async () => {
    if (selectedImage) {
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "image.jpg");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading image: ", error);
      }
    }
  };

  return (
    <div className="container">
      <div className="search-animation">
        <Lottie
          animationData={searchanimation}
          style={{ width: "200px", height: "200px" }}
        />
      </div>
      <h1 className="title">Search your images here</h1>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <div className="search-section">
        <Form onSubmit={handleSearch}>
          <Form.Control
            type="search"
            placeholder="Search here.."
            className="search-input"
            ref={searchInputRef}
          />
        </Form>
      </div>
      {loading ? (
        <div className="loading">
          <div className="center">
            <Lottie
              animationData={loadingAnimation}
              style={{ width: "200px", height: "200px" }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="images">
            {searchResults.map((image) => (
              <img
                key={image.id}
                src={image.urls.small}
                alt={image.alt_description}
                className="image"
                onClick={() => openImage(image.urls.full)}
              />
            ))}
          </div>
          <div className="buttons">
            {currentPage > 1 && (
              <Button onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </Button>
            )}
            {currentPage < totalPages && (
              <Button onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </Button>
            )}
          </div>
        </>
      )}
      {selectedImage && (
        <div className="lightbox" onClick={closeImage}>
          <div className="lightbox-content">
            <img
              src={selectedImage}
              alt="Expanded"
              className="lightbox-image"
            />
            <div className="close-download-container">
              <button className="close-button" onClick={closeImage}>
                <FaTimes size={15}/>
              </button>
              <button onClick={handleDownload} className="download-button">
                <FaDownload size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSearchApp;
