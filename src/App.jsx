import axios from "axios";
import Lottie from "lottie-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import loadingAnimation from "./assets/animation/loading.json";
import searchanimation from "./assets/animation/search.json";
import { FaDownload, FaTimes } from "react-icons/fa";
import githubIcon from './assets/icons/github.png';
import linkedinIcon from './assets/icons/linkedin.png';
import './App.css';

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
  const [searchKey, setSearchKey] = useState(0); 

  const fetchImages = useCallback(async () => {
    try {
      if (searchInputRef.current.value) {
        setErrorMsg("");
        setLoading(true);
        const { data } = await axios.get(
          `${UNSPLASH_API_URL}?query=${searchInputRef.current.value}&page=${currentPage}&per_page=${IMAGES_PER_PAGE}&client_id=${import.meta.env.VITE_API_KEY}`
        );
        if (data.results.length === 0) {
          setErrorMsg("No photos found. Please try some different search item.");
        } else {
          setSearchResults(data.results);
          setTotalPages(data.total_pages);
        }
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("No photos found. Please try some different search item.");
      console.error(error);
      setLoading(false);
    }
  }, [currentPage, searchKey]); 

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setCurrentPage(1);
    setSearchKey((prevKey) => prevKey + 1); 
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

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-button ${i === currentPage ? "active-page" : ""}`}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="pagination">
        {startPage > 1 && (
          <Button onClick={() => setCurrentPage(startPage - 1)} className="pagination-button">
            «
          </Button>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <Button onClick={() => setCurrentPage(endPage + 1)} className="pagination-button">
            »
          </Button>
        )}
      </div>
    );
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
          {renderPagination()}
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
                <FaTimes size={15} />
              </button>
              <button onClick={handleDownload} className="download-button">
                <FaDownload size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="footer">
        <p className="footer-text">Developed by Yash Vara</p>
        <div className="footer-links">
          <a href="https://github.com/yashvara" target="_blank" rel="noopener noreferrer">
            <img src={githubIcon} alt="GitHub" className="footer-icon" />
          </a>
          <a href="https://www.linkedin.com/in/yash-vara-4795001b8/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinIcon} alt="LinkedIn" className="footer-icon" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default ImageSearchApp;
