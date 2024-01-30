import axios from 'axios';
import Lottie from 'lottie-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import loadingAnimation from './assets/animation/loading.json';
import searchanimation from './assets/animation/search.json';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 15;

function ImageSearchApp() {
  const searchInputRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      if (searchInputRef.current.value) {
        setErrorMsg('');
        setLoading(true);
        const { data } = await axios.get(
          `${UNSPLASH_API_URL}?query=${searchInputRef.current.value}&page=${currentPage}&per_page=${IMAGES_PER_PAGE}&client_id=${import.meta.env.VITE_API_KEY}`
        );
        setSearchResults(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
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

  const handleSelection = (selection) => {
    searchInputRef.current.value = selection;
    resetSearch();
  };

  return (
    <div className='container'>
      <div className='search-animation'>
        <Lottie animationData={searchanimation} style={{ width: '200px', height: '200px' }} />
      </div>
      <h1 className='title'>Search your images here</h1>
      {errorMsg && <p className='error-msg'>{errorMsg}</p>}
      <div className='search-section'>
        <Form onSubmit={handleSearch}>
          <Form.Control
            type='search'
            placeholder='Search here..'
            className='search-input'
            ref={searchInputRef}
          />
        </Form>
      </div>
      {loading ? (
        <div className='loading'>
          <div className='center'>
            <Lottie animationData={loadingAnimation} style={{ width: '200px', height: '200px' }} />
          </div>
        </div>
      ) : (
        <>
          <div className='images'>
            {searchResults.map((image) => (
              <img key={image.id} src={image.urls.small} alt={image.alt_description} className='image' />
            ))}
          </div>
          <div className='buttons'>
            {currentPage > 1 && (
              <Button onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            )}
            {currentPage < totalPages && (
              <Button onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageSearchApp;
